# streamlit-ketcher-editor frontend

React 19 + [Ketcher](https://github.com/epam/ketcher), built with [Vite](https://vite.dev)
and tested with [Vitest](https://vitest.dev).

## Requirements

- Node.js version from [`.nvmrc`](../.nvmrc) (Ketcher requires Node 24.14.1 or newer)
- Yarn 1 (`npm install --global yarn`)

## Scripts

| Command          | What it does                                                        |
| ---------------- | ------------------------------------------------------------------- |
| `yarn install`   | Install dependencies                                                |
| `yarn start`     | Start the dev server with hot reload on http://localhost:3000       |
| `yarn test`      | Run unit tests in watch mode (`yarn test --run` for a single run)   |
| `yarn typecheck` | Type-check with TypeScript                                          |
| `yarn build`     | Type-check and build into `../streamlit_ketcher_editor/frontend`           |
| `yarn format`    | Format sources with Prettier                                        |

## Developing against a Streamlit app

The Python package serves the production build by default. To use the dev
server instead, start it and point the package at it:

```shell
yarn start
```

```shell
# In a second terminal, from the repository root
STREAMLIT_KETCHER_EDITOR_DEV_SERVER_URL=http://localhost:3000 streamlit run streamlit_app.py
```

On Windows PowerShell, set the variable with
`$env:STREAMLIT_KETCHER_EDITOR_DEV_SERVER_URL = "http://localhost:3000"` first.
