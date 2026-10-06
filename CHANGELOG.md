# Changelog

## 0.1.0

First release of this fork of
[mik-laj/streamlit-ketcher](https://github.com/mik-laj/streamlit-ketcher) 0.0.2.

### Breaking changes

- The package is published as `streamlit-ketcher-editor` and imported as
  `streamlit_ketcher_editor`:
  `from streamlit_ketcher_editor import st_ketcher`.
- Requires Python 3.14 or newer and Streamlit 1.64 or newer.
- Upgraded to Ketcher 3.18, which has a new user interface.
- The editor sends the drawing while the user draws, and the Apply button is
  gone. Pass `live_update=False` to keep the previous behaviour.
- The dev server variable is now `STREAMLIT_KETCHER_EDITOR_DEV_SERVER_URL`.

### Added

- `molecule_format` returns KET, CXSMILES, InChI, InChIKey, SMARTS and RXN
  as well as SMILES and MOLFILE.
- `macromolecules=True` shows Ketcher's Macromolecules mode.
- The loading screen, editor frame and buttons follow Streamlit's dark theme.
- A `py.typed` marker, so type checkers see the types of `st_ketcher`.

### Fixed

- Unsupported molecule formats and non-positive heights raise an error.
- Molecules that change quickly are loaded one at a time, so the latest one
  is shown.
