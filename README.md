# Hifi Monorepo [![Coverage Status](https://coveralls.io/repos/github/hifi-finance/hifi/badge.svg?branch=main)](https://coveralls.io/github/hifi-finance/hifi?branch=main) [![Yarn](https://img.shields.io/badge/maintained%20with-yarn-2d8dbb.svg)](https://yarnpkg.com/) [![Styled with Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io) [![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![license: LGPL3.0](https://img.shields.io/badge/license-LGPL3.0-yellow.svg)](https://opensource.org/licenses/lgpl-3.0)

Monorepo implementing the Hifi fixed-rate, fixed-term lending protocol. In-depth documentation is available at [docs.hifi.finance](https://docs.hifi.finance).

## Packages

The Hifi protocol is maintained as a [yarn workspaces](https://yarnpkg.com/features/workspaces) monorepo. Check out the
README associated to each package for detailed usage instructions.

### Public

| Package                                        | Description                                                    |
| ---------------------------------------------- | -------------------------------------------------------------- |
| [`@hifi/amm`](/packages/amm)                   | Dedicated AMM for market-making hTokens                        |
| [`@hifi/flash-swap`](/packages/flash-swap)     | Flash swap implementations for liquidating underwater accounts |
| [`@hifi/protocol`](/packages/protocol)         | The core Hifi fixed-rate, fixed-term lending protocol          |
| [`@hifi/proxy-target`](/packages/proxy-target) | DSProxy target contract with stateless scripts                 |

### Private

| Package                                  | Description                                   |
| ---------------------------------------- | --------------------------------------------- |
| [`@hifi/constants`](/packages/deployers) | Constants shared across Hifi packages         |
| [`@hifi/deployers`](/packages/deployers) | Deployer scripts for the Hifi smart contracts |
| [`@hifi/helpers`](/packages/deployers)   | Helper functions shared across Hifi packages  |

## Contributing

Feel free to dive in! [Open](https://github.com/hifi-finance/hifi/issues/new) an issue,
[start](https://github.com/hifi-finance/hifi/discussions/new) a discussion or submit a PR. For any concerns or
feedback, join us on [Discord](https://discord.gg/mhtSRz6).

### Pre Requisites

You will need the following software on your machine:

- [x] [Git](https://git-scm.com/downloads)
- [x] [Node.Js](https://nodejs.org/en/download/)
- [x] [Yarn](https://yarnpkg.com/getting-started/install)

In addition, familiarity with [Solidity](https://soliditylang.org/), [TypeScript](https://typescriptlang.org/) and [Hardhat](https://hardhat.org) is requisite.

### Set Up

Install the dependencies:

```bash
$ yarn install
```

Then, follow the `.env.example` file to add the requisite environment variables in the `.env` file, and run the watcher:

```bash
$ yarn watch
```

Now you can start making changes.

## Security

For security concerns, please email [security@hifi.finance](mailto:security@hifi.finance). This repository is subject to the Hifi bug bounty program, per the terms defined [here](https://docs.hifi.finance/getting-started/security#bug-bounty).

## License

[LGPL v3](./LICENSE.md) © Mainframe Group Inc.
