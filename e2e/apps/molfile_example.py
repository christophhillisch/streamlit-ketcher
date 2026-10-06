import streamlit as st

from streamlit_ketcher import st_ketcher

molfile = st_ketcher("CCO", molecule_format="MOLFILE")
st.code(molfile, language=None)
