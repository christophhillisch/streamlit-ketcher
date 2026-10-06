import re
import unittest.mock
from typing import get_args

import pytest

from streamlit_ketcher import (
    SUPPORTED_MOLECULE_FORMATS,
    MoleculeFormatType,
    st_ketcher,
)

ALL_MOLECULE_FORMATS = [
    "SMILES",
    "MOLFILE",
    "KET",
    "CXSMILES",
    "INCHI",
    "INCHI_KEY",
    "SMARTS",
    "RXN",
]


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_empty(mock_render_component):
    st_ketcher()
    mock_render_component.assert_called_once_with(
        molecule="",
        height=500,
        molecule_format="SMILES",
        macromolecules=False,
        live_update=True,
        key=None,
        default="",
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_all_parameters(mock_render_component):
    st_ketcher(
        value="CC0",
        height=600,
        molecule_format="SMILES",
        macromolecules=True,
        live_update=False,
        key="key",
    )
    mock_render_component.assert_called_once_with(
        molecule="CC0",
        height=600,
        molecule_format="SMILES",
        macromolecules=True,
        live_update=False,
        key="key",
        default="CC0",
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("molecule_format", ALL_MOLECULE_FORMATS)
def test_render_molecule_format(mock_render_component, molecule_format):
    st_ketcher(molecule_format=molecule_format)
    mock_render_component.assert_called_once_with(
        molecule="",
        height=500,
        molecule_format=molecule_format,
        macromolecules=False,
        live_update=True,
        key=None,
        default="",
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("molecule_format", ["INVALID", "smiles", "__doc__", "name"])
def test_invalid_molecule_format(mock_render_component, molecule_format):
    with pytest.raises(
        ValueError,
        match=re.escape(
            f"Unsupported value for molecule format: {molecule_format!r}. "
            "Supported values: SMILES, MOLFILE, KET, CXSMILES, INCHI, INCHI_KEY, "
            "SMARTS, RXN"
        ),
    ):
        st_ketcher(molecule_format=molecule_format)
    mock_render_component.assert_not_called()


def test_molecule_format_type_matches_supported_formats():
    assert list(get_args(MoleculeFormatType)) == SUPPORTED_MOLECULE_FORMATS


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("height", [0, -100, 1.5, True, "500"])
def test_invalid_height(mock_render_component, height):
    with pytest.raises(
        ValueError,
        match=re.escape(f"Height must be a positive integer, got: {height!r}"),
    ):
        st_ketcher(height=height)
    mock_render_component.assert_not_called()


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("macromolecules", [True, False])
def test_render_macromolecules(mock_render_component, macromolecules):
    st_ketcher(macromolecules=macromolecules)
    mock_render_component.assert_called_once_with(
        molecule="",
        height=500,
        molecule_format="SMILES",
        macromolecules=macromolecules,
        live_update=True,
        key=None,
        default="",
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("macromolecules", [0, 1, "True", None])
def test_invalid_macromolecules(mock_render_component, macromolecules):
    with pytest.raises(
        ValueError,
        match=re.escape(f"Macromolecules must be a boolean, got: {macromolecules!r}"),
    ):
        st_ketcher(macromolecules=macromolecules)
    mock_render_component.assert_not_called()


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("live_update", [True, False])
def test_render_live_update(mock_render_component, live_update):
    st_ketcher(live_update=live_update)
    mock_render_component.assert_called_once_with(
        molecule="",
        height=500,
        molecule_format="SMILES",
        macromolecules=False,
        live_update=live_update,
        key=None,
        default="",
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("live_update", [0, 1, "True", None])
def test_invalid_live_update(mock_render_component, live_update):
    with pytest.raises(
        ValueError,
        match=re.escape(f"Live update must be a boolean, got: {live_update!r}"),
    ):
        st_ketcher(live_update=live_update)
    mock_render_component.assert_not_called()
