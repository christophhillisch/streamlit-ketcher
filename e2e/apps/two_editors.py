import streamlit as st

from streamlit_ketcher_editor import st_ketcher

first = st_ketcher("CCO", key="first", live_update=False)
second = st_ketcher("CCN", key="second")
st.markdown(f"First: ``{first}``")
