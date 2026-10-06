import streamlit as st

from streamlit_ketcher_editor import st_ketcher

molfile = st_ketcher("CCO", molecule_format="MOLFILE")
st.code(molfile, language=None)
