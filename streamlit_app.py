import streamlit as st

from streamlit_ketcher_editor import SUPPORTED_MOLECULE_FORMATS, st_ketcher

DEFAULT_MOLECULE = (
    r"C[N+]1=CC=C(/C2=C3\C=CC(=N3)/C(C3=CC=CC(C(N)=O)=C3)=C3/C=C/C(=C(\C4=CC=[N+]"
    "(C)C=C4)C4=N/C(=C(/C5=CC=CC(C(N)=O)=C5)C5=CC=C2N5)C=C4)N3)C=C1"
)
MIN_HEIGHT = 300
MAX_HEIGHT = 900
DEFAULT_HEIGHT = 500
HEIGHT_STEP = 50

st.set_page_config(layout="wide")
st.title("`streamlit-ketcher-editor`")
st.caption("One editor per page is supported, so the options below share it.")

with st.sidebar:
    molecule_format = st.selectbox("Output format", SUPPORTED_MOLECULE_FORMATS)
    live_update = st.toggle("Live update", value=True)
    height = st.slider(
        "Height (px)", MIN_HEIGHT, MAX_HEIGHT, DEFAULT_HEIGHT, step=HEIGHT_STEP
    )

with st.echo():
    molecule = st.text_input("Molecule", DEFAULT_MOLECULE)
    result = st_ketcher(
        molecule,
        height=height,
        molecule_format=molecule_format,
        live_update=live_update,
    )

st.markdown(f"**{molecule_format} output:**")
st.code(result or "")
