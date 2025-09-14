These callouts have standard use cases and titles, but you can override the title yourself if you want.

You can also make them **collapsible** using a + or - sight as so:

> [!Example]- this is collapsed
> but can be clicked

> [!Example]+ this is uncollapsed
> but can be clicked to collapse

---

## Callout List

**Info**

> [!Info] Title
> content

**Warning**

> [!Warning] Title
> content

**Tip**

> [!Tip] Title
> content

**Success**

> [!Success] Title
> content

**Question**

> [!Question] Title
> content

**Quote**

> [!Quote] Title
> content

**Example**

> [!Example] Title
> content

**Note**

> [!Note] Title
> content

**Important**

> [!Important] Title
> content

**Abstract**

> [!Abstract] Title
> content

**Failure**

> [!Failure] Title
> content

**Alert**

> [!Alert] Title
> content

**Bug**

> [!Bug]
> There is an error when you run this


> [!Note|txt-s right wm-sm] Note on Performance Impact 
> Deleting the references likely will not offer any noticeable performance gain, beyond marginally improving plugin load speed upon launching the game. 
> 
> However, it does make it easier to analyze the output plugin later by removing redundant data, for example:
> 
> - Viewing modified cells in [[CSSE]] or [[modding-tools/low-level-editors/index|low-level editors]]: Cells containing only grass moved by Lawnmower will no longer appear as modified.
> - Viewing a text representation of the plugin created by Tes3cmd `dump`, Tes3conv JSON or [[deltaplugin|DeltaPlugin]] YAML: Cleaning the plugin 'declutters' it so redundant data does not clutter the results.

Cleaning the output plugin of redundant `CELL` references involves two steps:

1. Delete the moved grass with [[tes3cmd|Tes3cmd]].
2. Clean the plugin of any empty cells with [[testool|TESTool]].

The second step is useful for instances where Lawnmower has removed all grass from a cell, leaving an empty `CELL` record.