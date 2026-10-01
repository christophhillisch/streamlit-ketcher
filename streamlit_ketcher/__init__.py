from collections.abc import Callable
from enum import Enum
from functools import cache
from typing import Any, Literal

import streamlit as st

# Declared in streamlit_ketcher/pyproject.toml; paths are relative to its asset_dir.
_COMPONENT_NAME = "streamlit_ketcher.ketcher"
_COMPONENT_JS = "index.js"
_COMPONENT_CSS = "index.css"
_MOLECULE_STATE_KEY = "molecule"


@cache
def _get_component() -> Callable[..., Any]:
    """Register the frontend once per process, on first use."""
    return st.components.v2.component(
        _COMPONENT_NAME,
        js=_COMPONENT_JS,
        css=_COMPONENT_CSS,
        # Ketcher's pop-ups render into document.body, outside a shadow root.
        isolate_styles=False,
    )


def _render_component(**kwargs: Any) -> Any:
    """Mount the Ketcher component and return its state."""
    return _get_component()(**kwargs)


def _ignore_molecule_change() -> None:
    """Register the molecule state key so it is always present in the result."""


class MoleculeFormat(Enum):
    SMILES = "SMILES"
    MOLFILE = "MOLFILE"


SUPPORTED_MOLECULE_FORMATS = [
    molecule_format.value for molecule_format in MoleculeFormat
]
DEFAULT_HEIGHT = 500


def _validate_molecule_format(molecule_format: str) -> None:
    """Raise ValueError if the molecule format is not supported."""
    if molecule_format not in SUPPORTED_MOLECULE_FORMATS:
        raise ValueError(
            f"Unsupported value for molecule format: {molecule_format!r}. "
            f"Supported values: {', '.join(SUPPORTED_MOLECULE_FORMATS)}"
        )


def _validate_height(height: int) -> None:
    """Raise ValueError if the height is not a positive integer."""
    is_integer = isinstance(height, int) and not isinstance(height, bool)
    if not is_integer or height <= 0:
        raise ValueError(f"Height must be a positive integer, got: {height!r}")


def st_ketcher(
    value: str | None = "",
    *,
    height: int = DEFAULT_HEIGHT,
    molecule_format: Literal["SMILES", "MOLFILE"] = MoleculeFormat.SMILES.value,
    key: str | None = None,
) -> str | None:
    """Create a new instance of the Ketcher editor.

    Only one editor can be shown per page: Ketcher's standalone mode supports a
    single working instance per browser page. Any additional editor on the same
    page shows a notice instead until the first one is removed.

    Parameters
    ----------
    value: str
        The text value of this widget when it first renders.
        Empty string by default.
    height: int
        The height of the editor expressed in pixels.
    molecule_format: "SMILES" or "MOLFILE"
        The format of molecule representation.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    str or None
        The current content of the editor widget.

    Raises
    ------
    ValueError
        If ``molecule_format`` is not one of the supported formats, or
        ``height`` is not a positive integer.
    """
    _validate_molecule_format(molecule_format)
    _validate_height(height)
    result = _render_component(
        key=key,
        data={
            "molecule": value,
            "height": height,
            "molecule_format": molecule_format,
        },
        default={_MOLECULE_STATE_KEY: value},
        on_molecule_change=_ignore_molecule_change,
    )
    return result.get(_MOLECULE_STATE_KEY)
