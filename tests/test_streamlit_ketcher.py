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


def _expected_mount_call(
    *,
    molecule: str | None = "",
    height: int = 500,
    molecule_format: str = "SMILES",
    macromolecules: bool = False,
    key: str | None = None,
) -> unittest.mock._Call:
    return unittest.mock.call(
        key=key,
        data={
            "molecule": molecule,
            "height": height,
            "molecule_format": molecule_format,
            "macromolecules": macromolecules,
        },
        default={"molecule": molecule},
        on_molecule_change=unittest.mock.ANY,
    )


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_empty(mock_render_component):
    st_ketcher()
    assert mock_render_component.call_args_list == [_expected_mount_call()]


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_render_all_parameters(mock_render_component):
    st_ketcher(
        value="CC0",
        height=600,
        molecule_format="SMILES",
        macromolecules=True,
        key="key",
    )
    assert mock_render_component.call_args_list == [
        _expected_mount_call(molecule="CC0", height=600, macromolecules=True, key="key")
    ]


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("molecule_format", ALL_MOLECULE_FORMATS)
def test_render_molecule_format(mock_render_component, molecule_format):
    st_ketcher(molecule_format=molecule_format)
    assert mock_render_component.call_args_list == [
        _expected_mount_call(molecule_format=molecule_format)
    ]


@unittest.mock.patch("streamlit_ketcher._render_component")
def test_returns_molecule_from_component_state(mock_render_component):
    mock_render_component.return_value = {"molecule": "C1=CC=CC=C1"}
    assert st_ketcher("CCO") == "C1=CC=CC=C1"


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
    assert mock_render_component.call_args_list == [
        _expected_mount_call(macromolecules=macromolecules)
    ]


@unittest.mock.patch("streamlit_ketcher._render_component")
@pytest.mark.parametrize("macromolecules", [0, 1, "True", None])
def test_invalid_macromolecules(mock_render_component, macromolecules):
    with pytest.raises(
        ValueError,
        match=re.escape(f"Macromolecules must be a boolean, got: {macromolecules!r}"),
    ):
        st_ketcher(macromolecules=macromolecules)
    mock_render_component.assert_not_called()
