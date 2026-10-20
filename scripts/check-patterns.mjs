import { readdirSync, readFileSync, existsSync } from "node:fs";
const files = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + f.name;
    if (f.isDirectory()) walk(p);
    else if (/\.[cm]?[jt]sx?$/.test(p)) files.push(p);
  }
}
walk("apps");
walk("packages");
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const [rule, pattern] of [
    ["unsafe HTML", /dangerouslySetInnerHTML|innerHTML\s*=/],
    ["explicit any", /:\s*any\b|as\s+any\b/],
    ["private key", /-----BEGIN .*PRIVATE KEY/],
  ])
    if (pattern.test(s)) throw Error(rule + ": " + f);
}
console.log("PASS source boundaries: " + files.length + " files");
