import streamlit as st

from streamlit_ketcher import st_ketcher

first = st_ketcher("CCO", key="first")
second = st_ketcher("CCN", key="second")
st.markdown(f"First: ``{first}``")
