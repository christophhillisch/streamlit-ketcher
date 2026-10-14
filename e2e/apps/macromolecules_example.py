from pathlib import Path

import streamlit as st

from streamlit_ketcher_editor import st_ketcher

peptide = (Path(__file__).parent / "glycylglycine.ket").read_text()
ket = st_ketcher(
    peptide,
    molecule_format="KET",
    macromolecules=True,
    initial_mode="macromolecules",
)
st.code(ket, language="json")
