import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

const { version } = JSON.parse(readFileSync("package.json", "utf8"))
const info = {
  branch:
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(),
  commit:
    process.env.GITHUB_SHA ||
    execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  quartzVersion: version,
  builtAt: new Date().toISOString(),
}
writeFileSync("public/build-info.json", `${JSON.stringify(info, null, 2)}\n`)
console.log(`Built Quartz ${version} from ${info.branch}@${info.commit}`)
