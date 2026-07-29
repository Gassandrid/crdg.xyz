import { toHtml } from "hast-util-to-html"
import { dump, JSON_SCHEMA, load } from "js-yaml"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { FilePath, slugifyFilePath } from "../../util/path"

type EditorData = {
  apiEndpoint: string
  baseSha: string
  lineEnding: "lf" | "crlf"
  pagePath: string
  pageTitle: string
  source: string
  attachmentPaths: Record<string, string>
  templates: PageTemplate[]
  turnstileSiteKey: string
}

type PageTemplate = {
  id: string
  label: string
  className: string
  description: string
  defaultLocation: string
  source: string
}

type EditorMode = "edit" | "create"
type EditorView = "visual" | "source" | "split"

type FrontmatterValues = {
  title?: unknown
  tags?: unknown
  aliases?: unknown
  description?: unknown
  [key: string]: unknown
}

type StoredAttachment = {
  name: string
  type: string
  lastModified: number
  blob: Blob
}

type StoredDraft = {
  baseSha: string
  mode?: EditorMode
  templateId?: string
  pagePath?: string
  pageTitle?: string
  content: string
  summary: string
  contributor: string
  discord: string
  updatedAt: number
  attachments: StoredAttachment[]
}

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      action: string
      theme: "light" | "dark" | "auto"
      callback: (token: string) => void
      "expired-callback": () => void
      "error-callback": () => void
    },
  ): string
  reset(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const MAX_IMAGES = 8
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_TOTAL_IMAGE_BYTES = 25 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
])

const previewProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm)
  .use(remarkRehype)

let turnstileLoader: Promise<TurnstileApi> | undefined

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector)
  if (!element) throw new Error(`Wiki editor is missing ${selector}`)
  return element
}

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileLoader) return turnstileLoader

  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-wiki-turnstile]")
    const script = existing ?? document.createElement("script")
    const timeout = window.setTimeout(
      () => reject(new Error("Verification took too long to load.")),
      15000,
    )

    const finish = () => {
      window.clearTimeout(timeout)
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error("Verification could not be loaded."))
    }

    script.addEventListener("load", finish, { once: true })
    script.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout)
        reject(new Error("Verification could not be loaded."))
      },
      { once: true },
    )

    if (!existing) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.dataset.wikiTurnstile = "true"
      document.head.append(script)
    }
  })

  return turnstileLoader
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("crdg-wiki-editor", 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts")) {
        request.result.createObjectStore("drafts")
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readDraft(key: string): Promise<StoredDraft | undefined> {
  const database = await openDraftDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("drafts", "readonly")
    const request = transaction.objectStore("drafts").get(key)
    request.onsuccess = () => resolve(request.result as StoredDraft | undefined)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
  })
}

async function writeDraft(key: string, draft: StoredDraft): Promise<void> {
  const database = await openDraftDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite")
    transaction.objectStore("drafts").put(draft, key)
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

async function deleteDraft(key: string): Promise<void> {
  const database = await openDraftDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite")
    transaction.objectStore("drafts").delete(key)
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

function transformOutsideFences(source: string, transform: (text: string) => string): string {
  const lines = source.split("\n")
  let fence: string | undefined
  let buffer: string[] = []
  const output: string[] = []

  const flush = () => {
    if (buffer.length > 0) output.push(...transform(buffer.join("\n")).split("\n"))
    buffer = []
  }

  for (const line of lines) {
    const match = line.match(/^\s*(`{3,}|~{3,})/)
    if (match) {
      if (!fence) {
        flush()
        fence = match[1][0]
        output.push(line)
      } else if (match[1][0] === fence) {
        output.push(line)
        fence = undefined
      } else {
        output.push(line)
      }
    } else if (fence) {
      output.push(line)
    } else {
      buffer.push(line)
    }
  }
  flush()
  return output.join("\n")
}

function slugPath(path: string): string {
  return slugifyFilePath(path.replace(/^content\//, "") as FilePath)
}

function escapeMarkdownLabel(label: string): string {
  return label.replace(/([\\\[\]])/g, "\\$1")
}

function visualSource(source: string): string {
  const body = splitFrontmatter(source).body
  return transformOutsideFences(body, (text) =>
    text
      .replace(
        /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
        (_match, rawPath: string, rawOptions: string | undefined) => {
          const path = rawPath.trim()
          const fileName = path.split("/").pop() ?? path
          const width = rawOptions?.match(/(?:^|\|)(\d{1,4})(?:x\d{1,4})?(?:$|\|)/)?.[1]
          const title = width ? ` \"obsidian-width=${width}\"` : ""
          return `![${escapeMarkdownLabel(fileName)}](</__wiki_editor_image__/${encodeURIComponent(path)}>${title})`
        },
      )
      .replace(
        /\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
        (_match, rawPath, anchor, alias) => {
          const target = `${String(rawPath).trim()}${anchor ?? ""}`
          const label = String(alias ?? target).trim()
          return `[${escapeMarkdownLabel(label)}](</__wiki_editor_link__/${encodeURIComponent(target)}>)`
        },
      )
      .replace(
        /^((?:>\s*)+)\[!([\w-]+)(?:\|[^\]]+)?\][+-]?\s*(.*)$/gm,
        (_match, quotePrefix, type, title) => {
          const label = title || String(type).replace(/-/g, " ")
          return `${quotePrefix}**CRDG_CALLOUT_${String(type).toLowerCase()}::${label}**`
        },
      )
      .replace(/==([^=\n]+)==/g, "**CRDG_HIGHLIGHT::$1**"),
  )
}

function renderVisualEditor(
  source: string,
  target: HTMLElement,
  attachmentUrls: Map<string, string>,
  attachmentPaths: Record<string, string>,
): void {
  const body = splitFrontmatter(source).body
  if (body.trim() === "") {
    target.replaceChildren()
    return
  }

  try {
    const transformed = visualSource(source)
    const markdownTree = previewProcessor.parse(transformed)
    const htmlTree = previewProcessor.runSync(markdownTree)
    target.innerHTML = toHtml(htmlTree)

    target.querySelectorAll<HTMLAnchorElement>('a[href^="/__wiki_editor_link__/"]').forEach((link) => {
      const raw = link.getAttribute("href")?.slice("/__wiki_editor_link__/".length) ?? ""
      const wikiTarget = decodeURIComponent(raw)
      const anchorIndex = wikiTarget.indexOf("#")
      const path = anchorIndex === -1 ? wikiTarget : wikiTarget.slice(0, anchorIndex)
      const anchor = anchorIndex === -1 ? "" : wikiTarget.slice(anchorIndex)
      link.dataset.wikiTarget = wikiTarget
      link.href = `/${slugPath(path)}${anchor}`
    })
    target.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      link.addEventListener("click", (event) => event.preventDefault())
    })

    target.querySelectorAll<HTMLImageElement>('img[src^="/__wiki_editor_image__/"]').forEach((image) => {
      const raw = image.getAttribute("src")?.slice("/__wiki_editor_image__/".length) ?? ""
      const path = decodeURIComponent(raw)
      const fileName = path.split("/").pop() ?? path
      const imagePath = path.includes("/") ? path : `Attachments/${path}`
      image.dataset.wikiImage = path
      image.src = attachmentUrls.get(fileName) ?? attachmentPaths[fileName] ?? `/${slugPath(imagePath)}`
    })
    target.querySelectorAll<HTMLImageElement>('img[title^="obsidian-width="]').forEach((image) => {
      const width = Number(image.title.split("=")[1])
      if (Number.isFinite(width)) {
        image.style.width = `${Math.min(width, 1400)}px`
        image.dataset.wikiWidth = String(Math.min(width, 1400))
      }
      image.removeAttribute("title")
    })

    const decorateCallout = (title: HTMLElement, type: string) => {
      title.classList.add("wiki-preview-callout-title")
      const callout = title.closest("blockquote")
      callout?.classList.add("wiki-preview-callout", `wiki-preview-callout-${type}`)
      if (callout instanceof HTMLElement) callout.dataset.calloutType = type
    }
    target.querySelectorAll<HTMLElement>("strong").forEach((element) => {
      const callout = element.textContent?.match(/^CRDG_CALLOUT_([\w-]+)::/)
      if (callout) {
        element.textContent = element.textContent?.replace(callout[0], "") ?? ""
        decorateCallout(element, callout[1])
        return
      }
      const highlight = element.textContent?.match(/^CRDG_HIGHLIGHT::/)
      if (!highlight) return
      const mark = document.createElement("mark")
      mark.dataset.wikiHighlight = "true"
      mark.textContent = element.textContent?.replace(highlight[0], "") ?? ""
      element.replaceWith(mark)
    })

    const textWalker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (textWalker.nextNode()) textNodes.push(textWalker.currentNode as Text)
    textNodes.forEach((node) => {
      const callout = node.data.match(/\*\*CRDG_CALLOUT_([\w-]+)::(.+?)\*\*/)
      if (callout && node.parentElement) {
        const title = document.createElement("strong")
        title.textContent = callout[2]
        node.replaceWith(title)
        decorateCallout(title, callout[1])
        return
      }
      const highlight = node.data.match(/\*\*CRDG_HIGHLIGHT::(.+?)\*\*/)
      if (!highlight || !node.parentElement) return
      const mark = document.createElement("mark")
      mark.dataset.wikiHighlight = "true"
      mark.textContent = highlight[1]
      node.replaceWith(mark)
    })
  } catch (error) {
    console.error("Could not render wiki visual editor", error)
    target.innerHTML = '<p class="wiki-preview-empty">Visual editing is unavailable. Switch to Source to continue.</p>'
  }
}

