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
      const authorValue = fileData.frontmatter?.author
      const author = typeof authorValue === "string" ? authorValue : undefined
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
          {segmentsElements}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
