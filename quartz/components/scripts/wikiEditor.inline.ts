import { toHtml } from "hast-util-to-html"
import yaml from "js-yaml"
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
  turnstileSiteKey: string
}

type EditorMode = "edit" | "create"

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

function previewSource(source: string, attachmentUrls: Map<string, string>): string {
  return transformOutsideFences(source, (text) =>
    text
      .replace(
        /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
        (_match, rawPath: string, rawOptions: string | undefined) => {
          const path = rawPath.trim()
          const fileName = path.split("/").pop() ?? path
          const localUrl = attachmentUrls.get(fileName)
          const imagePath = path.includes("/") ? path : `Attachments/${path}`
          const url = localUrl ?? `/${slugPath(imagePath)}`
          const width = rawOptions?.match(/(?:^|\|)(\d{1,4})(?:x\d{1,4})?(?:$|\|)/)?.[1]
          const title = width ? ` \"obsidian-width=${width}\"` : ""
          return `![${escapeMarkdownLabel(fileName)}](<${url}>${title})`
        },
      )
      .replace(
        /\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
        (_match, rawPath, anchor, alias) => {
          const path = String(rawPath).trim()
          const label = String(alias ?? `${path}${anchor ?? ""}`).trim()
          const href = `/${slugPath(path)}${anchor ?? ""}`
          return `[${escapeMarkdownLabel(label)}](<${href}>)`
        },
      )
      .replace(
        /^((?:>\s*)+)\[!([\w-]+)(?:\|[^\]]+)?\][+-]?\s*(.*)$/gm,
        (_match, quotePrefix, type, title) => {
          const label = title || String(type).replace(/-/g, " ")
          return `${quotePrefix}**CRDG_CALLOUT_${String(type).toLowerCase()}::${label}**`
        },
      )
      .replace(/==([^=\n]+)==/g, "**$1**"),
  )
}

function renderPreview(
  source: string,
  target: HTMLElement,
  attachmentUrls: Map<string, string>,
): void {
  if (source.trim() === "") {
    target.innerHTML = '<p class="wiki-preview-empty">Nothing to preview yet.</p>'
    return
  }

  try {
    const transformed = previewSource(source, attachmentUrls)
    const markdownTree = previewProcessor.parse(transformed)
    const htmlTree = previewProcessor.runSync(markdownTree)
    target.innerHTML = toHtml(htmlTree)

    target.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      link.target = "_blank"
      link.rel = "noopener"
    })
    target.querySelectorAll<HTMLImageElement>('img[title^="obsidian-width="]').forEach((image) => {
      const width = Number(image.title.split("=")[1])
      if (Number.isFinite(width)) image.style.width = `${Math.min(width, 1400)}px`
      image.removeAttribute("title")
    })
    const decorateCallout = (title: HTMLElement, type: string) => {
      title.classList.add("wiki-preview-callout-title")
      const callout = title.closest("blockquote")
      callout?.classList.add("wiki-preview-callout", `wiki-preview-callout-${type}`)
    }
    target.querySelectorAll<HTMLElement>("strong").forEach((title) => {
      const match = title.textContent?.match(/^CRDG_CALLOUT_([\w-]+)::/)
      if (!match) return
      title.textContent = title.textContent?.replace(match[0], "") ?? ""
      decorateCallout(title, match[1])
    })

    // A nested blockquote can occasionally keep the emphasis markers literal. Clean that fallback
    // so editor-only preview sentinels are never visible to contributors.
    const textWalker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (textWalker.nextNode()) textNodes.push(textWalker.currentNode as Text)
    textNodes.forEach((node) => {
      const match = node.data.match(/\*\*CRDG_CALLOUT_([\w-]+)::(.+?)\*\*/)
      if (!match || !node.parentElement) return
      const title = document.createElement("strong")
      title.textContent = match[2]
      node.replaceWith(title)
      decorateCallout(title, match[1])
    })
  } catch (error) {
    console.error("Could not render wiki editor preview", error)
    target.innerHTML =
      '<p class="wiki-preview-empty">Preview unavailable. Your Markdown is still safe.</p>'
  }
}

function countWords(source: string): number {
  return source.trim() === "" ? 0 : source.trim().split(/\s+/u).length
}

function splitFrontmatter(source: string): { yaml: string; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!match) return { yaml: "", body: source }
  return { yaml: match[1], body: source.slice(match[0].length) }
}

function joinFrontmatter(frontmatter: string, body: string): string {
  const normalized = frontmatter.replace(/^\n+|\n+$/g, "")
  return normalized ? `---\n${normalized}\n---\n${body.replace(/^\n*/, "\n")}` : body
}

