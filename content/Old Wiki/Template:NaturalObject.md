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
` ``<data source="found_in">`{=html}\
`   ``<label>`{=html}`Found In``</label>`{=html}\
` ``</data>`{=html}\
` ``<data source="properties">`{=html}\
`   ``<label>`{=html}`Properties``</label>`{=html}\
` ``</data>`{=html}

`</infobox>`{=html} [category:Natural
Objects](category:Natural_Objects "category:Natural Objects"){.wikilink}
`</includeonly>`{=html} `<noinclude>`{=html} Example usage:

    {{Objects

      | title1=Example

      | image1=Example

      | caption1=Example

      | found_in=Example
      
      | properties=Example

    }}

`<templatedata>`{=html} {

`   "params": {`\
`       "title1": {`\
`           "required": true`\
`       },`\
`       "image1": {`\
`           "suggested": true,`\
`           "type": "wiki-file-name"`\
`       },`\
`       "caption1": {`\
`           "suggested": true`\
`       },`\
`       "found_in": {`\
`           "required": true`\
`       },`\
`       "properties": {`\
`           "required": true`\
`       }`\
`   },`\
`   "sets": []`

} `</templatedata>`{=html} `</noinclude>`{=html}
