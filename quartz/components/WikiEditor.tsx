import { createHash } from "crypto"
import { readFileSync } from "fs"
import { QuartzComponent, QuartzComponentProps } from "./types"
import style from "./styles/wikiEditor.scss"
// @ts-ignore
import script from "./scripts/wikiEditor.inline"

const LOCAL_TURNSTILE_SITE_KEY = "1x00000000000000000000AA"

function gitBlobSha(source: Buffer): string {
  const header = Buffer.from(`blob ${source.byteLength}\0`)
  return createHash("sha1").update(header).update(source).digest("hex")
}

function dominantLineEnding(source: Buffer): "lf" | "crlf" {
  const text = source.toString("utf8")
  const crlf = text.match(/\r\n/g)?.length ?? 0
  const lf = (text.match(/\n/g)?.length ?? 0) - crlf
  return crlf > lf ? "crlf" : "lf"
}

function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

export default (() => {
  const WikiEditor: QuartzComponent = ({ fileData, ctx }: QuartzComponentProps) => {
    if (!fileData.filePath || !fileData.relativePath || !fileData.relativePath.endsWith(".md")) {
      return null
    }

    const sourceBuffer = readFileSync(fileData.filePath)
    const isLocal = Boolean(ctx.argv.serve)
    const editorData = {
      apiEndpoint:
        process.env.WIKI_EDITOR_API_URL ??
        (isLocal ? "http://localhost:8787" : "https://edit.crdg.xyz"),
      baseSha: gitBlobSha(sourceBuffer),
      lineEnding: dominantLineEnding(sourceBuffer),
      pagePath: `content/${fileData.relativePath}`,
      pageTitle: fileData.frontmatter?.title ?? fileData.slug ?? "Untitled page",
      source: sourceBuffer.toString("utf8"),
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY ?? (isLocal ? LOCAL_TURNSTILE_SITE_KEY : ""),
    }

    return (
      <div class="wiki-editor" data-wiki-editor-root>
        <div class="wiki-editor-entry-actions">
          <button
            class="wiki-editor-open"
            type="button"
            data-wiki-editor-open
            data-editor-mode="edit"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.4 2.6a2.1 2.1 0 0 1 3 3l-9 9a2 2 0 0 1-.9.5l-2.9.9a.5.5 0 0 1-.6-.6l.9-2.9a2 2 0 0 1 .5-.9z" />
            </svg>
            Edit this page
          </button>
          <button
            class="wiki-editor-open wiki-editor-create"
            type="button"
            data-wiki-editor-open
            data-editor-mode="create"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create a new page
          </button>
        </div>

        <script
          type="application/json"
          data-wiki-editor-data
          dangerouslySetInnerHTML={{ __html: safeJson(editorData) }}
        />

        <dialog
          class="wiki-editor-dialog"
          data-wiki-editor-dialog
          aria-labelledby="wiki-editor-title"
        >
          <div class="wiki-editor-shell">
            <div class="wiki-editor-header">
              <div>
                <span class="wiki-editor-kicker">CRDG community editor</span>
                <h2 id="wiki-editor-title" data-editor-heading>
                  Edit {editorData.pageTitle}
                </h2>
              </div>
              <div class="wiki-editor-header-actions">
                <span class="wiki-editor-save-state" data-save-state>
                  Draft saved
                </span>
                <button
                  class="wiki-editor-icon-button"
                  type="button"
                  data-wiki-editor-close
                  aria-label="Close editor"
                  title="Close editor"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="wiki-editor-notice" data-editor-notice hidden></div>

            <section class="wiki-editor-workspace" data-editor-workspace>
              <div class="wiki-editor-toolbar" role="toolbar" aria-label="Markdown formatting">
                <div class="wiki-editor-toolbar-group">
                  <button type="button" data-editor-action="undo" title="Undo (Ctrl/⌘ Z)">
                    <span aria-hidden="true">↶</span>
                    <span class="sr-only">Undo</span>
                  </button>
                  <button type="button" data-editor-action="redo" title="Redo (Ctrl/⌘ Shift Z)">
                    <span aria-hidden="true">↷</span>
                    <span class="sr-only">Redo</span>
                  </button>
                </div>
                <div class="wiki-editor-toolbar-group">
                  <button type="button" data-editor-action="h2" title="Heading 2">
                    H2
                  </button>
                  <button type="button" data-editor-action="h3" title="Heading 3">
                    H3
                  </button>
                  <button type="button" data-editor-action="bold" title="Bold (Ctrl/⌘ B)">
                    <strong>B</strong>
                  </button>
                  <button type="button" data-editor-action="italic" title="Italic (Ctrl/⌘ I)">
                    <em>I</em>
                  </button>
                  <button type="button" data-editor-action="highlight" title="Highlight">
                    ==
                  </button>
                  <button type="button" data-editor-action="code" title="Inline code">
                    <span aria-hidden="true">&lt;/&gt;</span>
                    <span class="sr-only">Inline code</span>
                  </button>
                </div>
                <div class="wiki-editor-toolbar-group">
                  <button type="button" data-editor-action="bullets" title="Bulleted list">
                    • List
                  </button>
                  <button type="button" data-editor-action="numbered" title="Numbered list">
                    1. List
                  </button>
                  <button type="button" data-editor-action="task" title="Task list">
                    ☐ Task
                  </button>
                  <button type="button" data-editor-action="quote" title="Quote">
                    ❯ Quote
                  </button>
                </div>
                <div class="wiki-editor-toolbar-group">
                  <button type="button" data-editor-action="wikilink" title="Wiki link">
                    [[ Link ]]
                  </button>
                  <button type="button" data-editor-action="link" title="Web link">
                    🔗 Web
                  </button>
                  <button type="button" data-editor-action="callout" title="Obsidian callout">
                    ▣ Callout
                  </button>
                  <button type="button" data-editor-action="table" title="Table">
                    ▦ Table
                  </button>
                  <button class="wiki-editor-image-button" type="button" data-editor-action="image">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    Add image
                  </button>
                </div>
                <div class="wiki-editor-toolbar-spacer"></div>
                <div class="wiki-editor-view-switch" aria-label="Editor view">
                  <button type="button" data-editor-view="write">
                    Write
                  </button>
                  <button type="button" data-editor-view="split" class="is-active">
                    Split
                  </button>
                  <button type="button" data-editor-view="preview">
                    Preview
                  </button>
                </div>
                <button class="wiki-editor-guide-toggle" type="button" data-guide-toggle>
                  Markdown guide
                </button>
                <button class="wiki-editor-guide-toggle" type="button" data-frontmatter-toggle>
                  Page settings
                </button>
              </div>

              <section class="wiki-editor-frontmatter" data-frontmatter-panel hidden>
                <div class="wiki-editor-frontmatter-grid">
                  <label>
                    <span>Page title</span>
                    <input data-frontmatter-title maxlength={120} />
                  </label>
                  <label data-page-path-field>
                    <span>
                      Page path <small>relative to the wiki, ending in .md</small>
                    </span>
                    <input data-page-path maxlength={292} placeholder="Items/Example page.md" />
                  </label>
                  <label>
                    <span>
                      Tags <small>comma-separated</small>
                    </span>
                    <input data-frontmatter-tags placeholder="items, tutorials/building" />
                  </label>
                  <label>
                    <span>
                      Aliases <small>comma-separated</small>
                    </span>
                    <input data-frontmatter-aliases placeholder="Alternate page name" />
                  </label>
                  <label class="wiki-editor-frontmatter-wide">
                    <span>
                      Description <small>used in search and link previews</small>
                    </span>
                    <textarea data-frontmatter-description maxlength={500}></textarea>
                  </label>
                  <details class="wiki-editor-frontmatter-wide">
                    <summary>Advanced YAML</summary>
                    <p>
                      Edit any frontmatter property directly. Invalid YAML must be corrected before
                      submission.
                    </p>
                    <textarea data-frontmatter-yaml spellcheck={false}></textarea>
                  </details>
                </div>
              </section>

              <div class="wiki-editor-main" data-editor-main data-view="split">
                <div class="wiki-editor-write-pane" data-drop-zone>
                  <label for="wiki-editor-source">Obsidian Markdown</label>
                  <textarea
                    id="wiki-editor-source"
                    data-editor-source
                    spellcheck={true}
                    aria-label="Page source in Obsidian Markdown"
                  ></textarea>
                  <div class="wiki-editor-drop-message" aria-hidden="true">
                    Drop images here to upload them
                  </div>
                </div>
                <div class="wiki-editor-preview-pane">
                  <span class="wiki-editor-pane-label">Preview</span>
                  <article class="wiki-editor-preview" data-editor-preview></article>
                </div>
                <aside class="wiki-editor-guide" data-editor-guide hidden>
                  <div class="wiki-editor-guide-header">
                    <div>
                      <span class="wiki-editor-kicker">Quick reference</span>
                      <h3>Obsidian Markdown</h3>
                    </div>
                    <button
                      class="wiki-editor-icon-button"
                      type="button"
                      data-guide-close
                      aria-label="Close Markdown guide"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <path d="m6 6 12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                  <dl>
                    <dt>Heading</dt>
                    <dd>
                      <code>## Heading</code>
                    </dd>
                    <dt>Bold / italic</dt>
                    <dd>
                      <code>**bold**</code> · <code>*italic*</code>
                    </dd>
                    <dt>Highlight</dt>
                    <dd>
                      <code>==highlighted==</code>
                    </dd>
                    <dt>Wiki link</dt>
                    <dd>
                      <code>[[Page name]]</code>
                    </dd>
                    <dt>Link with label</dt>
                    <dd>
                      <code>[[Page name|label]]</code>
                    </dd>
                    <dt>Image</dt>
                    <dd>
                      <code>![[image.png]]</code>
                    </dd>
                    <dt>Image width</dt>
                    <dd>
                      <code>![[image.png|400]]</code>
                    </dd>
                    <dt>Callout</dt>
                    <dd>
                      <code>&gt; [!info] Title</code>
                    </dd>
                    <dt>List</dt>
                    <dd>
                      <code>- item</code> · <code>1. item</code>
                    </dd>
                    <dt>Task</dt>
                    <dd>
                      <code>- [ ] task</code>
                    </dd>
                    <dt>Quote</dt>
                    <dd>
                      <code>&gt; quoted text</code>
                    </dd>
                    <dt>Table</dt>
                    <dd>
                      <code>| Name | Value |</code>
                    </dd>
                    <dt>Code block</dt>
                    <dd>
                      <code>```lua</code> … <code>```</code>
                    </dd>
                    <dt>Math</dt>
                    <dd>
                      <code>$E = mc^2$</code>
                    </dd>
                  </dl>
                  <p>
                    Write as you would in Obsidian. The preview covers common syntax; the published
                    page is rendered by the wiki’s full Obsidian-compatible pipeline.
                  </p>
                </aside>
              </div>

              <div class="wiki-editor-attachments" data-attachment-tray hidden>
                <div class="wiki-editor-attachments-header">
                  <strong>Images to upload</strong>
                  <span>They will be included with this edit.</span>
                </div>
                <div class="wiki-editor-attachment-list" data-attachment-list></div>
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                multiple
                data-editor-file-input
                hidden
              />
            </section>

            <section class="wiki-editor-review" data-editor-review hidden>
              <div class="wiki-editor-review-copy">
                <span class="wiki-editor-kicker">One last step</span>
                <h3>Send this edit to the maintainers</h3>
                <p>
                  No GitHub account is needed. Your edit becomes a review request; the wiki changes
                  only after a maintainer approves and merges it.
                </p>
              </div>
              <div class="wiki-editor-review-grid">
                <div class="wiki-editor-review-form">
                  <label>
                    <span>
                      What did you change? <strong aria-hidden="true">*</strong>
                    </span>
                    <textarea
                      data-review-summary
                      maxlength={500}
                      required
                      placeholder="For example: corrected the component cost and added a screenshot."
                    ></textarea>
                  </label>
                  <label>
                    <span>
                      Your display name <small>optional, shown publicly</small>
                    </span>
                    <input data-review-name maxlength={80} autocomplete="nickname" />
                  </label>
                  <label>
                    <span>
                      Discord username <small>optional, shown publicly</small>
                    </span>
                    <input data-review-discord maxlength={80} autocomplete="off" />
                  </label>
                  <label class="wiki-editor-honeypot" aria-hidden="true">
                    Website <input data-review-website tabindex={-1} autocomplete="off" />
                  </label>
                  <div class="wiki-editor-turnstile" data-turnstile-container></div>
                  <p class="wiki-editor-form-error" data-review-error role="alert" hidden></p>
                </div>
                <div class="wiki-editor-review-summary">
                  <h4>Review package</h4>
                  <dl>
                    <div>
                      <dt>Page</dt>
                      <dd data-review-page>{editorData.pageTitle}</dd>
                    </div>
                    <div>
                      <dt>Words</dt>
                      <dd data-review-word-count>0</dd>
                    </div>
                    <div>
                      <dt>Images</dt>
                      <dd data-review-image-count>0</dd>
                    </div>
                  </dl>
                  <p>
                    Maintainers receive a normal line-by-line diff and can comment, approve, or ask
                    for changes before publishing.
                  </p>
                </div>
              </div>
            </section>

            <section class="wiki-editor-success" data-editor-success hidden>
              <div class="wiki-editor-success-icon" aria-hidden="true">
                ✓
              </div>
              <span class="wiki-editor-kicker">Sent for review</span>
              <h3>Thanks for improving the wiki.</h3>
              <p>Your edit is now in the maintainer review queue.</p>
              <a data-review-link target="_blank" rel="noopener">
                View review request
              </a>
            </section>

            <div class="wiki-editor-footer">
              <div class="wiki-editor-stats" data-editor-stats>
                0 words · 0 characters
              </div>
              <div class="wiki-editor-footer-actions" data-editor-actions>
                <button class="wiki-editor-secondary" type="button" data-wiki-editor-close>
                  Cancel
                </button>
                <button class="wiki-editor-primary" type="button" data-review-open>
                  Review &amp; submit
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <div class="wiki-editor-footer-actions" data-review-actions hidden>
                <button class="wiki-editor-secondary" type="button" data-review-back>
                  Back to editor
                </button>
                <button class="wiki-editor-primary" type="button" data-review-submit>
                  <span data-submit-label>Send for review</span>
                  <span
                    class="wiki-editor-spinner"
                    data-submit-spinner
                    hidden
                    aria-hidden="true"
                  ></span>
                </button>
              </div>
              <div class="wiki-editor-footer-actions" data-success-actions hidden>
                <button class="wiki-editor-primary" type="button" data-wiki-editor-close>
                  Done
                </button>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    )
  }

  WikiEditor.css = style
  WikiEditor.afterDOMLoaded = script

  return WikiEditor
})
