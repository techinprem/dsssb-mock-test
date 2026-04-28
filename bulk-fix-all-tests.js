const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

const COMMON_STYLE = `
<style id="auto-common-mock-style">
.math {
  white-space: nowrap;
  font-family: "Times New Roman", serif;
}

.frac {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  line-height: 1.2;
  margin: 0 4px;
}

.frac .top {
  display: block;
  padding: 0 4px 2px;
  border-bottom: 1.5px solid currentColor;
}

.frac .bottom {
  display: block;
  padding: 2px 4px 0;
}

sup, sub {
  line-height: 0;
}

.question-palette,
.palette-buttons,
#paletteButtons,
#questionPalette,
.palette-grid,
.question-buttons {
  max-height: 420px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  body {
    font-size: 15px;
  }

  .exam-container,
  .main-container,
  .test-container,
  .quiz-container,
  .content-wrapper {
    display: block !important;
    width: 100% !important;
  }

  .side-panel,
  .question-palette,
  .palette-panel,
  .right-panel {
    width: 100% !important;
    max-height: 260px;
    overflow-y: auto;
    margin-top: 10px;
  }

  button {
    min-height: 38px;
    font-size: 14px;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>
`;

const HOME_BUTTON = `
<a href="index.html" data-auto-home-button style="
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 99999;
  background: #0b5ed7;
  color: #ffffff;
  padding: 8px 13px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
">Home</a>
`;

function getAllHtmlFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === ".git" || item === "node_modules" || item === ".github") {
        continue;
      }
      files = files.concat(getAllHtmlFiles(fullPath));
    } else if (
      item.toLowerCase().endsWith(".html") &&
      item.toLowerCase() !== "index.html"
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function addCommonStyle(html) {
  if (html.includes("auto-common-mock-style")) return html;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${COMMON_STYLE}\n</head>`);
  }

  return COMMON_STYLE + "\n" + html;
}

function addHomeButton(html) {
  if (html.includes("data-auto-home-button")) return html;

  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>\n${HOME_BUTTON}`);
  }

  return HOME_BUTTON + "\n" + html;
}

function convertLatexFractions(html) {
  return html.replace(
    /\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
    `<span class="math"><span class="frac"><span class="top">$1</span><span class="bottom">$2</span></span></span>`
  );
}

function convertLatexSymbols(html) {
  html = convertLatexFractions(html);

  html = html.replace(/\$([^$]+)\$/g, `<span class="math">$1</span>`);

  html = html.replace(/\^\{([^{}]+)\}/g, `<sup>$1</sup>`);
  html = html.replace(/\^2/g, `<sup>2</sup>`);
  html = html.replace(/\^3/g, `<sup>3</sup>`);
  html = html.replace(/\^n/g, `<sup>n</sup>`);

  html = html.replace(/_\{([^{}]+)\}/g, `<sub>$1</sub>`);
  html = html.replace(/_([0-9])/g, `<sub>$1</sub>`);

  html = html.replace(/\\sqrt\s*\{([^{}]+)\}/g, `√($1)`);

  html = html.replace(/\\times/g, `×`);
  html = html.replace(/\\div/g, `÷`);
  html = html.replace(/\\leq/g, `≤`);
  html = html.replace(/\\geq/g, `≥`);
  html = html.replace(/\\neq/g, `≠`);
  html = html.replace(/\\approx/g, `≈`);
  html = html.replace(/\\infty/g, `∞`);
  html = html.replace(/\\pi/g, `π`);
  html = html.replace(/\\theta/g, `θ`);
  html = html.replace(/\\alpha/g, `α`);
  html = html.replace(/\\beta/g, `β`);
  html = html.replace(/\\gamma/g, `γ`);
  html = html.replace(/\\Delta/g, `Δ`);

  return html;
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = addCommonStyle(html);
  html = addHomeButton(html);
  html = convertLatexSymbols(html);

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log("Updated:", path.relative(ROOT, filePath));
  } else {
    console.log("No change:", path.relative(ROOT, filePath));
  }
}

const files = getAllHtmlFiles(ROOT);

console.log("Total test HTML files found:", files.length);

for (const file of files) {
  processFile(file);
}

console.log("All test files updated successfully.");