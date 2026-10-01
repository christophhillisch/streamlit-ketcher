import re
import unittest.mock

import pytest

from streamlit_ketcher import st_ketcher


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_empty(mock_render_component):
    st_ketcher()
    mock_render_component.assert_called_once_with(
        molecule="", height=500, molecule_format="SMILES", key=None, default=""
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_all_parameters(mock_render_component):
    st_ketcher(value="CC0", height=600, molecule_format="SMILES", key="key")
    mock_render_component.assert_called_once_with(
        molecule="CC0", height=600, molecule_format="SMILES", key="key", default="CC0"
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("molecule_format", ["SMILES", "MOLFILE"])
def test_render_molecule_format(mock_render_component, molecule_format):
    st_ketcher(molecule_format=molecule_format)
    mock_render_component.assert_called_once_with(
        molecule="", height=500, molecule_format=molecule_format, key=None, default=""
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("molecule_format", ["INVALID", "smiles", "__doc__", "name"])
def test_invalid_molecule_format(mock_render_component, molecule_format):
    with pytest.raises(
        ValueError,
        match=re.escape(
            f"Unsupported value for molecule format: {molecule_format!r}. "
            "Supported values: SMILES, MOLFILE"
        ),
    ):
        st_ketcher(molecule_format=molecule_format)
    mock_render_component.assert_not_called()


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("height", [0, -100, 1.5, True, "500"])
def test_invalid_height(mock_render_component, height):
    with pytest.raises(
        ValueError,
        match=re.escape(f"Height must be a positive integer, got: {height!r}"),
    ):
        st_ketcher(height=height)
    mock_render_component.assert_not_called()
