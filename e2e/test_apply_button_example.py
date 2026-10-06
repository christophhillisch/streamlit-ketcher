from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_utils import StreamlitRunner

MOLECULES_CANVAS = "[data-testid=ketcher-canvas][data-canvasmode=molecules-mode]"
CANVAS_ATOMS = f"{MOLECULES_CANVAS} [data-testid=atom]"
ETHANOL_ATOM_COUNT = 3

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
APPLY_BUTTON_EXAMPLE_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "apply_button_example.py"


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(APPLY_BUTTON_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    expect(page.get_by_role("img", name="Running...")).to_be_hidden()


def test_should_send_changes_only_on_apply(page: Page):
    frame_0 = page.frame_locator(
        r'iframe[title="streamlit_ketcher\.streamlit_ketcher"]'
    )
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)

    frame_0.get_by_role("button", name="Reset").click()
    expect(frame_0.locator(CANVAS_ATOMS)).to_have_count(0)
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: CCO")

    frame_0.get_by_role("button", name="Apply").click()
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: ````")
