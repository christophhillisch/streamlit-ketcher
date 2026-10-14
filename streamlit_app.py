from pathlib import Path

import streamlit as st

from streamlit_ketcher_editor import SUPPORTED_MOLECULE_FORMATS, st_ketcher

DEMO_DIRECTORY = Path(__file__).parent / "demo"
DEFAULT_MOLECULE = (
    r"C[N+]1=CC=C(/C2=C3\C=CC(=N3)/C(C3=CC=CC(C(N)=O)=C3)=C3/C=C/C(=C(\C4=CC=[N+]"
    "(C)C=C4)C4=N/C(=C(/C5=CC=CC(C(N)=O)=C5)C5=CC=C2N5)C=C4)N3)C=C1"
)
PEPTIDE_EXAMPLE = "Leu-enkephalin (peptide)"
EXAMPLE_MOLECULES = {
    "Small molecule": DEFAULT_MOLECULE,
    PEPTIDE_EXAMPLE: DEMO_DIRECTORY.joinpath("leu-enkephalin.ket").read_text(),
}
PEPTIDE_FORMAT = "KET"
MIN_HEIGHT = 300
MAX_HEIGHT = 900
DEFAULT_HEIGHT = 500
HEIGHT_STEP = 50

st.set_page_config(layout="wide")
st.title("`streamlit-ketcher-editor`")
st.caption("One editor per page is supported, so the options below share it.")

with st.sidebar:
    example = st.selectbox("Example", list(EXAMPLE_MOLECULES))
    is_peptide_example = example == PEPTIDE_EXAMPLE
    default_format_index = (
        SUPPORTED_MOLECULE_FORMATS.index(PEPTIDE_FORMAT) if is_peptide_example else 0
    )
    molecule_format = st.selectbox(
        "Output format", SUPPORTED_MOLECULE_FORMATS, index=default_format_index
    )
    live_update = st.toggle("Live update", value=True)
    height = st.slider(
        "Height (px)", MIN_HEIGHT, MAX_HEIGHT, DEFAULT_HEIGHT, step=HEIGHT_STEP
    )

if is_peptide_example:
    st.info(
        "Leu-enkephalin, a pentapeptide. Pick *Macromolecules* in the menu at the "
        "right end of the top toolbar to edit it as a chain of monomers. "
        "Only KET keeps the monomers, so KET is selected as the output format."
    )

with st.echo():
    molecule = st.text_input("Molecule", EXAMPLE_MOLECULES[example])
    result = st_ketcher(
        molecule,
        height=height,
        molecule_format=molecule_format,
        macromolecules=True,
        live_update=live_update,
    )

st.markdown(f"**{molecule_format} output:**")
st.code(result or "")
