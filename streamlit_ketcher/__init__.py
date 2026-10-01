from enum import Enum
from pathlib import Path
from typing import Optional
from typing_extensions import Literal
import streamlit.components.v1 as components

# Running this module directly (`streamlit run streamlit_ketcher/__init__.py`)
# serves the component from the frontend dev server instead of the build.
_IS_DEV = "__main__" == __name__

if _IS_DEV:
    _render_component = components.declare_component(
        "streamlit_ketcher",
        url="http://localhost:3000",
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


def st_ketcher(
    value: Optional[str] = "",
    *,
    height: int = DEFAULT_HEIGHT,
    molecule_format: Literal["SMILES", "MOLFILE"] = MoleculeFormat.SMILES.value,
    key: Optional[str] = None,
) -> Optional[str]:
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
        If ``molecule_format`` is not one of the supported formats.
    """
    if molecule_format not in SUPPORTED_MOLECULE_FORMATS:
        raise ValueError(
            f"Unsupported value for molecule format: {molecule_format!r}. "
            f"Supported values: {', '.join(SUPPORTED_MOLECULE_FORMATS)}"
        )
    return _render_component(
        molecule=value,
        height=height,
        molecule_format=molecule_format,
        key=key,
        default=value,
    )


if _IS_DEV:
    import streamlit as st

    st.set_page_config(layout="wide")
    st.title("`st_ketcher`")

    st.header("Component with user input")
    DEFAULT_MOL = (
        r"C[N+]1=CC=C(/C2=C3\C=CC(=N3)/C(C3=CC=CC(C(N)=O)=C3)=C3/C=C/C(=C(\C4=CC=[N+]"
        "(C)C=C4)C4=N/C(=C(/C5=CC=CC(C(N)=O)=C5)C5=CC=C2N5)C=C4)N3)C=C1"
    )
    with st.echo():
        molecule = st.text_input("Molecule", DEFAULT_MOL)
        smile_code = st_ketcher(molecule)
        st.markdown(f"Smile code: ``{smile_code}``")

    st.write("---")

    st.header("Components with custom height")
    with st.echo():
        st_ketcher("CCO", height=400)
        st_ketcher("CCO", height=800)

    st.header("Components with `molfile` format")
    with st.echo():
        molfile = st_ketcher(molecule_format="MOLFILE")
        st.markdown("molfile:")
        st.code(molfile)
