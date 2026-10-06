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

## Options

| Argument          | Default    | Description                                                                 |
| ----------------- | ---------- | --------------------------------------------------------------------------- |
| `value`           | `""`       | Molecule shown when the editor first renders.                               |
| `height`          | `500`      | Height of the editor in pixels.                                             |
| `molecule_format` | `"SMILES"` | Format of the returned molecule. See [Molecule formats](#molecule-formats). |
| `macromolecules`  | `False`    | Show Ketcher's switch to the Macromolecules mode (RNA, DNA and peptides).   |
| `live_update`     | `True`     | Send the drawing while the user draws. See [Live update](#live-update).     |
| `key`             | `None`     | Unique key for the widget.                                                  |

The Macromolecules mode is hidden by default, which matches the behaviour
before Ketcher 3. Enable it with:

```python
smile_code = st_ketcher(molecule, macromolecules=True)
```

## Live update

By default the editor sends the molecule to Python while the user draws, so
the returned value always matches the canvas. Changes are debounced by 300 ms,
because every value sent reruns the whole script. In this mode the editor has
no Apply button; Reset clears the canvas and sends an empty value.

For scripts that are slow to rerun, turn live update off. The editor then
shows an Apply button and sends the molecule only when it is clicked:

```python
smile_code = st_ketcher(molecule, live_update=False)
```

## Dark theme

The loading screen, the frame around the editor and the Reset/Apply buttons
follow the Streamlit theme. Ketcher itself has no dark theme, so the drawing
area stays light; in a dark app it sits inside a frame so the contrast looks
deliberate.

## Molecule formats

`value` accepts any format Ketcher can read; Ketcher detects it automatically.
`molecule_format` sets the format of the returned molecule:

| `molecule_format` | Returned format                                        |
| ----------------- | ------------------------------------------------------ |
| `"SMILES"`        | Daylight SMILES                                        |
| `"CXSMILES"`      | ChemAxon extended SMILES (keeps stereo, R-groups, ...) |
| `"MOLFILE"`       | MDL Molfile                                            |
| `"KET"`           | Ketcher's native JSON format                           |
| `"INCHI"`         | IUPAC InChI                                            |
| `"INCHI_KEY"`     | InChIKey (output only: it cannot be loaded back)       |
| `"SMARTS"`        | Daylight SMARTS                                        |
| `"RXN"`           | MDL Rxnfile (needs a reaction arrow on the canvas)     |

```python
inchi = st_ketcher("InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3", molecule_format="INCHI")
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
