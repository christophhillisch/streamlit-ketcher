# streamlit-ketcher-editor frontend

React 19 + [Ketcher](https://github.com/epam/ketcher), built with [Vite](https://vite.dev)
(library mode) and tested with [Vitest](https://vitest.dev).

## Requirements

- Node.js version from [`.nvmrc`](../.nvmrc) (Ketcher requires Node 24.14.1 or newer)
- Yarn 1 (`npm install --global yarn`)

## Scripts

| Command          | What it does                                                        |
| ---------------- | ------------------------------------------------------------------- |
| `yarn install`   | Install dependencies                                                |
| `yarn start`     | Rebuild into `../streamlit_ketcher_editor/frontend` on every change |
| `yarn test`      | Run unit tests in watch mode (`yarn test --run` for a single run)   |
| `yarn typecheck` | Type-check with TypeScript                                          |
| `yarn build`     | Type-check and build into `../streamlit_ketcher_editor/frontend`    |
| `yarn format`    | Format sources with Prettier                                        |
| `yarn lint:js`   | Lint with ESLint (typescript-eslint and React hooks rules)          |

## TypeScript 7 and ESLint

`tsc` is TypeScript 7, which ships no JavaScript API. typescript-eslint needs
that API, so `typescript` is aliased to `@typescript/typescript6` and TypeScript 7
is installed as `@typescript/native`, which still provides the `tsc` binary.
Remove the alias once typescript-eslint supports TypeScript 7.

## Developing against a Streamlit app

The component uses [Streamlit Components v2](https://docs.streamlit.io/develop/api-reference/custom-components):
Streamlit serves the build output in `../streamlit_ketcher_editor/frontend` (declared in
`streamlit_ketcher_editor/pyproject.toml`) and reloads it when the files change. There is
no separate dev server. Run the watcher and the app side by side:

```shell
yarn start
```

```shell
# In a second terminal, from the repository root
streamlit run streamlit_app.py
```

Reload the browser tab after a rebuild to pick up the new code.
