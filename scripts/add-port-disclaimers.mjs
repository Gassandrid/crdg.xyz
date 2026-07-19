#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const write = process.argv.includes("--write")
const callout = `> [!note] Migrated article
> This page was ported from the old MediaWiki and cleaned with AI. It may still contain formatting or factual issues; edits are encouraged.
`

const renamed = {
  Alien_Tech: "content/Components/Alien Technology/index.md",
  Antigrav: "content/Components/Manifest Components/Anti-Gravity Device.md",
  Assemblies: "content/Contraptions/index.md",
  Beehive: "content/Features/Beehive.md",
  Bill: "content/Features/Bill.md",
  Bosses: "content/Bosses/index.md",
  "Calvin's_Wacky_Fun_Facts!": "content/Player Content/Calvin's Wacky Fun Facts!.md",
  Cart_Dealership: "content/Map/Cart Dealership.md",
  Cart_ride_hell: "content/Events/Cart ride hell.md",
  Carts: "content/Features/Carts.md",
  Destabilization_system: "content/Contraptions/Destabilization system.md",
  Explosion: "content/Features/Explosion.md",
  Fishing_Rod_Clearer: "content/Contraptions/Fishing Rod Clearer.md",
  Glass: "content/Items/Regular Items/Glass.md",
  Gold: "content/Components/Miscellaneous/Gold.md",
  History: "content/Features/History.md",
  Honeycomb: "content/Components/Miscellaneous/Honeycomb.md",
  Hot_Coco: "content/Items/Regular Items/Hot Coco.md",
  How_To_Beat_The_Game: "content/Tutorials/How to Beat the Game.md",
  Input_Receiver: "content/Components/Regular Components/Input Reciever.md",
  Items: "content/Items/index.md",
  Knife_trap: "content/Features/Knife trap.md",
  LED_light: "content/Components/Regular Components/LED light.md",
  Locations: "content/Map/index.md",
  Main_Page: "content/index.md",
  Major_Updates: "content/Events/Major Updates.md",
  NPCs: "content/Features/NPCs.md",
  Nuclear_motor: "content/Components/Regular Components/Nuclear motor.md",
  Private_server: "content/Tutorials/Private server.md",
  Rubber_slab: "content/Components/Regular Components/Rubber slab.md",
  Rusty_Battery: "content/Items/Regular Items/Rusty Battery.md",
  Sequencer: "content/Contraptions/Sequencer.md",
  Spawnoid: "content/Player Content/Spawnoid.md",
  Spray_paint: "content/Items/Regular Items/Spray paint.md",
  Tastes: "content/Features/Tastes.md",
  Teddy_Bear: "content/Items/Regular Items/Teddy Bear.md",
  Teeth_Pulsar: "content/Contraptions/Teeth Pulsar.md",
  The_Cakerbaker: "content/Features/The Cakerbaker.md",
  The_Mothership: "content/Features/The Mothership.md",
  Trailers: "content/Features/Trailers.md",
  Traps: "content/Features/Traps.md",
  Trick_Or_Treat_Bucket: "content/Items/Exclusive Items/Trick Or Treat Bucket.md",
  Vending_machine_items: "content/Items/Vending machine items.md",
  Wiki_Rules: "content/Tutorials/Wiki/Wiki Rules.md",
  Glue: "content/Items/Regular Items/Glue.md",
  Makarov: "content/Items/Regular Items/Makarov.md",
  Portable_Cart: "content/Items/Regular Items/portable cart.md",
  Mantra_ray: "content/Fish/Manta ray.md",
  Sea_otter: "content/Fish/Otter.md",
  Anglerfish: "content/Fish/Anglerfish.md",
  "Pup_fish_(not_exclusive)": "content/Fish/Pupfish.md",
  "Poseidon's_Fishing_Rod": "content/Fish/Poseidon's Rod.md",
  Livyatan: "content/Fish/Livyathan.md",
  Narwhal: "content/Fish/Narhwal.md",
  Mahimahi: "content/Fish/Mahi Mahi.md",
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(child) : child
  })
}

function normalized(file) {
  return path.basename(file, ".md").normalize("NFKD").replace(/[_\W]+/g, "").toLowerCase()
}

function insertCallout(markdown) {
  if (markdown.includes("> [!note] Migrated article")) return markdown
  const frontmatter = markdown.match(/^---\n[\s\S]*?\n---\n*/)?.[0] ?? ""
  const body = markdown.slice(frontmatter.length).replace(/^\n+/, "")
  return `${frontmatter}${frontmatter ? "\n" : ""}${callout}\n${body}`
}

const current = walk("content").filter((file) => file.endsWith(".md"))
const byName = new Map()
for (const file of current) {
  const key = normalized(file)
  if (!byName.has(key)) byName.set(key, [])
  byName.get(key).push(file)
}

const legacyFiles = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD", "content/Old Wiki"], { encoding: "utf8" })
  .trim().split("\n").filter((file) => file.endsWith(".md"))
const targets = new Set()

for (const source of legacyFiles) {
  const name = path.basename(source, ".md")
  const sourceText = execFileSync("git", ["show", `HEAD:${source}`], { encoding: "utf8" })
  const namespaced = source.split("/").some((part) => /^(Module|Template|Category|Talk|User|User.talk|MediaWiki|Cart_ride_around_a_75KW_Diesel_Generator_wiki)[:]/i.test(part))
  const redirect = /^\s*(?:1\.\s*)?REDIRECT\b/im.test(sourceText)
  if (namespaced || redirect || name === "Queue_for_spam_articles" || name === "Cart_ride_around_a_75KW_Diesel_Generator_wiki_Policy") continue

  const explicit = renamed[name]
  if (explicit && fs.existsSync(explicit)) {
    targets.add(explicit)
    continue
  }
  const matches = byName.get(normalized(source)) ?? []
  if (matches.length === 1) targets.add(matches[0])
}

let changed = 0
for (const file of [...targets].sort()) {
  const original = fs.readFileSync(file, "utf8")
  const updated = insertCallout(original)
  if (updated === original) continue
  changed += 1
  console.log(`${write ? "updated" : "would update"}: ${file}`)
  if (write) fs.writeFileSync(file, updated)
}

console.log(`${write ? "updated" : "would update"} ${changed} of ${targets.size} ported notes`)
