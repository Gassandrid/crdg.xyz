`<includeonly>`{=html} `<infobox>`{=html}

<title source="title1">
<default>
```{=mediawiki}
{{PAGENAME}}
```
</default>
</title>

` ``<image source="image1">`{=html}\
`   `

<caption source="caption-image1"/>

` ``</image>`{=html}\
` ``<data source="Usage">`{=html}\
`   ``<label>`{=html}`Usage``</label>`{=html}\
` ``</data>`{=html}\
` ``<data source="Obtaining">`{=html}\
`   ``<label>`{=html}`Obtaining``</label>`{=html}\
` ``</data>`{=html}

`</infobox>`{=html} `</includeonly>`{=html}

`<noinclude>`{=html} Example usage:

    {{Objects

      | title1=Example

      | image1=Example

      | caption1=Example
      
      | Usage=Example
      
      | Obtaining=Example

    }}

`<templatedata>`{=html} {

`   "params": {`\
`       "title1": {`\
`           "required": true`\
`       },`\
`       "image1": {`\
`           "suggested": true`\
`       },`\
`       "caption1": {`\
`           "suggested": true`\
`       },`\
`       "Usage": {`\
`           "required": true,`\
`           "description": "What the item does"`\
`       },`\
`       "Obtaining": {`\
`           "description": "How the item is obtained",`\
`           "required": true`\
`       }`\
`   },`\
`   "sets": [],`\
`   "description": "Template for handheld items, like the flintlock or component machine."`

} `</templatedata>`{=html} `</noinclude>`{=html}
`<includeonly>`{=html}`</includeonly>`{=html}

[Category:Items](Category:Items "Category:Items"){.wikilink}
