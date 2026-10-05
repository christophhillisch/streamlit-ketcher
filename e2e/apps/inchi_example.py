import streamlit as st

from streamlit_ketcher import st_ketcher

molecule = st.text_input("Molecule")
inchi = st_ketcher(molecule, molecule_format="INCHI")
st.markdown(f"InChI: ``{inchi}``")
