module.exports = {
  arrowParens: "avoid",
  bracketSpacing: true,
  endOfLine: "auto",
  importOrder: ["<THIRD_PARTY_MODULES>", "^[./]"],
  importOrderParserPlugins: ["typescript"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports"), require.resolve("prettier-plugin-solidity")],
  printWidth: 120,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
      },
    },
    {
      files: "*.{yaml,yml}",
      options: {
        bracketSpacing: false,
      },
    },
  ],
};