function escapeMarkdownText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/([*_\[\]])/g, "\\$1")
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function inlineMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeMarkdownText(node.textContent ?? "")
  if (!(node instanceof HTMLElement)) return ""

  const children = () => [...node.childNodes].map(inlineMarkdown).join("")
  switch (node.tagName) {
    case "BR":
      return "\n"
    case "STRONG":
    case "B":
      return `**${children()}**`
    case "EM":
    case "I":
      return `*${children()}*`
    case "MARK":
      return `==${children()}==`
    case "CODE": {
      const content = (node.textContent ?? "").replace(/`/g, "\\`")
      return `\`${content}\``
    }
    case "A": {
      const label = children() || node.textContent || "link"
      const wikiTarget = node.dataset.wikiTarget
      if (wikiTarget) return label === wikiTarget ? `[[${wikiTarget}]]` : `[[${wikiTarget}|${label}]]`
      return `[${label}](${node.getAttribute("href") ?? ""})`
    }
    case "IMG": {
      const wikiImage = node.dataset.wikiImage
      const width = node.dataset.wikiWidth
      if (wikiImage) return `![[${wikiImage}${width ? `|${width}` : ""}]]`
      return `![${escapeMarkdownLabel(node.getAttribute("alt") ?? "image")}](${node.getAttribute("src") ?? ""})`
    }
    case "INPUT":
      return ""
    default:
      return children()
  }
}

function listMarkdown(list: HTMLElement, depth = 0): string {
  const ordered = list.tagName === "OL"
  return [...list.children]
    .filter((child): child is HTMLLIElement => child instanceof HTMLLIElement)
    .map((item, index) => {
      const checkbox = item.querySelector<HTMLInputElement>(":scope > input[type=checkbox]")
      const nestedLists = [...item.children].filter(
        (child): child is HTMLElement => child instanceof HTMLElement && ["UL", "OL"].includes(child.tagName),
      )
      const contentNodes = [...item.childNodes].filter(
        (child) => !(child instanceof HTMLInputElement) && !(child instanceof HTMLElement && ["UL", "OL"].includes(child.tagName)),
      )
      const content = contentNodes.map(inlineMarkdown).join("").replace(/\s+/g, " ").trim() || "item"
      const marker = checkbox ? `- [${checkbox.checked ? "x" : " "}] ` : ordered ? `${index + 1}. ` : "- "
      const indent = "  ".repeat(depth)
      const nested = nestedLists.map((nestedList) => listMarkdown(nestedList, depth + 1)).join("")
      return `${indent}${marker}${content}\n${nested}`
    })
    .join("")
}

function tableMarkdown(table: HTMLTableElement): string {
  const rows = [...table.rows]
  if (rows.length === 0) return ""
  const values = rows.map((row) =>
    [...row.cells].map((cell) =>
      [...cell.childNodes]
        .map(inlineMarkdown)
        .join("")
        .replace(/\|/g, "\\|")
        .replace(/\s*\n\s*/g, " ")
        .trim(),
    ),
  )
  const width = Math.max(...values.map((row) => row.length))
  const normalized = values.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")])
  const renderRow = (row: string[]) => `| ${row.join(" | ")} |`
  return `${renderRow(normalized[0])}\n${renderRow(Array(width).fill("---"))}\n${normalized
    .slice(1)
    .map(renderRow)
    .join("\n")}\n\n`
}

function blockMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeMarkdownText(node.textContent ?? "")
  if (!(node instanceof HTMLElement)) return ""

  const inlineChildren = () => [...node.childNodes].map(inlineMarkdown).join("").trim()
  const blockChildren = () => [...node.childNodes].map(blockMarkdown).join("")
  switch (node.tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return `${"#".repeat(Number(node.tagName[1]))} ${inlineChildren()}\n\n`
    case "P":
      return `${inlineChildren()}\n\n`
    case "DIV":
      return `${blockChildren() || inlineChildren()}\n\n`
    case "UL":
    case "OL":
      return `${listMarkdown(node)}\n`
    case "BLOCKQUOTE": {
      const calloutType = node.dataset.calloutType
      const title = node.querySelector<HTMLElement>(".wiki-preview-callout-title")
      const clone = node.cloneNode(true) as HTMLElement
      clone.querySelector(".wiki-preview-callout-title")?.remove()
      const body = [...clone.childNodes].map(blockMarkdown).join("").trim()
      if (calloutType) {
        const header = `> [!${calloutType}]${title?.textContent?.trim() ? ` ${title.textContent.trim()}` : ""}`
        const quoted = body ? body.split("\n").map((line) => `> ${line}`).join("\n") : ""
        return `${header}${quoted ? `\n${quoted}` : ""}\n\n`
      }
      return `${body.split("\n").map((line) => `> ${line}`).join("\n")}\n\n`
    }
    case "PRE": {
      const code = node.textContent?.replace(/\n+$/, "") ?? ""
      return `\`\`\`\n${code}\n\`\`\`\n\n`
    }
    case "TABLE":
      return tableMarkdown(node as HTMLTableElement)
    case "HR":
      return "---\n\n"
    case "BR":
      return "\n"
    default:
      return blockChildren() || inlineMarkdown(node)
  }
}

