module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  printWidth: 100,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSpacing: true,
  overrides: [
    {
      files: "*.ts",
      options: {
        parser: "typescript",
      },
    },
    {
      files: "*.tsx",
      options: {
        parser: "typescript",
      },
    },
  ],
};
