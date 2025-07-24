`<includeonly>`{=html} `<infobox>`{=html}

<title source="Title">
<default>
```{=mediawiki}
{{PAGENAME}}
```
</default>
</title>

` ``<image source="Image">`{=html}\
` ``</image>`{=html}\
` ``<data source="Previous location">`{=html}\
`   ``<label>`{=html}`Previous location``</label>`{=html}\
` ``</data>`{=html}` ``<data source="Next location">`{=html}\
`   ``<label>`{=html}`Next location``</label>`{=html}\
` ``</data>`{=html}\
` ``<data source="Features">`{=html}\
`   ``<label>`{=html}`Features``</label>`{=html}\
` ``</data>`{=html}

`</infobox>`{=html}
[category:Locations](category:Locations "category:Locations"){.wikilink}
`</includeonly>`{=html} `<noinclude>`{=html} Example usage:

    {{Objects

      | Title=Example

      | Image=Example

      | Previous location=Example

      | Next location=Example
      
      | Features=Example

    }}

`<templatedata>`{=html} {

`   "params": {`\
`       "Title": {`\
`           "required": true,`\
`           "description": "Name of location"`\
`       },`\
`       "Image": {`\
`           "suggested": true,`\
`           "description": "Image of location"`\
`       },`\
`       "Previous location": {`\
`           "required": true,`\
`           "description": "Location that leads to this location"`\
`       },`\
`       "Next location": {`\
`           "required": true,`\
`           "description": "Location(s) you can go to after this location"`\
`       },`\
`       "Features": {`\
`           "required": true,`\
`           "description": "Things here (eg buildings, cart spawners, etc.)"`\
`       }`\
`   },`\
`   "sets": [],`\
`   "description": "Template that is for describing locations."`

} `</templatedata>`{=html}
