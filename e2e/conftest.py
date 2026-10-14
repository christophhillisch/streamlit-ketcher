from collections.abc import Callable
from pathlib import Path

import pytest

SnapshotAssertionType = Callable[[bytes, str], None]

FAILED_SNAPSHOT_DIRECTORY = Path(__file__).parent / "__snapshots__" / "failures"


@pytest.fixture
def assert_snapshot(assert_snapshot: SnapshotAssertionType) -> SnapshotAssertionType:
    """Keep the screenshot that differs from its baseline for the CI artifact."""

    def compare_and_keep_failures(image: bytes, name: str) -> None:
        try:
            assert_snapshot(image, name)
        except AssertionError:
            FAILED_SNAPSHOT_DIRECTORY.mkdir(parents=True, exist_ok=True)
            (FAILED_SNAPSHOT_DIRECTORY / name).write_bytes(image)
            raise

    return compare_and_keep_failures
