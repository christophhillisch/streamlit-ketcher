from pathlib import Path

import pytest
from playwright.sync_api import Page, expect

from e2e.e2e_utils import StreamlitRunner

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
TWO_EDITORS_FILE = ROOT_DIRECTORY / "e2e" / "apps" / "two_editors.py"
COMPONENT_TEST_ID = "streamlit-ketcher"
EDITOR_READY_TIMEOUT_MS = 60_000


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(TWO_EDITORS_FILE) as runner:
        yield runner


def test_second_editor_shows_notice_and_first_still_works(
    page: Page, streamlit_app: StreamlitRunner
):
    page.goto(streamlit_app.server_url)

    expect(page.get_by_role("alert")).to_contain_text(
        "Only one Ketcher editor can be shown per page"
    )
    editor = page.get_by_test_id(COMPONENT_TEST_ID)
    expect(editor).to_have_count(1)
    apply_button = editor.get_by_role("button", name="Apply")
    expect(apply_button).to_be_enabled(timeout=EDITOR_READY_TIMEOUT_MS)
    apply_button.click()
    expect(page.get_by_text("First:")).to_have_text("First: CCO")
