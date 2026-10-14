from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_selectors import (
    KETCHER_IFRAME,
    MACROMOLECULES_CANVAS,
    MOLECULES_CANVAS,
    SEQUENCE_ITEMS,
)
from e2e.e2e_utils import StreamlitRunner

GLYCINE_SEQUENCE_ITEMS = f"{SEQUENCE_ITEMS}[data-symbol-alias=G]"
GLYCYLGLYCINE_MONOMER_COUNT = 2

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
MACROMOLECULES_EXAMPLE_FILE = (
    ROOT_DIRECTORY / "e2e" / "apps" / "macromolecules_example.py"
)


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(MACROMOLECULES_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def test_should_open_in_macromolecules_mode(page: Page):
    frame_0 = page.frame_locator(KETCHER_IFRAME)

    expect(frame_0.locator(MACROMOLECULES_CANVAS)).to_be_visible()
    expect(frame_0.locator(MOLECULES_CANVAS)).to_be_hidden()


def test_should_load_and_return_the_peptide(page: Page):
    frame_0 = page.frame_locator(KETCHER_IFRAME)

    expect(frame_0.locator(GLYCINE_SEQUENCE_ITEMS)).to_have_count(
        GLYCYLGLYCINE_MONOMER_COUNT
    )
    expect(page.get_by_test_id("stCode")).to_contain_text("monomerTemplate-G___Glycine")
