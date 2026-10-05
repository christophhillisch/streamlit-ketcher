KETCHER_IFRAME = r'iframe[title="streamlit_ketcher\.streamlit_ketcher"]'

# Ketcher 3 renders both the molecules and macromolecules editors in the DOM,
# so selectors must target the visible (molecules) one.
SELECTION_TOOL = "[data-testid=left-toolbar-buttons] [data-testid=select-rectangle]"
MOLECULES_CANVAS = "[data-testid=ketcher-canvas][data-canvasmode=molecules-mode]"
BENZENE_TEMPLATE = "[data-testid=template-0]"
MACROMOLECULES_TOGGLE = "[data-testid=polymer-toggler]"
CANVAS_ATOMS = f"{MOLECULES_CANVAS} [data-testid=atom]"
