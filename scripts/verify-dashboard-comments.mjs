import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { parse } from "espree";
import postcss from "postcss";

const roots = ["src/app", "src/config", "src/shared", "src/features", "src/framework", "src/pages/Dashboard"];
function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesIn(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const files = [...roots.flatMap(filesIn).filter(file => /\.(js|jsx)$/.test(file)), "src/App.jsx", "src/pages/DashboardPage.jsx", "src/styles/dashboard.css", "src/pages/DashboardPage.css"];
function normalize(value) {
  if (Array.isArray(value)) return value.filter(item => !(item?.type === "JSXExpressionContainer" && item.expression.type === "JSXEmptyExpression") && !(item?.type === "JSXText" && !item.value.trim())).map(normalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !["start", "end", "loc", "range", "raw"].includes(key)).map(([key, item]) => [key, normalize(item)]));
  return value;
}
const snapshot = Object.fromEntries(files.map(file => {
  const source = fs.readFileSync(file, "utf8");
  if (file.endsWith(".css")) {
    const entries = [];
    postcss.parse(source).walk(node => {
      if (node.type !== "comment") entries.push([node.type, node.selector, node.name, node.params, node.prop, node.value, node.important]);
    });
    return [file, entries];
  }
  return [file, normalize(parse(source, { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } }))];
}));
const baseline = ".dashboard-comment-baseline.json";
if (process.argv.includes("--capture")) fs.writeFileSync(baseline, JSON.stringify(snapshot));
else {
  assert.deepEqual(snapshot, JSON.parse(fs.readFileSync(baseline, "utf8")));
  console.log(`PASS: ${files.length} JavaScript/JSX/CSS files parse and have unchanged executable structure after adding comments.`);
}
