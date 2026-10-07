from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_selectors import CANVAS_ATOMS, COMPONENT_TEST_ID
from e2e.e2e_utils import StreamlitRunner

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
    component = page.get_by_test_id(COMPONENT_TEST_ID)
    expect(component.locator(CANVAS_ATOMS)).to_have_count(ETHANOL_ATOM_COUNT)

    component.get_by_role("button", name="Reset").click()
    expect(component.locator(CANVAS_ATOMS)).to_have_count(0)
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: CCO")

    component.get_by_role("button", name="Apply").click()
    expect(page.get_by_text("Smile code")).to_have_text("Smile code: ````")