function parseFrontmatter(source: string): FrontmatterValues {
  const parsed = yaml.load(splitFrontmatter(source).yaml, { schema: yaml.JSON_SCHEMA })
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as FrontmatterValues)
    : {}
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
  const preview = requiredElement<HTMLElement>(dialog, "[data-editor-preview]")
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
  const reviewPage = requiredElement<HTMLElement>(dialog, "[data-review-page]")

  const attachments = new Map<string, File>()
  const attachmentUrls = new Map<string, string>()
  let previewTimer: number | undefined
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
      const rendered = yaml.dump(values, { lineWidth: -1, noRefs: true, sortKeys: false }).trimEnd()
      source.value = joinFrontmatter(rendered, parts.body)
      frontmatterYaml.value = rendered
      if (key === "title" && typeof value === "string" && value.trim()) {
        currentPageTitle = value.trim()
        editorHeading.textContent = `${mode === "create" ? "Create" : "Edit"} ${currentPageTitle}`
        reviewPage.textContent = currentPageTitle
      }
      updateAfterEdit()
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

  const schedulePreview = () => {
    if (previewTimer !== undefined) window.clearTimeout(previewTimer)
    previewTimer = window.setTimeout(() => {
      renderPreview(source.value, preview, attachmentUrls)
      previewTimer = undefined
    }, 120)
  }

  const persistDraft = async () => {
    saveState.textContent = "Saving draft…"
    saveState.classList.add("is-saving")
    try {
      await writeDraft(mode === "create" ? "new-page" : data.pagePath, {
        baseSha: activeBaseSha,
        mode,
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

  const updateAfterEdit = () => {
    updateCounts()
    schedulePreview()
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
    updateAfterEdit()
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

  const setView = (view: "write" | "split" | "preview") => {
    editorMain.dataset.view = view
    dialog.querySelectorAll<HTMLElement>("[data-editor-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.editorView === view)
    })
    if (view !== "write") schedulePreview()
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
          updateAfterEdit()
        },
        { signal },
      )
      item.append(image, label, remove)
      attachmentList.append(item)
    }
    updateCounts()
  }

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
    const embeds = accepted.map((file) => `![[${file.name}]]`).join("\n")
    const prefix =
      source.selectionStart > 0 && source.value[source.selectionStart - 1] !== "\n" ? "\n" : ""
    insertText(`${prefix}${embeds}\n`)
    renderAttachments()
  }

  const handleAction = (action: string) => {
    switch (action) {
      case "undo":
        document.execCommand("undo")
        updateAfterEdit()
        break
      case "redo":
        document.execCommand("redo")
        updateAfterEdit()
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
        const selected =
          source.value.slice(source.selectionStart, source.selectionEnd) || "link label"
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
      schedulePreview()
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
    schedulePreview()
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
      currentPageTitle = "New page"
      currentPagePath = "content/New page.md"
      source.value = "---\ntitle: New page\n---\n\n"
      pagePath.value = "New page.md"
      pagePathField.hidden = false
      frontmatterPanel.hidden = false
      editorHeading.textContent = "Create a new page"
    } else {
      activeBaseSha = data.baseSha
      activeLineEnding = data.lineEnding
      currentPageTitle = data.pageTitle
      currentPagePath = data.pagePath
      source.value = data.source
      pagePath.value = data.pagePath.replace(/^content\//, "")
      pagePathField.hidden = true
      frontmatterPanel.hidden = true
      editorHeading.textContent = `Edit ${data.pageTitle}`
    }
    reviewPage.textContent = currentPageTitle
    updateFrontmatterFields()
    renderAttachments()
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
        source.focus()
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
    "input",
    () => {
      updateFrontmatterFields()
      updateAfterEdit()
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
    button.addEventListener("click", () => handleAction(button.dataset.editorAction ?? ""), {
      signal,
    })
  })
  dialog.querySelectorAll<HTMLElement>("[data-editor-view]").forEach((button) => {
    button.addEventListener(
      "click",
      () => setView((button.dataset.editorView ?? "split") as "write" | "split" | "preview"),
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
      const wasDefaultPath = pagePath.value === "New page.md"
      updateFrontmatter("title", frontmatterTitle.value)
      if (mode === "create" && wasDefaultPath && frontmatterTitle.value.trim()) {
        pagePath.value = `${frontmatterTitle.value.trim().replace(/[\\/:*?"<>|]+/g, "-")}.md`
      }
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
        yaml.load(frontmatterYaml.value, { schema: yaml.JSON_SCHEMA })
        hideNotice()
        updateFrontmatterFields()
      } catch (error) {
        showNotice(
          error instanceof Error
            ? `Frontmatter error: ${error.message}`
            : "Invalid frontmatter YAML.",
        )
      }
      updateAfterEdit()
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

  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (dialog.open && changed() && saveState.classList.contains("is-saving"))
      event.preventDefault()
  }
  window.addEventListener("beforeunload", beforeUnload, { signal })

  updateCounts()
  updateFrontmatterFields()
  renderPreview(source.value, preview, attachmentUrls)
  window.addCleanup(() => {
    controller.abort()
    if (previewTimer !== undefined) window.clearTimeout(previewTimer)
    if (saveTimer !== undefined) window.clearTimeout(saveTimer)
    attachmentUrls.forEach((url) => URL.revokeObjectURL(url))
  })
}

function initializeEditors(): void {
  document.querySelectorAll<HTMLElement>("[data-wiki-editor-root]").forEach(initializeEditor)
}

document.addEventListener("nav", initializeEditors)
