# 🧪 Streamlit Ketcher Editor

[![GitHub][github_badge]][github_link] [![PyPI][pypi_badge]][pypi_link] [![Open in Streamlit][share_badge]][share_link]

A Streamlit component for drawing chemical structures and reactions, built on
EPAM's [Ketcher](https://lifescience.opensource.epam.com/ketcher/index.html)
3 editor. Use it in drug discovery and cheminformatics apps to let users draw a
molecule and get it back as SMILES, Molfile, InChI and other formats.

This is a maintained fork of
[streamlit-ketcher](https://github.com/mik-laj/streamlit-ketcher) by Kamil
Bregula, upgraded to Ketcher 3, Python 3.14 and current Streamlit. See
[CHANGELOG.md](CHANGELOG.md) for what changed and how to migrate.

**Try it:** [live demo][share_link]

## Installation

Requires Python 3.14 or newer and Streamlit 1.64 or newer.

```shell
pip install streamlit-ketcher-editor
```

## Getting started

```python
import streamlit as st

from streamlit_ketcher_editor import st_ketcher

molecule = st.text_input("Molecule", "CCO")
smiles = st_ketcher(molecule)
st.markdown(f"SMILES: ``{smiles}``")
```

### Migrating from `streamlit-ketcher`

```shell
pip uninstall streamlit-ketcher
pip install streamlit-ketcher-editor
```

Then change the import to `from streamlit_ketcher_editor import st_ketcher`.
`st_ketcher` keeps its arguments, but it now sends the drawing while the user
draws. Pass `live_update=False` to keep the Apply button.

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
smiles = st_ketcher(molecule, macromolecules=True)
```

## Live update

By default the editor sends the molecule to Python while the user draws, so
the returned value always matches the canvas. Changes are debounced by 300 ms,
because every value sent reruns the whole script. In this mode the editor has
no Apply button; Reset clears the canvas and sends an empty value.

For scripts that are slow to rerun, turn live update off. The editor then
shows an Apply button and sends the molecule only when it is clicked:

```python
smiles = st_ketcher(molecule, live_update=False)
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

> **One editor per page.** Ketcher's standalone mode supports a single working
> editor per browser page. If an app calls `st_ketcher` more than once on the same
> page, the first editor works and the others show a notice. Use separate pages
> (`st.navigation`) for several editors.

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
See [frontend/README.md](frontend/README.md) for rebuilding the frontend on change.

## Demo

The [live demo][share_link] runs [streamlit_app.py](streamlit_app.py) on
Streamlit Community Cloud. Every push to `main` builds a wheel and pushes it,
with the demo app, to the `deploy-branch` branch, which the demo is deployed from.

## License

Apache License 2.0, see [LICENSE](LICENSE). [NOTICE](NOTICE) credits the
original project and Ketcher; [NOTICES](NOTICES) lists the licenses of the
bundled frontend dependencies.

[share_badge]: https://static.streamlit.io/badges/streamlit_badge_black_white.svg
[share_link]: https://sl-ketcher-editor.streamlit.app/

[github_badge]: https://badgen.net/badge/icon/GitHub?icon=github&color=black&label
[github_link]: https://github.com/christophhillisch/streamlit-ketcher

[pypi_badge]: https://badgen.net/pypi/v/streamlit-ketcher-editor?icon=pypi&color=black&label
[pypi_link]: https://pypi.org/project/streamlit-ketcher-editor
