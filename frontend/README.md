# streamlit-ketcher frontend

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
| `yarn build`     | Type-check and build into `../streamlit_ketcher/frontend`           |
| `yarn format`    | Format sources with Prettier                                        |
| `yarn lint:js`   | Lint with ESLint (typescript-eslint and React hooks rules)          |

## TypeScript 7 and ESLint

`tsc` is TypeScript 7, which ships no JavaScript API. typescript-eslint needs
that API, so `typescript` is aliased to `@typescript/typescript6` and TypeScript 7
is installed as `@typescript/native`, which still provides the `tsc` binary.
Remove the alias once typescript-eslint supports TypeScript 7.

## Developing against a Streamlit app

The Python package serves the production build by default. To use the dev
server instead, start it and point the package at it:

```shell
yarn start
```

```shell
# In a second terminal, from the repository root
STREAMLIT_KETCHER_DEV_SERVER_URL=http://localhost:3000 streamlit run streamlit_app.py
```

On Windows PowerShell, set the variable with
`$env:STREAMLIT_KETCHER_DEV_SERVER_URL = "http://localhost:3000"` first.
