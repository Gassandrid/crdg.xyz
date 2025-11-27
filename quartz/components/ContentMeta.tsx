import { formatDate, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"
import { FullSlug, resolveRelative } from "../util/path"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      const segments: (string | JSX.Element)[] = []
      const fileRelativePath = fileData.filePath

      if (fileData.dates) {
        segments.push(formatDate(getDate(cfg, fileData)!, cfg.locale))
      }

      // Display reading time if enabled
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        segments.push(displayedTime)
      }

      // Display author if present in frontmatter
      const author = fileData.frontmatter?.author
      if (author) {
        // Extract page name from wikilink format [[Page Name]] or [[People/Name]] or just use the string as-is
        const wikilinkMatch = author.match(/\[\[([^\]]+)\]\]/)
        const authorPath = wikilinkMatch ? wikilinkMatch[1] : author

        // If the path doesn't include a folder, assume it's in the People folder
        const authorSlug = (
          authorPath.includes("/") ? authorPath : `Players/${authorPath}`
        ).replace(/\s+/g, "-") as FullSlug

        const authorLink = resolveRelative(fileData.slug!, authorSlug)

        // Extract just the name for display (without folder path)
        const authorName = authorPath.split("/").pop() || authorPath

        segments.push(
          <span>
            Made by{" "}
            <a href={authorLink} class="internal">
              {authorName}
            </a>
          </span>,
        )
      }

      const segmentsElements = segments.map((segment) => <span>{segment}</span>)

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segmentsElements} <br />
          <span id="edit-btn-container">
            <a
              href={`https://github.com/Gassandrid/crdg.xyz/edit/v4/${fileRelativePath}`}
              class={classNames(displayClass, "external", "edit-btn")}
              target={"_blank"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-square-pen"
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
              </svg>
              Edit page
            </a>{" "}
            &nbsp;
          </span>
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
