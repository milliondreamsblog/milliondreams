import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

try {
    const result = execSync("npx eslint . --format json", { encoding: "utf8", maxBuffer: 10 ** 7 });
    writeFileSync("lint.json", result);
} catch (e) {
    const stdout = e instanceof Error && "stdout" in e ? e.stdout : "";
    writeFileSync("lint.json", typeof stdout === "string" ? stdout : "");
}
