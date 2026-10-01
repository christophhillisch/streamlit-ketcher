from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_utils import StreamlitRunner

# Ketcher 3 renders both the molecules and macromolecules editors in the DOM,
# so selectors must target the molecules one.
SELECTION_TOOL = "[data-testid=left-toolbar-buttons] [data-testid=select-rectangle]"
MOLECULES_CANVAS = "[data-testid=ketcher-canvas][data-canvasmode=molecules-mode]"
BENZENE_TEMPLATE = "[data-testid=template-0]"
MACROMOLECULES_TOGGLE = "[data-testid=polymer-toggler]"
CANVAS_ATOMS = f"{MOLECULES_CANVAS} [data-testid=atom]"
ETHANOL_ATOM_COUNT = 3
# Root element of the component, mounted directly in the app page.
COMPONENT_TEST_ID = "streamlit-ketcher"

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


def test_should_hide_macromolecules_toggle_by_default(page: Page):
    component = page.get_by_test_id(COMPONENT_TEST_ID)

    # Wait to Ketcher to load
    component.locator(SELECTION_TOOL).click()

    expect(component.locator(MACROMOLECULES_TOGGLE)).to_be_hidden()


def test_should_return_user_input(page: Page, assert_snapshot):
    component = page.get_by_test_id(COMPONENT_TEST_ID)

    # Wait to Ketcher to load
    component.locator(SELECTION_TOOL).click()

    # Draw benzene
    component.locator(BENZENE_TEMPLATE).click()
    component.locator(MOLECULES_CANVAS).click()
    component.locator(SELECTION_TOOL).click()

    # Assert benzene is visible
    assert_snapshot(component.screenshot(), "test_should_return_user_input.png")

    # Assert output contains benzen
    component.get_by_role("button", name="Apply").click()
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: C1C=CC=CC=1")


def test_should_render_user_input(page: Page, assert_snapshot):
    page.get_by_role("textbox", name="Molecule").click()
    page.get_by_role("textbox", name="Molecule").fill("CCO")
    page.get_by_role("textbox", name="Molecule").press("Enter")

    component = page.get_by_test_id(COMPONENT_TEST_ID)

    # Ketcher shows a loading spinner before it draws the molecule
    expect(component.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)
    component.locator(SELECTION_TOOL).click()
    assert_snapshot(component.screenshot(), "test_should_render_user_input.png")

    # Assert output contains user input
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: CCO")

    # Clear output
    component.get_by_role("button", name="Reset").click()
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()
    # Wait for the value to be set in Ketcher.
    component.locator(SELECTION_TOOL).click()
    # Pass value to Streamlit
    component.get_by_role("button", name="Apply").click()
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()

    # Assert output is empty
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: ````")
