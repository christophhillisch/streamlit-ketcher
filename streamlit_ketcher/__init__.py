import os
from enum import Enum
from pathlib import Path
from typing import Literal

import streamlit.components.v1 as components

# Set to the Vite dev server URL (e.g. http://localhost:3000) to develop the
# frontend with hot reload instead of serving the production build.
_DEV_SERVER_URL = os.environ.get("STREAMLIT_KETCHER_DEV_SERVER_URL")

if _DEV_SERVER_URL:
    _render_component = components.declare_component(
        "streamlit_ketcher", url=_DEV_SERVER_URL
    )
else:
    build_dir = Path(__file__).parent / "frontend"
    _render_component = components.declare_component(
        "streamlit_ketcher", path=str(build_dir)
    )


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
    molecule: str | None = _render_component(
        molecule=value,
        height=height,
        molecule_format=molecule_format,
        key=key,
        default=value,
    )
    return molecule
