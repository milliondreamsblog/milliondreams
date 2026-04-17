import { exec } from "node:child_process";
import { writeFileSync } from "node:fs";

exec("npm run build", { encoding: "utf8", maxBuffer: 10 ** 7 }, (_err, stdout, stderr) => {
    writeFileSync("build_err.log", `${stdout}\n\nSTDERR:\n\n${stderr}`);
});
