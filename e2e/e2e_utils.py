import contextlib
import logging
import os
import shlex
import socket
import subprocess
import sys
import time
import typing
from contextlib import closing
from tempfile import TemporaryFile

import requests

LOGGER = logging.getLogger(__file__)


SERVER_START_TIMEOUT_SECONDS = 60
HEALTH_CHECK_INTERVAL_SECONDS = 1
PROCESS_STOP_TIMEOUT_SECONDS = 10


def _find_free_port() -> int:
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.bind(("", 0))  # 0 means that the OS chooses a random port
        return int(sock.getsockname()[1])


class AsyncSubprocess:
    """A context manager. Wraps subprocess. Popen to capture output safely."""

    def __init__(self, args, cwd=None, env=None):
        self.args = args
        self.cwd = cwd
        self.env = env
        self._proc = None
        self._stdout_file = None

    def read_output(self) -> str:
        if self._stdout_file is None:
            return ""
        self._stdout_file.seek(0)
        return self._stdout_file.read()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

    def start(self):
        # Start the process and capture its stdout/stderr output to a temp
        # file. We do this instead of using subprocess.PIPE (which causes the
        # Popen object to capture the output to its own internal buffer),
        # because large amounts of output can cause it to deadlock.
        self._stdout_file = TemporaryFile("w+")
        LOGGER.info("Running command: %s", shlex.join(self.args))
        self._proc = subprocess.Popen(
            self.args,
            cwd=self.cwd,
            stdout=self._stdout_file,
            stderr=subprocess.STDOUT,
            text=True,
            env={**os.environ.copy(), **self.env} if self.env else None,
        )

    def is_running(self) -> bool:
        return self._proc is not None and self._proc.poll() is None

    def stop(self):
        if self._proc is not None:
            self._proc.terminate()
            try:
                self._proc.wait(timeout=PROCESS_STOP_TIMEOUT_SECONDS)
            except subprocess.TimeoutExpired:
                self._proc.kill()
                self._proc.wait()
            self._proc = None
        if self._stdout_file is not None:
            self._stdout_file.close()
            self._stdout_file = None


class StreamlitRunner:
    def __init__(
        self, script_path: os.PathLike, server_port: typing.Optional[int] = None
    ):
        self._process = None
        self.server_port = server_port
        self.script_path = script_path

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, type, value, traceback):
        self.stop()

    def start(self):
        self.server_port = self.server_port or _find_free_port()
        self._process = AsyncSubprocess(
            [
                sys.executable,
                "-m",
                "streamlit",
                "run",
                str(self.script_path),
                f"--server.port={self.server_port}",
                "--server.headless=true",
                "--browser.gatherUsageStats=false",
                "--global.developmentMode=false",
            ]
        )
        self._process.start()
        if not self.is_server_running():
            output = self._process.read_output()
            self._process.stop()
            raise RuntimeError(f"Application failed to start. Output:\n{output}")

    def stop(self):
        if self._process is not None:
            self._process.stop()
            self._process = None

    def is_server_running(
        self, timeout_seconds: float = SERVER_START_TIMEOUT_SECONDS
    ) -> bool:
        deadline = time.monotonic() + timeout_seconds
        with requests.Session() as http_session:
            while time.monotonic() < deadline and self._process.is_running():
                with contextlib.suppress(requests.RequestException):
                    response = http_session.get(self.server_url + "/_stcore/health")
                    if response.text == "ok":
                        return True
                LOGGER.info("Waiting for Streamlit server on %s", self.server_url)
                time.sleep(HEALTH_CHECK_INTERVAL_SECONDS)
        return False

    @property
    def server_url(self):
        if not self.server_port:
            raise RuntimeError("Unknown server port")
        return f"http://localhost:{self.server_port}"
