from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_selectors import CANVAS_ATOMS, COMPONENT_TEST_ID
from e2e.e2e_utils import StreamlitRunner

ETHANOL_ATOM_COUNT = 3
ETHANOL_INCHI = "InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3"

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
INCHI_EXAMPLE_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "inchi_example.py"


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(INCHI_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def test_should_round_trip_inchi(page: Page):
    page.get_by_role("textbox", name="Molecule").fill(ETHANOL_INCHI)
    page.get_by_role("textbox", name="Molecule").press("Enter")

    component = page.get_by_test_id(COMPONENT_TEST_ID)

    # Ketcher parses the InChI and draws ethanol
    expect(component.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)

    # Live update serializes the drawn molecule back to InChI
    expect(page.get_by_text("InChI:")).to_have_text(f"InChI: {ETHANOL_INCHI}")
