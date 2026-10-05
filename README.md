# 🧪 Streamlit Ketcher

[![GitHub][github_badge]][github_link] [![PyPI][pypi_badge]][pypi_link]

Streamlit components that adds the ability to draw chemical compounds. This is a critical dependency for most drug discovery / drug design / cheminformatics applications.

It is based on [Ketcher](https://lifescience.opensource.epam.com/ketcher/index.html).

## Installation

```shell
pip install streamlit-ketcher
```

## Getting started

```python
import streamlit as st

from streamlit_ketcher import st_ketcher

molecule = st.text_input("Molecule", "CCO")
smile_code = st_ketcher(molecule)
st.markdown(f"Smile code: ``{smile_code}``")
```

## Development

Requires Python 3.14+ and the Node.js version in [`.nvmrc`](.nvmrc).

```shell
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r dev-requirements.txt
playwright install chromium

cd frontend && yarn install && yarn build && cd ..

pytest tests                        # Python unit tests
cd frontend && yarn test --run      # Frontend unit tests
pytest e2e                          # End-to-end tests in a real browser
streamlit run streamlit_app.py      # Try the component by hand
```

The e2e screenshot baselines in `e2e/__snapshots__/chromium/linux` are
Linux-only and must match the CI runner pixel for pixel. To regenerate them,
run the *Continuous Integration* workflow from the Actions tab with
*Regenerate the e2e screenshot baselines* ticked, then commit the images from
its `Snapshots` artifact.
See [frontend/README.md](frontend/README.md) for frontend hot reload.

## Demo

[![Open in Streamlit][share_badge]][share_link]

[![Preview][share_img]][share_link]

[share_badge]: https://static.streamlit.io/badges/streamlit_badge_black_white.svg
[share_link]: https://ketcher-editor.streamlit.app/
[share_img]: https://storage.googleapis.com/s4a-prod-share-preview/default/st_app_fallback_image.png

[github_badge]: https://badgen.net/badge/icon/GitHub?icon=github&color=black&label
[github_link]: https://github.com/mik-laj/streamlit-ketcher

[pypi_badge]: https://badgen.net/pypi/v/streamlit-ketcher?icon=pypi&color=black&label
[pypi_link]: https://pypi.org/project/streamlit-ketcher