function markdownFromVisual(root: HTMLElement): string {
  return [...root.childNodes]
    .map(blockMarkdown)
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function countWords(source: string): number {
  return source.trim() === "" ? 0 : source.trim().split(/\s+/u).length
}

type FrontmatterParts = {
  yaml: string
  body: string
  hasFrontmatter: boolean
  isClosed: boolean
}

function splitFrontmatter(source: string): FrontmatterParts {
  const normalizedSource = source.startsWith("\uFEFF") ? source.slice(1) : source
  const opening = normalizedSource.match(/^---[ \t]*(?:\r?\n|$)/)
  if (!opening) {
    return { yaml: "", body: source, hasFrontmatter: false, isClosed: true }
  }

  const remainder = normalizedSource.slice(opening[0].length)
  const closing = /(?:^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(remainder)
  if (!closing) {
    return {
      yaml: remainder.replace(/\r\n?/g, "\n"),
      body: "",
      hasFrontmatter: true,
      isClosed: false,
    }
  }

  return {
    yaml: remainder.slice(0, closing.index).replace(/\r\n?/g, "\n"),
    body: remainder.slice(closing.index + closing[0].length),
    hasFrontmatter: true,
    isClosed: true,
  }
}

function joinFrontmatter(frontmatter: string, body: string): string {
  const normalized = frontmatter.replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "")
  return normalized ? `---\n${normalized}\n---\n${body.replace(/^\n*/, "\n")}` : body
}

function parseFrontmatter(source: string): FrontmatterValues {
  const parts = splitFrontmatter(source)
  if (!parts.hasFrontmatter) return {}
  if (!parts.isClosed) {
    throw new Error('YAML frontmatter is missing its closing "---" delimiter.')
  }

  const parsed = load(parts.yaml, { schema: JSON_SCHEMA })
  if (parsed == null) return {}
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("YAML frontmatter must be a key-value mapping.")
  }
  return parsed as FrontmatterValues
}

function stringList(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ")
  return value == null ? "" : String(value)
}

function cleanPagePath(value: string): string {
  const relative = value.trim().replace(/^\/+|^content\//i, "")
  return `content/${relative}`
}

function imageExtension(type: string): string {
  const extensions: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
  }
  return extensions[type] ?? ""
}

function submissionFileName(file: File): string {
  const suppliedExtension = file.name.match(/\.[A-Za-z0-9]{2,5}$/)?.[0].toLowerCase()
  const extension = suppliedExtension ?? imageExtension(file.type)
  const stem =
    file.name
      .replace(/\.[A-Za-z0-9]{2,5}$/, "")
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9._ -]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/^[ ._-]+|[ ._-]+$/g, "")
      .slice(0, 70) || "image"
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 8)
  return `wiki-${Date.now()}-${id}-${stem}${extension}`
}

