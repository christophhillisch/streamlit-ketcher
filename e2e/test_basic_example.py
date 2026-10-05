from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_utils import StreamlitRunner

# Ketcher 3 renders both the molecules and macromolecules editors in the DOM,
# so selectors must target the visible (molecules) one.
SELECTION_TOOL = "[data-testid=left-toolbar-buttons] [data-testid=select-rectangle]"
MOLECULES_CANVAS = "[data-testid=ketcher-canvas][data-canvasmode=molecules-mode]"
BENZENE_TEMPLATE = "[data-testid=template-0]"
CANVAS_ATOMS = f"{MOLECULES_CANVAS} [data-testid=atom]"
ETHANOL_ATOM_COUNT = 3

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
BASIC_EXAMPLE_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "basic_example.py"


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(BASIC_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def test_should_return_user_input(page: Page, assert_snapshot):
    frame_0 = page.frame_locator(
        'iframe[title="streamlit_ketcher\\.streamlit_ketcher"]'
    )

    # Wait to Ketcher to load
    frame_0.locator(SELECTION_TOOL).click()

    # Draw benzene
    frame_0.locator(BENZENE_TEMPLATE).click()
    frame_0.locator(MOLECULES_CANVAS).click()
    frame_0.locator(SELECTION_TOOL).click()

    # Assert benzene is visible
    assert_snapshot(
        frame_0.locator("css=body").screenshot(), "test_should_return_user_input.png"
    )

    # Assert output contains benzen
    frame_0.get_by_role("button", name="Apply").click()
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: C1C=CC=CC=1")


def test_should_render_user_input(page: Page, assert_snapshot):
    page.get_by_role("textbox", name="Molecule").click()
    page.get_by_role("textbox", name="Molecule").fill("CCO")
    page.get_by_role("textbox", name="Molecule").press("Enter")

    frame_0 = page.frame_locator(
        'iframe[title="streamlit_ketcher\\.streamlit_ketcher"]'
    )

    # Ketcher shows a loading spinner before it draws the molecule
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)
    frame_0.locator(SELECTION_TOOL).click()
    assert_snapshot(
        frame_0.locator("css=body").screenshot(), "test_should_render_user_input.png"
    )

    # Assert output contains user input
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: CCO")

    # Clear output
    frame_0.get_by_role("button", name="Reset").click()
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()
    # Wait for the value to be set in Ketcher.
    frame_0.locator(SELECTION_TOOL).click()
    # Pass value to Streamlit
    frame_0.get_by_role("button", name="Apply").click()
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()

    # Assert output is empty
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: ````")
