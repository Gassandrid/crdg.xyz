/\*

`* This is the CSS for all skins (for both mobile and desktop) on MediaWiki.org.`\
`* Styling inside .mw-parser-output should generally use TemplateStyles.`\
`*/`

/\* Force lining numbers in headers (for fonts like Georgia) \*/ h1, h2,
.firstHeading {

`   font-variant-numeric: lining-nums;`

}

/\* Consistent size for sub/sup \*/ .mw-body sub, .mw-body sup {

`   font-size: 80%;`

}

/\* Public Domain background in the Help namespace \*/
.action-view.ns-12 #bodyContent {

`   background-image: url(//upload.wikimedia.org/wikipedia/commons/6/67/PD-icon-faded.png);`\
`   background-repeat: no-repeat;`\
`   /* @noflip */`\
`   background-position: right 5em;`

}

/\*

`* Hide elements on the main page. `\
`*/`

.page-MediaWiki #lastmod, .page-MediaWiki #siteSub, .page-MediaWiki
#contentSub, .page-MediaWiki .subtitle, .page-MediaWiki #jump-to-nav,
/\* can be removed when Template:Main_page translations are updated. \*/
.page-MediaWiki #firstHeading, \[lang=\"en\"\] .page-MediaWiki
.mw-parser-output h2 {

`   display: none; `

}

\[lang=\"en\"\] .page-MediaWiki #firstHeading {

` font-size: 1.5em;`\
` display: block;`

}

/\* Give a bit of space to the TOC \*/

1.  toc {

`   margin: 1em 0;`

}

/\* Fonts for Persian language for consistency with other Wikimedia
wikis \*/

:   lang(fa) {

`   font-family: '.Arabic UI Text', Tahoma, 'Iranian Sans', 'Noto Sans Arabic', 'DejaVu Sans', sans-serif;`

}

/\* Div based \"warning\" style fmbox messages. \*/
div.mw-warning-with-logexcerpt, div.mw-lag-warn-high,
div.mw-cascadeprotectedwarning, div#mw-protect-cascadeon,
div.titleblacklist-warning {

`   clear: both;`\
`   margin: 0.2em 0;`\
`   border: 1px solid var( --border-color-error, #9f3526 );`\
`   background-color: var( --background-color-error-subtle, #ffdbdb );`\
`   color: var( --color-base, #202122 );`\
`   padding: 0.25em 0.9em;`\
`   box-sizing: border-box;`

}

/\* Hide confusing \"Discussion\" tab on
[Project:Support_desk](Project:Support_desk "Project:Support_desk"){.wikilink}.

`* For sanity, only do this if `[`Project_talk:Support_desk`](Project_talk:Support_desk "Project_talk:Support_desk"){.wikilink}` is a`\
`* redirect (which goes back to `[`Project:Support_desk`](Project:Support_desk "Project:Support_desk"){.wikilink}`).`\
`* If that is changed for some reason, it automatically comes back.`\
`*/`

.page-Project_Support_desk #ca-talk a.mw-redirect {

`   display: none;`

}