function initializeEditor(root: HTMLElement): void {
  if (root.dataset.initialized === "true") return
  root.dataset.initialized = "true"

  const controller = new AbortController()
  const { signal } = controller
  const rawData =
    requiredElement<HTMLScriptElement>(root, "[data-wiki-editor-data]").textContent ?? "{}"
  const data = JSON.parse(rawData) as EditorData
  const dialog = requiredElement<HTMLDialogElement>(root, "[data-wiki-editor-dialog]")
  const source = requiredElement<HTMLTextAreaElement>(dialog, "[data-editor-source]")
  const visual = requiredElement<HTMLElement>(dialog, "[data-editor-visual]")
  const editorMain = requiredElement<HTMLElement>(dialog, "[data-editor-main]")
  const workspace = requiredElement<HTMLElement>(dialog, "[data-editor-workspace]")
  const review = requiredElement<HTMLElement>(dialog, "[data-editor-review]")
  const success = requiredElement<HTMLElement>(dialog, "[data-editor-success]")
  const guide = requiredElement<HTMLElement>(dialog, "[data-editor-guide]")
  const notice = requiredElement<HTMLElement>(dialog, "[data-editor-notice]")
  const stats = requiredElement<HTMLElement>(dialog, "[data-editor-stats]")
  const saveState = requiredElement<HTMLElement>(dialog, "[data-save-state]")
  const fileInput = requiredElement<HTMLInputElement>(dialog, "[data-editor-file-input]")
  const dropZone = requiredElement<HTMLElement>(dialog, "[data-drop-zone]")
  const attachmentTray = requiredElement<HTMLElement>(dialog, "[data-attachment-tray]")
  const attachmentList = requiredElement<HTMLElement>(dialog, "[data-attachment-list]")
  const summary = requiredElement<HTMLTextAreaElement>(dialog, "[data-review-summary]")
  const contributor = requiredElement<HTMLInputElement>(dialog, "[data-review-name]")
  const discord = requiredElement<HTMLInputElement>(dialog, "[data-review-discord]")
  const website = requiredElement<HTMLInputElement>(dialog, "[data-review-website]")
  const reviewError = requiredElement<HTMLElement>(dialog, "[data-review-error]")
  const wordCount = requiredElement<HTMLElement>(dialog, "[data-review-word-count]")
  const imageCount = requiredElement<HTMLElement>(dialog, "[data-review-image-count]")
  const turnstileContainer = requiredElement<HTMLElement>(dialog, "[data-turnstile-container]")
  const reviewLink = requiredElement<HTMLAnchorElement>(dialog, "[data-review-link]")
  const editorActions = requiredElement<HTMLElement>(dialog, "[data-editor-actions]")
  const reviewActions = requiredElement<HTMLElement>(dialog, "[data-review-actions]")
  const successActions = requiredElement<HTMLElement>(dialog, "[data-success-actions]")
  const submitButton = requiredElement<HTMLButtonElement>(dialog, "[data-review-submit]")
  const submitLabel = requiredElement<HTMLElement>(dialog, "[data-submit-label]")
  const submitSpinner = requiredElement<HTMLElement>(dialog, "[data-submit-spinner]")
  const editorHeading = requiredElement<HTMLElement>(dialog, "[data-editor-heading]")
  const frontmatterPanel = requiredElement<HTMLElement>(dialog, "[data-frontmatter-panel]")
  const frontmatterTitle = requiredElement<HTMLInputElement>(dialog, "[data-frontmatter-title]")
  const frontmatterTags = requiredElement<HTMLInputElement>(dialog, "[data-frontmatter-tags]")
  const frontmatterAliases = requiredElement<HTMLInputElement>(dialog, "[data-frontmatter-aliases]")
  const frontmatterDescription = requiredElement<HTMLTextAreaElement>(
    dialog,
    "[data-frontmatter-description]",
  )
  const frontmatterYaml = requiredElement<HTMLTextAreaElement>(dialog, "[data-frontmatter-yaml]")
  const pagePath = requiredElement<HTMLInputElement>(dialog, "[data-page-path]")
  const pagePathField = requiredElement<HTMLElement>(dialog, "[data-page-path-field]")
  const pageTemplate = requiredElement<HTMLSelectElement>(dialog, "[data-page-template]")
  const pageTemplateField = requiredElement<HTMLElement>(dialog, "[data-page-template-field]")
  const pageTemplateDescription = requiredElement<HTMLElement>(
    dialog,
    "[data-page-template-description]",
  )
  const reviewPage = requiredElement<HTMLElement>(dialog, "[data-review-page]")

  const attachments = new Map<string, File>()
  const attachmentUrls = new Map<string, string>()
  let visualTimer: number | undefined
  let saveTimer: number | undefined
  let restoredDraft = false
  let turnstileWidget: string | undefined
  let turnstileToken = ""
  let submitted = false
  let mode: EditorMode = "edit"
  let activeBaseSha = data.baseSha
  let activeLineEnding: "lf" | "crlf" = data.lineEnding
  let currentPagePath = data.pagePath
  let currentPageTitle = data.pageTitle
  let syncingFrontmatter = false
  let activeView: EditorView = "visual"
  let splitFocus: "visual" | "source" = "visual"
  let visualDirty = false
  let visualSelection: Range | undefined
  let activeTemplate = data.templates[0]

  const pageNameFromTitle = (title: string) =>
    `${title.trim().replace(/[\\/:*?"<>|]+/g, "-") || "New page"}.md`

  const templatePagePath = (template: PageTemplate, title: string) => {
    const name = pageNameFromTitle(title)
    return template.defaultLocation ? `${template.defaultLocation}/${name}` : name
  }

  const defaultTemplatePath = () => templatePagePath(activeTemplate, currentPageTitle)

  const templateInitialTitle = (template: PageTemplate) => {
    try {
      const title = parseFrontmatter(template.source).title
      return typeof title === "string" && title.trim() ? title.trim() : "New page"
    } catch {
      return "New page"
    }
  }

  const applyTemplate = (template: PageTemplate) => {
    activeTemplate = template
    currentPageTitle = templateInitialTitle(template)
    source.value = template.source
    pagePath.value = templatePagePath(template, currentPageTitle)
    currentPagePath = cleanPagePath(pagePath.value)
    pageTemplateDescription.textContent = template.description
    editorHeading.textContent = `Create a new ${template.label.toLowerCase()}`
    reviewPage.textContent = currentPageTitle
    updateFrontmatterFields()
    renderAttachments()
    updateAfterSourceEdit()
  }

  source.value = data.source

  const updateFrontmatterFields = () => {
    if (syncingFrontmatter) return
    syncingFrontmatter = true
    try {
      const parts = splitFrontmatter(source.value)
      frontmatterYaml.value = parts.yaml
      const values = parseFrontmatter(source.value)
      frontmatterTitle.value = values.title == null ? currentPageTitle : String(values.title)
      frontmatterTags.value = stringList(values.tags)
      frontmatterAliases.value = stringList(values.aliases)
      frontmatterDescription.value = values.description == null ? "" : String(values.description)
    } catch {
      // Keep the last valid structured values while raw YAML is being corrected.
    } finally {
      syncingFrontmatter = false
    }
  }

  const updateFrontmatter = (key: string, value: string | string[]) => {
    if (syncingFrontmatter) return
    try {
      const parts = splitFrontmatter(source.value)
      const values = parseFrontmatter(source.value)
      if (Array.isArray(value) ? value.length === 0 : value.trim() === "") delete values[key]
      else values[key] = value
      const rendered = dump(values, { lineWidth: -1, noRefs: true, sortKeys: false }).trimEnd()
      source.value = joinFrontmatter(rendered, parts.body)
      frontmatterYaml.value = rendered
      if (key === "title" && typeof value === "string" && value.trim()) {
        currentPageTitle = value.trim()
        editorHeading.textContent = `${mode === "create" ? "Create" : "Edit"} ${currentPageTitle}`
        reviewPage.textContent = currentPageTitle
      }
      updateAfterSourceEdit()
    } catch (error) {
      showNotice(
        error instanceof Error ? `Frontmatter error: ${error.message}` : "Invalid frontmatter.",
      )
    }
  }

  const showNotice = (message: string) => {
    notice.textContent = message
    notice.hidden = false
  }

  const hideNotice = () => {
    notice.hidden = true
    notice.textContent = ""
  }

  const showReviewError = (message: string) => {
    reviewError.textContent = message
    reviewError.hidden = false
  }

  const hideReviewError = () => {
    reviewError.hidden = true
    reviewError.textContent = ""
  }

  const updateCounts = () => {
    const words = countWords(source.value)
    stats.textContent = `${words.toLocaleString()} words · ${source.value.length.toLocaleString()} characters`
    wordCount.textContent = words.toLocaleString()
    imageCount.textContent = attachments.size.toLocaleString()
  }

  const scheduleVisualRender = () => {
    if (visualTimer !== undefined) window.clearTimeout(visualTimer)
    visualTimer = window.setTimeout(() => {
      if (activeView === "visual" || activeView === "split") {
        visualDirty = false
        renderVisualEditor(source.value, visual, attachmentUrls, data.attachmentPaths)
      }
      visualTimer = undefined
    }, 120)
  }

  const syncVisualToSource = () => {
    if (!visualDirty) return
    const parts = splitFrontmatter(source.value)
    source.value = joinFrontmatter(parts.yaml, markdownFromVisual(visual))
    visualDirty = false
    updateFrontmatterFields()
  }

  const persistDraft = async () => {
    saveState.textContent = "Saving draft…"
    saveState.classList.add("is-saving")
    try {
      await writeDraft(mode === "create" ? "new-page" : data.pagePath, {
        baseSha: activeBaseSha,
        mode,
        templateId: mode === "create" ? activeTemplate.id : undefined,
        pagePath: currentPagePath,
        pageTitle: currentPageTitle,
        content: source.value,
        summary: summary.value,
        contributor: contributor.value,
        discord: discord.value,
        updatedAt: Date.now(),
        attachments: [...attachments.values()].map((file) => ({
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          blob: file,
        })),
      })
      saveState.textContent = "Draft saved"
    } catch (error) {
      console.warn("Could not save wiki editor draft", error)
      saveState.textContent = "Draft not saved"
    } finally {
      saveState.classList.remove("is-saving")
    }
  }

  const scheduleSave = () => {
    saveState.textContent = "Unsaved changes"
    if (saveTimer !== undefined) window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      void persistDraft()
      saveTimer = undefined
    }, 650)
  }

  const changed = () => mode === "create" || source.value !== data.source || attachments.size > 0

  const updateAfterSourceEdit = () => {
    updateCounts()
    scheduleVisualRender()
    scheduleSave()
  }

  const updateAfterVisualEdit = () => {
    visualDirty = true
    syncVisualToSource()
    updateCounts()
    scheduleSave()
  }

  const insertText = (replacement: string, selectStart?: number, selectEnd?: number) => {
    const start = source.selectionStart
    const end = source.selectionEnd
    source.setRangeText(replacement, start, end, "end")
    if (selectStart !== undefined) {
      source.setSelectionRange(start + selectStart, start + (selectEnd ?? selectStart))
    }
    source.focus()
    updateAfterSourceEdit()
  }

  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const selected = source.value.slice(source.selectionStart, source.selectionEnd)
    const body = selected || placeholder
    insertText(`${before}${body}${after}`, before.length, before.length + body.length)
  }

  const prefixSelectedLines = (prefix: string, numbered = false) => {
    const start = source.value.lastIndexOf("\n", Math.max(0, source.selectionStart - 1)) + 1
    const nextNewline = source.value.indexOf("\n", source.selectionEnd)
    const end = nextNewline === -1 ? source.value.length : nextNewline
    const selected = source.value.slice(start, end) || "item"
    const lines = selected
      .split("\n")
      .map((line, index) => `${numbered ? `${index + 1}. ` : prefix}${line}`)
    source.setSelectionRange(start, end)
    insertText(lines.join("\n"))
  }

  const heading = (level: number) => {
    const start = source.value.lastIndexOf("\n", Math.max(0, source.selectionStart - 1)) + 1
    const end = source.value.indexOf("\n", source.selectionEnd)
    const lineEnd = end === -1 ? source.value.length : end
    const selected = source.value.slice(start, lineEnd).replace(/^#{1,6}\s+/, "") || "Heading"
    source.setSelectionRange(start, lineEnd)
    const prefix = `${"#".repeat(level)} `
    insertText(`${prefix}${selected}`, prefix.length, prefix.length + selected.length)
  }

  const setView = (view: EditorView) => {
    if ((activeView === "visual" || activeView === "split") && visualDirty) {
      syncVisualToSource()
    }
    activeView = view
    editorMain.dataset.view = view
    dialog.querySelectorAll<HTMLElement>("[data-editor-view]").forEach((button) => {
      const selected = button.dataset.editorView === view
      button.classList.toggle("is-active", selected)
      button.setAttribute("aria-selected", String(selected))
      button.tabIndex = selected ? 0 : -1
    })
    if (view === "visual") {
      splitFocus = "visual"
      visualDirty = false
      visualSelection = undefined
      renderVisualEditor(source.value, visual, attachmentUrls, data.attachmentPaths)
      visual.focus()
    } else if (view === "source") {
      splitFocus = "source"
      source.focus()
    } else {
      visualDirty = false
      visualSelection = undefined
      renderVisualEditor(source.value, visual, attachmentUrls, data.attachmentPaths)
      splitFocus = "source"
      source.focus()
    }
  }

  const renderAttachments = () => {
    attachmentList.replaceChildren()
    attachmentTray.hidden = attachments.size === 0
    for (const [name] of attachments) {
      const item = document.createElement("div")
      item.className = "wiki-editor-attachment"
      const image = document.createElement("img")
      image.src = attachmentUrls.get(name) ?? ""
      image.alt = ""
      const label = document.createElement("span")
      label.textContent = name
      label.title = name
      const remove = document.createElement("button")
      remove.type = "button"
      remove.textContent = "×"
      remove.title = `Remove ${name}`
      remove.ariaLabel = `Remove ${name}`
      remove.addEventListener(
        "click",
        () => {
          attachments.delete(name)
          const url = attachmentUrls.get(name)
          if (url) URL.revokeObjectURL(url)
          attachmentUrls.delete(name)
          const embed = `![[${name}]]`
          source.value = source.value
            .split("\n")
            .filter((line) => line.trim() !== embed)
            .join("\n")
          renderAttachments()
          if (activeView === "visual") {
            visualDirty = false
            renderVisualEditor(source.value, visual, attachmentUrls, data.attachmentPaths)
          }
          updateAfterSourceEdit()
        },
        { signal },
      )
      item.append(image, label, remove)
      attachmentList.append(item)
    }
    updateCounts()
  }

  const captureVisualSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (!visual.contains(range.commonAncestorContainer)) return
    visualSelection = range.cloneRange()
  }

  const restoreVisualSelection = () => {
    visual.focus()
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    if (visualSelection && visual.contains(visualSelection.commonAncestorContainer)) {
      selection.addRange(visualSelection)
      return
    }
    const range = document.createRange()
    range.selectNodeContents(visual)
    range.collapse(false)
    selection.addRange(range)
  }

  const insertVisualHtml = (html: string) => {
    restoreVisualSelection()
    document.execCommand("insertHTML", false, html)
    captureVisualSelection()
    updateAfterVisualEdit()
  }

  const selectedVisualText = () => {
    restoreVisualSelection()
    return window.getSelection()?.toString().trim() ?? ""
  }

  const runVisualCommand = (command: string, value?: string) => {
    restoreVisualSelection()
    document.execCommand(command, false, value)
    captureVisualSelection()
    updateAfterVisualEdit()
  }

  const wrapVisualSelection = (tagName: "code" | "mark", placeholder: string) => {
    restoreVisualSelection()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const wrapper = document.createElement(tagName)
    if (tagName === "mark") wrapper.dataset.wikiHighlight = "true"
    if (range.collapsed) {
      wrapper.textContent = placeholder
      range.insertNode(wrapper)
    } else {
      try {
        range.surroundContents(wrapper)
      } catch {
        wrapper.append(range.extractContents())
        range.insertNode(wrapper)
      }
    }
    selection.removeAllRanges()
    const next = document.createRange()
    next.selectNodeContents(wrapper)
    selection.addRange(next)
    captureVisualSelection()
    updateAfterVisualEdit()
  }

  const visualPaneIsActive = () =>
    activeView === "visual" || (activeView === "split" && splitFocus === "visual")

  const addImages = (incoming: File[]) => {
    hideNotice()
    const accepted: File[] = []
    let totalBytes = [...attachments.values()].reduce((total, file) => total + file.size, 0)
    for (const file of incoming) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        showNotice(`${file.name} was skipped. Use PNG, JPEG, GIF, WebP, or AVIF images.`)
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        showNotice(`${file.name} was skipped because images must be 10 MB or smaller.`)
        continue
      }
      if (attachments.size + accepted.length >= MAX_IMAGES) {
        showNotice(`An edit can include up to ${MAX_IMAGES} images.`)
        break
      }
      if (totalBytes + file.size > MAX_TOTAL_IMAGE_BYTES) {
        showNotice("The images in one edit can total up to 25 MB.")
        break
      }
      const name = submissionFileName(file)
      const renamed = new File([file], name, { type: file.type, lastModified: file.lastModified })
      accepted.push(renamed)
      totalBytes += file.size
    }

    if (accepted.length === 0) return
    for (const file of accepted) {
      attachments.set(file.name, file)
      attachmentUrls.set(file.name, URL.createObjectURL(file))
    }
    if (visualPaneIsActive()) {
      const images = accepted
        .map((file) => {
          const url = attachmentUrls.get(file.name) ?? ""
          return `<p><img src="${escapeHtml(url)}" alt="${escapeHtml(file.name)}" data-wiki-image="${escapeHtml(file.name)}"></p>`
        })
        .join("")
      insertVisualHtml(images)
    } else {
      const embeds = accepted.map((file) => `![[${file.name}]]`).join("\n")
      const prefix =
        source.selectionStart > 0 && source.value[source.selectionStart - 1] !== "\n" ? "\n" : ""
      insertText(`${prefix}${embeds}\n`)
    }
    renderAttachments()
  }

  const handleAction = (action: string) => {
    if (visualPaneIsActive()) {
      switch (action) {
        case "undo":
          runVisualCommand("undo")
          break
        case "redo":
          runVisualCommand("redo")
          break
        case "h2":
          runVisualCommand("formatBlock", "h2")
          break
        case "h3":
          runVisualCommand("formatBlock", "h3")
          break
        case "bold":
          runVisualCommand("bold")
          break
        case "italic":
          runVisualCommand("italic")
          break
        case "highlight":
          wrapVisualSelection("mark", "highlighted text")
          break
        case "code":
          wrapVisualSelection("code", "code")
          break
        case "bullets":
          runVisualCommand("insertUnorderedList")
          break
        case "numbered":
          runVisualCommand("insertOrderedList")
          break
        case "task":
          insertVisualHtml('<ul><li><input type="checkbox" disabled> Task</li></ul>')
          break
        case "quote":
          runVisualCommand("formatBlock", "blockquote")
          break
        case "wikilink": {
          const label = selectedVisualText() || "Page name"
          const target = window.prompt("Wiki page name", label)
          if (!target) break
          const anchorIndex = target.indexOf("#")
          const path = anchorIndex === -1 ? target : target.slice(0, anchorIndex)
          const anchor = anchorIndex === -1 ? "" : target.slice(anchorIndex)
          insertVisualHtml(
            `<a href="/${escapeHtml(slugPath(path))}${escapeHtml(anchor)}" data-wiki-target="${escapeHtml(target)}">${escapeHtml(label)}</a>`,
          )
          break
        }
        case "link": {
          const label = selectedVisualText() || "link label"
          const url = window.prompt("Web address", "https://")?.trim()
          if (!url) break
          if (!/^(?:https?:\/\/|mailto:|\/|#)/i.test(url)) {
            showNotice("Use an http, https, mailto, relative, or anchor link.")
            break
          }
          insertVisualHtml(`<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`)
          break
        }
        case "callout":
          insertVisualHtml(
            '<blockquote class="wiki-preview-callout wiki-preview-callout-info" data-callout-type="info"><strong class="wiki-preview-callout-title">Title</strong><p>Callout text</p></blockquote>',
          )
          break
        case "table":
          insertVisualHtml(
            '<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>Item</td><td>Detail</td></tr></tbody></table><p><br></p>',
          )
          break
        case "image":
          captureVisualSelection()
          fileInput.click()
          break
      }
      return
    }

    switch (action) {
      case "undo":
        document.execCommand("undo")
        updateAfterSourceEdit()
        break
      case "redo":
        document.execCommand("redo")
        updateAfterSourceEdit()
        break
      case "h2":
        heading(2)
        break
      case "h3":
        heading(3)
        break
      case "bold":
        wrapSelection("**", "**", "bold text")
        break
      case "italic":
        wrapSelection("*", "*", "italic text")
        break
      case "highlight":
        wrapSelection("==", "==", "highlighted text")
        break
      case "code": {
        const selected = source.value.slice(source.selectionStart, source.selectionEnd)
        if (selected.includes("\n")) wrapSelection("```\n", "\n```", "code")
        else wrapSelection("`", "`", "code")
        break
      }
      case "bullets":
        prefixSelectedLines("- ")
        break
      case "numbered":
        prefixSelectedLines("", true)
        break
      case "task":
        prefixSelectedLines("- [ ] ")
        break
      case "quote":
        prefixSelectedLines("> ")
        break
      case "wikilink":
        wrapSelection("[[", "]]", "Page name")
        break
      case "link": {
        const selected = source.value.slice(source.selectionStart, source.selectionEnd) || "link label"
        insertText(`[${selected}](https://example.com)`, selected.length + 3, selected.length + 22)
        break
      }
      case "callout":
        insertText("> [!info] Title\n> Callout text", 3, 7)
        break
      case "table":
        insertText("| Name | Value |\n| --- | --- |\n| Item | Detail |\n")
        break
      case "image":
        fileInput.click()
        break
    }
  }

  const restoreDraft = async () => {
    if (restoredDraft) return
    restoredDraft = true
    try {
      const draft = await readDraft(mode === "create" ? "new-page" : data.pagePath)
      if (!draft) return
      if (draft.baseSha !== activeBaseSha) {
        await deleteDraft(mode === "create" ? "new-page" : data.pagePath)
        showNotice("The published page changed since your old draft, so the editor started fresh.")
        return
      }
      if (draft.content === data.source && draft.attachments.length === 0 && !draft.summary) return
      source.value = draft.content
      if (mode === "create" && draft.templateId) {
        activeTemplate =
          data.templates.find((template) => template.id === draft.templateId) ?? activeTemplate
        pageTemplate.value = activeTemplate.id
        pageTemplateDescription.textContent = activeTemplate.description
      }
      currentPagePath = draft.pagePath ?? currentPagePath
      currentPageTitle = draft.pageTitle ?? currentPageTitle
      editorHeading.textContent = `${mode === "create" ? "Create" : "Edit"} ${currentPageTitle}`
      reviewPage.textContent = currentPageTitle
      pagePath.value = currentPagePath.replace(/^content\//, "")
      summary.value = draft.summary
      contributor.value = draft.contributor
      discord.value = draft.discord
      for (const stored of draft.attachments) {
        const file = new File([stored.blob], stored.name, {
          type: stored.type,
          lastModified: stored.lastModified,
        })
        attachments.set(file.name, file)
        attachmentUrls.set(file.name, URL.createObjectURL(file))
      }
      renderAttachments()
      updateFrontmatterFields()
      updateCounts()
      scheduleVisualRender()
      showNotice(`Restored your draft from ${new Date(draft.updatedAt).toLocaleString()}.`)
    } catch (error) {
      console.warn("Could not restore wiki editor draft", error)
    }
  }

  const showEditor = () => {
    workspace.hidden = false
    review.hidden = true
    success.hidden = true
    editorActions.hidden = false
    reviewActions.hidden = true
    successActions.hidden = true
    updateCounts()
    scheduleVisualRender()
  }

  const configureMode = (nextMode: EditorMode) => {
    mode = nextMode
    submitted = false
    restoredDraft = false
    attachments.clear()
    attachmentUrls.forEach((url) => URL.revokeObjectURL(url))
    attachmentUrls.clear()
    summary.value = ""
    if (mode === "create") {
      activeBaseSha = ""
      activeLineEnding = "lf"
      activeTemplate =
        data.templates.find((template) => template.id === pageTemplate.value) ?? data.templates[0]
      currentPageTitle = templateInitialTitle(activeTemplate)
      currentPagePath = cleanPagePath(templatePagePath(activeTemplate, currentPageTitle))
      source.value = activeTemplate.source
      pagePath.value = templatePagePath(activeTemplate, currentPageTitle)
      pagePathField.hidden = false
      pageTemplateField.hidden = false
      pageTemplateDescription.textContent = activeTemplate.description
      frontmatterPanel.hidden = false
      editorHeading.textContent = `Create a new ${activeTemplate.label.toLowerCase()}`
    } else {
      activeBaseSha = data.baseSha
      activeLineEnding = data.lineEnding
      currentPageTitle = data.pageTitle
      currentPagePath = data.pagePath
      source.value = data.source
      pagePath.value = data.pagePath.replace(/^content\//, "")
      pagePathField.hidden = true
      pageTemplateField.hidden = true
      frontmatterPanel.hidden = true
      editorHeading.textContent = `Edit ${data.pageTitle}`
    }
    reviewPage.textContent = currentPageTitle
    updateFrontmatterFields()
    renderAttachments()
    setView("visual")
    showEditor()
  }

  const ensureTurnstile = async () => {
    if (turnstileWidget) return
    if (!data.turnstileSiteKey) {
      showReviewError(
        "Submissions are temporarily unavailable while the maintainer finishes setup.",
      )
      return
    }
    try {
      const turnstile = await loadTurnstile()
      turnstileWidget = turnstile.render(turnstileContainer, {
        sitekey: data.turnstileSiteKey,
        action: "wiki_edit",
        theme: "auto",
        callback: (token) => {
          turnstileToken = token
          hideReviewError()
        },
        "expired-callback": () => {
          turnstileToken = ""
        },
        "error-callback": () => {
          turnstileToken = ""
          showReviewError("Verification failed to load. Check your connection and try again.")
        },
      })
    } catch (error) {
      showReviewError(error instanceof Error ? error.message : "Verification could not be loaded.")
    }
  }

  const openReview = () => {
    if (activeView === "visual") syncVisualToSource()
    hideNotice()
    hideReviewError()
    if (!changed()) {
      showNotice("Make a change before sending this page for review.")
      return
    }
    try {
      parseFrontmatter(source.value)
    } catch (error) {
      frontmatterPanel.hidden = false
      showNotice(
        error instanceof Error
          ? `Fix the frontmatter YAML: ${error.message}`
          : "Fix the frontmatter YAML before submitting.",
      )
      return
    }
    currentPageTitle = frontmatterTitle.value.trim()
    if (!currentPageTitle) {
      frontmatterPanel.hidden = false
      showNotice("Add a page title before submitting.")
      frontmatterTitle.focus()
      return
    }
    if (mode === "create") {
      currentPagePath = cleanPagePath(pagePath.value)
      if (!currentPagePath.endsWith(".md")) {
        frontmatterPanel.hidden = false
        showNotice("The new page path must end in .md.")
        pagePath.focus()
        return
      }
    }
    reviewPage.textContent = currentPageTitle
    workspace.hidden = true
    review.hidden = false
    success.hidden = true
    editorActions.hidden = true
    reviewActions.hidden = false
    successActions.hidden = true
    updateCounts()
    summary.focus()
    void ensureTurnstile()
  }

  const resetTurnstile = () => {
    turnstileToken = ""
    if (turnstileWidget && window.turnstile) window.turnstile.reset(turnstileWidget)
  }

  const submit = async () => {
    hideReviewError()
    const summaryValue = summary.value.trim()
    if (summaryValue.length < 10) {
      showReviewError("Please describe the change in at least a few words.")
      summary.focus()
      return
    }
    if (!turnstileToken) {
      showReviewError("Please complete the verification before sending your edit.")
      return
    }

    const form = new FormData()
    form.set("operation", mode)
    form.set("pagePath", currentPagePath)
    form.set("pageTitle", currentPageTitle)
    form.set("baseSha", activeBaseSha)
    form.set("lineEnding", activeLineEnding)
    form.set("content", source.value)
    form.set("summary", summaryValue)
    form.set("contributor", contributor.value.trim())
    form.set("discord", discord.value.trim())
    form.set("website", website.value)
    form.set("turnstileToken", turnstileToken)
    form.set("submissionId", crypto.randomUUID())
    for (const file of attachments.values()) form.append("images", file, file.name)

    submitButton.disabled = true
    submitLabel.textContent = "Sending…"
    submitSpinner.hidden = false
    try {
      const endpoint = `${data.apiEndpoint.replace(/\/$/, "")}/api/submissions`
      const response = await fetch(endpoint, { method: "POST", body: form })
      const result = (await response.json().catch(() => ({}))) as {
        code?: string
        error?: string
        reviewUrl?: string
      }
      if (!response.ok) {
        if (response.status === 409) {
          if (result.code === "page_exists") {
            throw new Error("A page already exists at that path. Go back and choose another path.")
          }
          throw new Error(
            "This page changed while you were editing. Your draft is safe; reload the page before submitting it.",
          )
        }
        throw new Error(result.error ?? "The edit could not be sent. Please try again.")
      }
      if (!result.reviewUrl) throw new Error("The review was created, but its link was missing.")

      submitted = true
      await deleteDraft(mode === "create" ? "new-page" : data.pagePath).catch(() => undefined)
      reviewLink.href = result.reviewUrl
      workspace.hidden = true
      review.hidden = true
      success.hidden = false
      editorActions.hidden = true
      reviewActions.hidden = true
      successActions.hidden = false
    } catch (error) {
      showReviewError(error instanceof Error ? error.message : "The edit could not be sent.")
      resetTurnstile()
    } finally {
      submitButton.disabled = false
      submitLabel.textContent = "Send for review"
      submitSpinner.hidden = true
    }
  }

  const closeDialog = () => {
    if (activeView === "visual" || activeView === "split") syncVisualToSource()
    if (!submitted) void persistDraft()
    dialog.close()
  }

  root.querySelectorAll<HTMLElement>("[data-wiki-editor-open]").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        configureMode(button.dataset.editorMode === "create" ? "create" : "edit")
        dialog.showModal()
        void restoreDraft()
        if (activeView === "visual") visual.focus()
        else if (activeView === "source") source.focus()
        else if (splitFocus === "visual") visual.focus()
        else source.focus()
      },
      { signal },
    )
  })

  dialog.querySelectorAll<HTMLElement>("[data-wiki-editor-close]").forEach((button) => {
    button.addEventListener("click", closeDialog, { signal })
  })
  dialog.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault()
      closeDialog()
    },
    { signal },
  )
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) closeDialog()
    },
    { signal },
  )

  source.addEventListener(
    "focus",
    () => {
      splitFocus = "source"
    },
    { signal },
  )
  visual.addEventListener(
    "focus",
    () => {
      splitFocus = "visual"
    },
    { signal },
  )

  source.addEventListener(
    "input",
    () => {
      updateFrontmatterFields()
      updateAfterSourceEdit()
    },
    { signal },
  )
  visual.addEventListener(
    "input",
    () => {
      captureVisualSelection()
      updateAfterVisualEdit()
    },
    { signal },
  )
  visual.addEventListener(
    "keydown",
    (event) => {
      const command = event.metaKey || event.ctrlKey
      if (command && event.key.toLowerCase() === "b") {
        event.preventDefault()
        handleAction("bold")
      } else if (command && event.key.toLowerCase() === "i") {
        event.preventDefault()
        handleAction("italic")
      } else if (command && event.key === "Enter") {
        event.preventDefault()
        openReview()
      }
    },
    { signal },
  )
  source.addEventListener(
    "keydown",
    (event) => {
      const command = event.metaKey || event.ctrlKey
      if (command && event.key.toLowerCase() === "b") {
        event.preventDefault()
        handleAction("bold")
      } else if (command && event.key.toLowerCase() === "i") {
        event.preventDefault()
        handleAction("italic")
      } else if (command && event.key === "Enter") {
        event.preventDefault()
        openReview()
      } else if (event.key === "Tab") {
        event.preventDefault()
        insertText("  ")
      }
    },
    { signal },
  )

  dialog.querySelectorAll<HTMLElement>("[data-editor-action]").forEach((button) => {
    button.addEventListener(
      "mousedown",
      (event) => {
        if (visualPaneIsActive()) {
          captureVisualSelection()
          event.preventDefault()
        }
      },
      { signal },
    )
    button.addEventListener("click", () => handleAction(button.dataset.editorAction ?? ""), {
      signal,
    })
  })
  const viewTabs = [...dialog.querySelectorAll<HTMLButtonElement>("[data-editor-view]")]
  viewTabs.forEach((button) => {
    button.addEventListener(
      "click",
      () => setView((button.dataset.editorView ?? "visual") as EditorView),
      { signal },
    )
    button.addEventListener(
      "keydown",
      (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return
        event.preventDefault()
        const direction = event.key === "ArrowRight" ? 1 : -1
        const index = viewTabs.indexOf(button)
        const next = viewTabs[(index + direction + viewTabs.length) % viewTabs.length]
        setView((next.dataset.editorView ?? "visual") as EditorView)
        next.focus()
      },
      { signal },
    )
  })
  requiredElement<HTMLElement>(dialog, "[data-guide-toggle]").addEventListener(
    "click",
    () => {
      guide.hidden = !guide.hidden
    },
    { signal },
  )
  requiredElement<HTMLElement>(dialog, "[data-guide-close]").addEventListener(
    "click",
    () => {
      guide.hidden = true
    },
    { signal },
  )
  requiredElement<HTMLElement>(dialog, "[data-frontmatter-toggle]").addEventListener(
    "click",
    () => {
      frontmatterPanel.hidden = !frontmatterPanel.hidden
    },
    { signal },
  )
  frontmatterTitle.addEventListener(
    "input",
    () => {
      const wasDefaultPath = pagePath.value === defaultTemplatePath()
      updateFrontmatter("title", frontmatterTitle.value)
      if (mode === "create" && wasDefaultPath && frontmatterTitle.value.trim()) {
        pagePath.value = templatePagePath(activeTemplate, frontmatterTitle.value)
        currentPagePath = cleanPagePath(pagePath.value)
      }
    },
    { signal },
  )
  pageTemplate.addEventListener(
    "change",
    () => {
      if (mode !== "create") return
      const template = data.templates.find((candidate) => candidate.id === pageTemplate.value)
      if (!template) return
      if (
        source.value !== activeTemplate.source &&
        !window.confirm("Replace the current page draft with this template?")
      ) {
        pageTemplate.value = activeTemplate.id
        return
      }
      applyTemplate(template)
    },
    { signal },
  )
  frontmatterTags.addEventListener(
    "input",
    () =>
      updateFrontmatter(
        "tags",
        frontmatterTags.value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    { signal },
  )
  frontmatterAliases.addEventListener(
    "input",
    () =>
      updateFrontmatter(
        "aliases",
        frontmatterAliases.value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    { signal },
  )
  frontmatterDescription.addEventListener(
    "input",
    () => updateFrontmatter("description", frontmatterDescription.value),
    { signal },
  )
  frontmatterYaml.addEventListener(
    "input",
    () => {
      const parts = splitFrontmatter(source.value)
      source.value = joinFrontmatter(frontmatterYaml.value, parts.body)
      try {
        parseFrontmatter(source.value)
        hideNotice()
        updateFrontmatterFields()
      } catch (error) {
        showNotice(
          error instanceof Error
            ? `Frontmatter error: ${error.message}`
            : "Invalid frontmatter YAML.",
        )
      }
      updateAfterSourceEdit()
    },
    { signal },
  )
  pagePath.addEventListener(
    "input",
    () => {
      currentPagePath = cleanPagePath(pagePath.value)
      scheduleSave()
    },
    { signal },
  )

  fileInput.addEventListener(
    "change",
    () => {
      addImages([...(fileInput.files ?? [])])
      fileInput.value = ""
    },
    { signal },
  )
  visual.addEventListener(
    "paste",
    (event) => {
      const images = [...(event.clipboardData?.files ?? [])].filter((file) =>
        file.type.startsWith("image/"),
      )
      event.preventDefault()
      if (images.length > 0) {
        captureVisualSelection()
        addImages(images)
        return
      }
      document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") ?? "")
      updateAfterVisualEdit()
    },
    { signal },
  )
  source.addEventListener(
    "paste",
    (event) => {
      const images = [...(event.clipboardData?.files ?? [])].filter((file) =>
        file.type.startsWith("image/"),
      )
      if (images.length > 0) {
        event.preventDefault()
        addImages(images)
      }
    },
    { signal },
  )
  dropZone.addEventListener(
    "dragover",
    (event) => {
      event.preventDefault()
      dropZone.classList.add("is-dragging")
    },
    { signal },
  )
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-dragging"), { signal })
  dropZone.addEventListener(
    "drop",
    (event) => {
      event.preventDefault()
      dropZone.classList.remove("is-dragging")
      addImages([...(event.dataTransfer?.files ?? [])])
    },
    { signal },
  )
  ;[summary, contributor, discord].forEach((field) =>
    field.addEventListener("input", scheduleSave, { signal }),
  )
  requiredElement<HTMLElement>(dialog, "[data-review-open]").addEventListener("click", openReview, {
    signal,
  })
  requiredElement<HTMLElement>(dialog, "[data-review-back]").addEventListener("click", showEditor, {
    signal,
  })
  submitButton.addEventListener("click", () => void submit(), { signal })

  document.addEventListener("selectionchange", captureVisualSelection, { signal })

  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (dialog.open && changed() && saveState.classList.contains("is-saving"))
      event.preventDefault()
  }
  window.addEventListener("beforeunload", beforeUnload, { signal })

  updateCounts()
  updateFrontmatterFields()
  renderVisualEditor(source.value, visual, attachmentUrls, data.attachmentPaths)
  window.addCleanup(() => {
    controller.abort()
    if (visualTimer !== undefined) window.clearTimeout(visualTimer)
    if (saveTimer !== undefined) window.clearTimeout(saveTimer)
    attachmentUrls.forEach((url) => URL.revokeObjectURL(url))
  })
}

function initializeEditors(): void {
  document.querySelectorAll<HTMLElement>("[data-wiki-editor-root]").forEach(initializeEditor)
}

document.addEventListener("nav", initializeEditors)
