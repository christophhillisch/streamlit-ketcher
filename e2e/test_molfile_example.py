import re
from collections import Counter
from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_selectors import CANVAS_ATOMS, KETCHER_IFRAME, SELECTION_TOOL
from e2e.e2e_utils import StreamlitRunner

ETHANOL_ATOM_COUNT = 3
ETHANOL_ELEMENT_COUNTS = Counter({"C": 2, "O": 1})
MOLFILE_VERSION = re.compile(r"V[23]000")
V2000_ATOM_LINE = re.compile(
    r"^\s*-?\d+\.\d+\s+-?\d+\.\d+\s+-?\d+\.\d+\s+([A-Z][a-z]?)\s", re.MULTILINE
)
V3000_ATOM_LINE = re.compile(r"^M  V30 \d+ ([A-Z][a-z]?) ", re.MULTILINE)
MOLFILE_OUTPUT = "[data-testid=stCode] code"

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
MOLFILE_EXAMPLE_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "molfile_example.py"


def count_elements(molfile: str) -> Counter[str]:
    atom_lines = V2000_ATOM_LINE.findall(molfile) + V3000_ATOM_LINE.findall(molfile)
    return Counter(atom_lines)


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(MOLFILE_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def test_should_return_molfile(page: Page):
    frame_0 = page.frame_locator(KETCHER_IFRAME)

    # Wait to Ketcher to load
    frame_0.locator(SELECTION_TOOL).click()
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)

    # Live update sends the loaded molecule without an Apply button
    output = page.locator(MOLFILE_OUTPUT)
    expect(output).to_contain_text(MOLFILE_VERSION)

    assert count_elements(output.inner_text()) == ETHANOL_ELEMENT_COUNTS
