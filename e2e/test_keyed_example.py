from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_selectors import CANVAS_ATOMS, KETCHER_IFRAME, SELECTION_TOOL
from e2e.e2e_utils import StreamlitRunner

ETHANOL_ATOM_COUNT = 3
BENZENE_ATOM_COUNT = 6

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
KEYED_EXAMPLE_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "keyed_example.py"


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(KEYED_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def enter_molecule(page: Page, molecule: str) -> None:
    molecule_input = page.get_by_role("textbox", name="Molecule")
    molecule_input.fill(molecule)
    molecule_input.press("Enter")


def test_should_update_mounted_editor(page: Page):
    frame_0 = page.frame_locator(KETCHER_IFRAME)

    # Wait to Ketcher to load
    frame_0.locator(SELECTION_TOOL).click()

    enter_molecule(page, "CCO")
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)

    # With a fixed key, Streamlit keeps the editor mounted and only the
    # sync effect can load the new molecule.
    enter_molecule(page, "c1ccccc1")
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(BENZENE_ATOM_COUNT)

    frame_0.get_by_role("button", name="Apply").click()
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: c1ccccc1")
