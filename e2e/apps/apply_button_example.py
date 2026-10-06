import streamlit as st

from streamlit_ketcher import st_ketcher

smile_code = st_ketcher("CCO", live_update=False)
st.markdown(f"Smile code: ``{smile_code}``")
