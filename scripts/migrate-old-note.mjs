#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const args = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const [key, ...value] = argument.split("=")
  return [key.replace(/^--/, ""), value.join("=")]
}))

if (!args.source || !args.destination) {
  console.error("Usage: node scripts/migrate-old-note.mjs --source=<old.md> --destination=<current.md> [--merge=true] [--delete-source=true]")
  process.exit(2)
}

function body(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n*/, "").trim()
}

function frontmatter(markdown) {
  return markdown.match(/^---\n[\s\S]*?\n---\n*/)?.[0] ?? ""
}

function cleanTarget(target) {
  return decodeURIComponent(target).split("/").at(-1).replace(/^File:/i, "").replaceAll("_", " ")
}

function convert(markdown) {
  let output = markdown.replace(/\r\n/g, "\n")
  output = output.replace(/```\{=mediawiki\}\n[\s\S]*?```\n?/g, "")
  output = output.replace(/\*\*`<big>`\{=html\}([^\n]*?)`<\/big>`\{=html\}\*\*/g, "## $1")
  output = output.replace(/`<big>`\{=html\}\*\*([^\n]*?)\*\*`<\/big>`\{=html\}/g, "## $1")
  output = output.replace(/`<big>`\{=html\}([^\n]*?)`<\/big>`\{=html\}/g, "## $1")
  output = output.replace(/`<\/?[^`]+>`\{=html\}/g, "")
  output = output.replace(/<!--\s*-->/g, "")
  output = output.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/gs, (_, alt, target) => {
    const file = cleanTarget(target.replace(/\s+/g, ""))
    return alt.trim() ? `![[${file}|${alt.replace(/\s+/g, " ").trim()}]]` : `![[${file}]]`
  })
  output = output.replace(/\{(?:width|height)="[^"]+"(?:\s+(?:width|height)="[^"]+")*\}/g, "")
  output = output.replace(/\[([^\]]+)\]\((.*?)\s+"[^"]*"\)\{\.wikilink\}/gs, (_, label, target) => {
    const note = cleanTarget(target).replace(/\.md$/, "")
    return `[[${note}|${label.replace(/\s+/g, " ")}]]`
  })
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)\{\.wikilink\}/gs, (_, label, target) => {
    const note = cleanTarget(target).replace(/\.md$/, "")
    return `[[${note}|${label.replace(/\s+/g, " ")}]]`
  })
  output = output.replace(/^<File:(.+)>\s*(.+)$/gim, (_, first, rest) => `![[${cleanTarget(`${first} ${rest}`)}]]`)
  output = output.replace(/^\s*(?:\[?Category:[^\n]+|__\w+__)\s*$/gim, "")
  output = output.replace(/\\'/g, "'").replace(/\\"/g, '"')
  return `${output.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

function normalized(value) {
  return value.toLowerCase().replace(/!\[\[[^\]]+\]\]/g, "").replace(/[^a-z0-9]+/g, " ").trim()
}

function similarity(left, right) {
  if (!left || !right) return 0
  if (left.includes(right) || right.includes(left)) return Math.min(left.length, right.length) / Math.max(left.length, right.length)
  const a = new Set(left.split(" "))
  const b = new Set(right.split(" "))
  let intersection = 0
  for (const word of a) if (b.has(word)) intersection += 1
  return intersection / Math.max(1, Math.min(a.size, b.size))
}

function merge(current, legacy) {
  const currentBlocks = body(current).split(/\n{2,}/).map(normalized).filter(Boolean)
  const legacyBlocks = legacy.trim().split(/\n{2,}/)
  const additions = []
  let pendingHeadings = []

  for (const block of legacyBlocks) {
    if (/^#{1,6}\s/.test(block)) {
      pendingHeadings.push(block)
      continue
    }
    const candidate = normalized(block)
    const duplicate = candidate && currentBlocks.some((existing) => similarity(candidate, existing) >= 0.78)
    if (duplicate || !candidate) {
      pendingHeadings = []
      continue
    }
    additions.push(...pendingHeadings, block)
    pendingHeadings = []
  }

  if (additions.length === 0) return current
  return `${current.trimEnd()}\n\n## Additional information\n\n${additions.join("\n\n")}\n`
}

const source = fs.readFileSync(args.source, "utf8")
const destination = fs.existsSync(args.destination) ? fs.readFileSync(args.destination, "utf8") : ""
const converted = convert(source)
if (body(destination) && args.merge !== "true") {
  console.error(`Refusing to overwrite non-empty destination: ${args.destination}`)
  process.exit(1)
}

fs.mkdirSync(path.dirname(args.destination), { recursive: true })
const result = body(destination)
  ? merge(destination, converted)
  : `${frontmatter(destination)}${frontmatter(destination) ? "\n" : ""}${converted}`
fs.writeFileSync(args.destination, result)
if (args["delete-source"] === "true") fs.rmSync(args.source)
console.log(`${args.source} -> ${args.destination}`)
