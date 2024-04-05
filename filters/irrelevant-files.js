function filterIrrelevantFiles(files) {
  const ignorePatterns = [
    ".git",
    "node_modules",
    ".github",
    "test",
    "tests",
    "__tests__",
    "docs",
    "examples",
    "coverage",
    ".vscode",
    "LICENSE",
    "yarn.lock",
    "package-lock.json",
    ".npmignore",
    ".gitignore",
    ".eslintrc",
    ".eslintignore",
    ".prettierrc",
    "prettier.config.js",
    ".prettierignore",
    "babel.config.js",
    "webpack.config.js",
    ".nycrc",
    "rollup.config.js",
    "tsconfig.json",
  ];

  return files.filter((file) => {
    return !ignorePatterns.some((pattern) => file.path.includes(pattern));
  });
}

module.exports = filterIrrelevantFiles;
