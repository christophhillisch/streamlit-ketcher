import streamlit as st

from streamlit_ketcher_editor import st_ketcher

molecule = st.text_input("Molecule")
smile_code = st_ketcher(molecule)
st.markdown(f"Smile code: ``{smile_code}``")
