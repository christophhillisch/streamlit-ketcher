#!/usr/bin/env python

import argparse
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

THIS_DIRECTORY = Path(__file__).parent.absolute()
FRONTEND_DIRECTORY = THIS_DIRECTORY / "frontend"
VENV_DIRECTORY = THIS_DIRECTORY / "venv"
VENV_BIN_DIRECTORY = VENV_DIRECTORY / ("Scripts" if os.name == "nt" else "bin")
PYTHON_BIN = VENV_BIN_DIRECTORY / "python"
REQUIRED_EXECUTABLES = ["node", "yarn"]


def run_verbose(cmd_args, *args, **kwargs):
    kwargs.setdefault("check", True)

    print(f"$ {shlex.join(cmd_args)}", flush=True)
    # Resolve wrappers such as yarn.cmd on Windows, which Popen does not find.
    executable = shutil.which(cmd_args[0]) or cmd_args[0]
    subprocess.run([executable, *cmd_args[1:]], *args, **kwargs)


def ensure_environment():
    try:
        subprocess.check_call(
            [sys.executable, "-m", "venv", "--help"],
            stderr=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        raise SystemExit("'venv' python module is not installed")

    if not PYTHON_BIN.exists():
        shell_cmd = shlex.join([str(__file__), "py-create-venv"])
        raise SystemExit(
            "The virtual environment does not exist.\n"
            "To create the environment run:\n"
            f"   $ {shell_cmd}"
        )

    for executable in REQUIRED_EXECUTABLES:
        if shutil.which(executable) is None:
            raise SystemExit(f"{executable!r} is not installed")


def ensure_js_modules_installed():
    run_verbose(["yarn", "install"], cwd=FRONTEND_DIRECTORY)


def cmd_py_create_venv(args):
    run_verbose([sys.executable, "-m", "venv", str(VENV_DIRECTORY)], cwd=THIS_DIRECTORY)
    run_verbose(
        [
            str(PYTHON_BIN),
            "-m",
            "pip",
            "install",
            "-r",
            str(THIS_DIRECTORY / "dev-requirements.txt"),
        ],
        cwd=THIS_DIRECTORY,
    )


def cmd_py_build(args):
    shutil.rmtree((THIS_DIRECTORY / "dist"), ignore_errors=True)
    run_verbose(
        [str(PYTHON_BIN), "-m", "pip", "install", "--upgrade", "build"],
        cwd=THIS_DIRECTORY,
    )
    run_verbose(
        [str(PYTHON_BIN), "-m", "build"],
        cwd=THIS_DIRECTORY,
    )


def cmd_py_distribute(args):
    run_verbose(
        [str(PYTHON_BIN), "-m", "pip", "install", "--upgrade", "twine"],
        cwd=THIS_DIRECTORY,
    )

    run_verbose(
        [
            str(PYTHON_BIN),
            "-m",
            "twine",
            "upload",
            "--repository",
            args.repository,
            "dist/*",
        ],
        cwd=THIS_DIRECTORY,
    )


def cmd_py_test(args):
    app_frontend = THIS_DIRECTORY / "streamlit_ketcher" / "frontend"
    if not app_frontend.exists():
        app_frontend.mkdir()

    run_verbose([str(PYTHON_BIN), "-m", "pytest", "tests"], cwd=THIS_DIRECTORY)


def cmd_js_format(args):
    files = [
        str(Path(filepath).absolute().relative_to(FRONTEND_DIRECTORY))
        for filepath in args.files
    ]
    run_verbose(["yarn", "prettier", "--write", *files], cwd=FRONTEND_DIRECTORY)


def cmd_js_build(args):
    run_verbose(["yarn", "build"], cwd=FRONTEND_DIRECTORY)


def cmd_package(args):
    cmd_js_build(args)
    cmd_py_build(args)


def get_parser():
    parser = argparse.ArgumentParser(prog=__file__)
    subparsers = parser.add_subparsers(dest="subcommand", metavar="COMMAND")
    subparsers.required = True
    subparsers.add_parser(
        "py-create-venv", help="Create virtual environment for Python."
    ).set_defaults(func=cmd_py_create_venv)
    subparsers.add_parser(
        "py-build", help="Create Python distribution files in dist/."
    ).set_defaults(func=cmd_py_build)
    py_distribute_parser = subparsers.add_parser(
        "py-distribute", help="Upload our package to PyPI"
    )
    py_distribute_parser.add_argument(
        "-r",
        "--repository",
        help=(
            "The repository (package index) to upload the package to. "
            "Should be a section in the config file (default: testpypi)."
        ),
        default="testpypi",
    )
    py_distribute_parser.set_defaults(func=cmd_py_distribute)
    subparsers.add_parser("py-test", help="Run unit tests for python.").set_defaults(
        func=cmd_py_test
    )
    subparsers.add_parser("js-build", help="Build frontend.").set_defaults(
        func=cmd_js_build
    )
    js_lint_parser = subparsers.add_parser("js-format", help="Format frontend files")
    js_lint_parser.add_argument(
        "files", nargs=argparse.REMAINDER, help="Files to check"
    )
    js_lint_parser.set_defaults(func=cmd_js_format)
    subparsers.add_parser("js-test", help="Run unit tests for frontend.").set_defaults(
        func=lambda _: run_verbose(["yarn", "test"], cwd=FRONTEND_DIRECTORY)
    )
    subparsers.add_parser(
        "package", help="Build frontend and then create a WHL package."
    ).set_defaults(func=cmd_package)
    return parser


def main():
    parser = get_parser()
    args = parser.parse_args()

    if args.subcommand != "py-create-venv":
        ensure_environment()
    if args.subcommand == "package" or args.subcommand.startswith("js-"):
        ensure_js_modules_installed()
    args.func(args)


if __name__ == "__main__":
    main()
