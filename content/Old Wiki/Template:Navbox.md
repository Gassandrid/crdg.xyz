{{#switch:`{{{border|{{{1|}}}`{=mediawiki}}}}\|subgroup\|child=\|none=\|#default=
`{{{!}} class="navbox" cellspacing="0" style="{{{bodystyle|}}}`{=mediawiki};`{{{style|}}}`{=mediawiki}\"
{{!}}- {{!}} style=\"padding:2px;\" {{!}} }}
`{{{!}} cellspacing="0" class="nowraplinks {{#if:{{{title|}}}`{=mediawiki}\|{{#switch:`{{{state|}}}`{=mediawiki}\|plain\|off=\|#default=collapsible
{{#if:`{{{state|}}}`{=mediawiki}\|`{{{state|}}}`{=mediawiki}\|autocollapse}}}}}}
{{#switch:`{{{border|{{{1|}}}`{=mediawiki}}}}\|subgroup\|child\|none=navbox-subgroup\"
style=\"width:100%;`{{{bodystyle|}}}`{=mediawiki};`{{{style|}}}`{=mediawiki}\|#default=\"
style=\"width:100%;background:transparent;color:inherit}};`{{{innerstyle|}}}`{=mediawiki};\"
{{#if:`{{{title|}}}`{=mediawiki}\| {{!}}-
{{#if:`{{{titlegroup|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{titlegroupstyle|}}}`{=mediawiki}\"
{{!}} `{{{titlegroup|}}}`{=mediawiki} ! style=\"border-left:2px solid
#fdfdfd;width:100%;\| !
style=\"}}`{{{basestyle|}}}`{=mediawiki};`{{{titlestyle|}}}`{=mediawiki}\"
colspan={{#expr:2{{#if:`{{{imageleft|}}}`{=mediawiki}\|+1}}{{#if:`{{{image|}}}`{=mediawiki}\|+1}}{{#if:`{{{titlegroup|}}}`{=mediawiki}\|-1}}}}
class=\"navbox-title\" {{!}}
{{#if:{{#switch:`{{{navbar|}}}`{=mediawiki}\|plain\|off=1}}
{{#if:`{{{name|}}}`{=mediawiki}\|\|{{#switch:`{{{border|{{{1|}}}`{=mediawiki}}}}\|subgroup\|child\|none=1}}}}\|
{{#ifeq:`{{{navbar|}}}`{=mediawiki}\|off\|{{#ifeq:`{{{state|}}}`{=mediawiki}\|plain\|

<div style="float:right;width:6em;">

 

</div>

}}\| {{#ifeq:`{{{state|}}}`{=mediawiki}\|plain\|\|

<div style="float:left; width:6em;text-align:left;">

 

</div>

}}}}\|

<div style="float:left; width:6em;text-align:left;">

`{{navbar|{{{name}}}|fontstyle={{{basestyle|}}};{{{titlestyle|}}};border:none;|mini=1}}`{=mediawiki}

</div>

{{#ifeq:`{{{state|}}}`{=mediawiki}\|plain\|

<div style="float:right;width:6em;">

 

</div>

}}}}
`<span style="font-size:{{#switch:{{{border|{{{1|}}}}}}|subgroup|child|none=100|#default=110}}%;">`{=html}
`{{{title}}}`{=mediawiki}`</span>`{=html} }}
{{#if:`{{{above|}}}`{=mediawiki}\| {{#if:`{{{title|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px;\" {{!}} }} {{!}}- {{!}}
class=\"navbox-abovebelow\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{abovestyle|}}}`{=mediawiki}\"
colspan=\"{{#expr:2{{#if:`{{{imageleft|}}}`{=mediawiki}\|+1}}{{#if:`{{{image|}}}`{=mediawiki}\|+1}}}}\"
{{!}} `{{{above}}}`{=mediawiki} }}
{{#if:`{{{list1|}}}`{=mediawiki}\|{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px;\" {{!}} }} {{!}}-
{{#if:`{{{imageleft|}}}`{=mediawiki}\| {{!}}
style=\"width:0%;padding:0px 2px 0px
0px;`{{{imageleftstyle|}}}`{=mediawiki}\"
rowspan={{#expr:1{{#if:`{{{list2|}}}`{=mediawiki}\|+2}}{{#if:`{{{list3|}}}`{=mediawiki}\|+2}}{{#if:`{{{list4|}}}`{=mediawiki}\|+2}}{{#if:`{{{list5|}}}`{=mediawiki}\|+2}}{{#if:`{{{list6|}}}`{=mediawiki}\|+2}}{{#if:`{{{list7|}}}`{=mediawiki}\|+2}}{{#if:`{{{list8|}}}`{=mediawiki}\|+2}}{{#if:`{{{list9|}}}`{=mediawiki}\|+2}}{{#if:`{{{list10|}}}`{=mediawiki}\|+2}}{{#if:`{{{list11|}}}`{=mediawiki}\|+2}}{{#if:`{{{list12|}}}`{=mediawiki}\|+2}}{{#if:`{{{list13|}}}`{=mediawiki}\|+2}}{{#if:`{{{list14|}}}`{=mediawiki}\|+2}}{{#if:`{{{list15|}}}`{=mediawiki}\|+2}}{{#if:`{{{list16|}}}`{=mediawiki}\|+2}}{{#if:`{{{list17|}}}`{=mediawiki}\|+2}}{{#if:`{{{list18|}}}`{=mediawiki}\|+2}}{{#if:`{{{list19|}}}`{=mediawiki}\|+2}}{{#if:`{{{list20|}}}`{=mediawiki}\|+2}}}}
{{!}} `{{{imageleft|}}}`{=mediawiki} }}
{{#if:`{{{group1|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group1style|}}}`{=mediawiki}\"
{{!}} `{{{group1}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{oddstyle|}}}`{=mediawiki};`{{{list1style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{list1padding|{{{listpadding|0em 0.25em}}}}}}">

`{{{list1|}}}`{=mediawiki}

</div>

{{#if:`{{{image|}}}`{=mediawiki}\| {{!}} style=\"width:0%;padding:0px
0px 0px 2px;`{{{imagestyle|}}}`{=mediawiki}\"
rowspan={{#expr:1{{#if:`{{{list2|}}}`{=mediawiki}\|+2}}{{#if:`{{{list3|}}}`{=mediawiki}\|+2}}{{#if:`{{{list4|}}}`{=mediawiki}\|+2}}{{#if:`{{{list5|}}}`{=mediawiki}\|+2}}{{#if:`{{{list6|}}}`{=mediawiki}\|+2}}{{#if:`{{{list7|}}}`{=mediawiki}\|+2}}{{#if:`{{{list8|}}}`{=mediawiki}\|+2}}{{#if:`{{{list9|}}}`{=mediawiki}\|+2}}{{#if:`{{{list10|}}}`{=mediawiki}\|+2}}{{#if:`{{{list11|}}}`{=mediawiki}\|+2}}{{#if:`{{{list12|}}}`{=mediawiki}\|+2}}{{#if:`{{{list13|}}}`{=mediawiki}\|+2}}{{#if:`{{{list14|}}}`{=mediawiki}\|+2}}{{#if:`{{{list15|}}}`{=mediawiki}\|+2}}{{#if:`{{{list16|}}}`{=mediawiki}\|+2}}{{#if:`{{{list17|}}}`{=mediawiki}\|+2}}{{#if:`{{{list18|}}}`{=mediawiki}\|+2}}{{#if:`{{{list19|}}}`{=mediawiki}\|+2}}{{#if:`{{{list20|}}}`{=mediawiki}\|+2}}}}
{{!}} `{{{image|}}}`{=mediawiki} }} }}
{{#if:`{{{list2|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list1|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group2|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group2style|}}}`{=mediawiki}\"
{{!}} `{{{group2}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list2style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list2|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list3|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list2|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group3|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group3style|}}}`{=mediawiki}\"
{{!}} `{{{group3}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list3style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list3|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list4|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list3|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group4|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group4style|}}}`{=mediawiki}\"
{{!}} `{{{group4}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list4style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list4|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list5|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list4|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group5|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group5style|}}}`{=mediawiki}\"
{{!}} `{{{group5}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list5style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list5|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list6|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list5|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group6|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group6style|}}}`{=mediawiki}\"
{{!}} `{{{group6}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list6style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list6|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list7|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list6|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group7|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group7style|}}}`{=mediawiki}\"
{{!}} `{{{group7}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list7style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list7|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list8|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list7|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group8|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group8style|}}}`{=mediawiki}\"
{{!}} `{{{group8}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list8style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list8|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list9|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list8|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group9|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group9style|}}}`{=mediawiki}\"
{{!}} `{{{group9}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list9style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list9|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list10|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list9|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group10|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group10style|}}}`{=mediawiki}\"
{{!}} `{{{group10}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list10style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list10|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list11|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list10|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group11|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group11style|}}}`{=mediawiki}\"
{{!}} `{{{group11}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list11style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list11|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list12|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list11|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group12|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group12style|}}}`{=mediawiki}\"
{{!}} `{{{group12}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list12style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list12|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list13|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list12|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group13|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group13style|}}}`{=mediawiki}\"
{{!}} `{{{group13}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list13style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list13|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list14|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list13|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group14|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group14style|}}}`{=mediawiki}\"
{{!}} `{{{group14}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list14style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list14|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list15|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list14|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group15|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group15style|}}}`{=mediawiki}\"
{{!}} `{{{group15}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list15style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list15|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list16|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list15|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group16|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group16style|}}}`{=mediawiki}\"
{{!}} `{{{group16}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list16style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list16|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list17|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list16|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group17|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group17style|}}}`{=mediawiki}\"
{{!}} `{{{group17}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list17style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list17|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list18|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list17|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group18|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group18style|}}}`{=mediawiki}\"
{{!}} `{{{group18}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list18style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list18|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list19|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list18|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group19|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group19style|}}}`{=mediawiki}\"
{{!}} `{{{group19}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list19style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|even\|`{{{evenodd|odd}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list19|}}}`{=mediawiki}

</div>

}} {{#if:`{{{list20|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list19|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px\" {{!}} }} {{!}}-
{{#if:`{{{group20|}}}`{=mediawiki}\| {{!}} class=\"navbox-group\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{groupstyle|}}}`{=mediawiki};`{{{group20style|}}}`{=mediawiki}\"
{{!}} `{{{group20}}}`{=mediawiki} {{!}}
style=\"text-align:left;border-left:2px solid #fdfdfd;\| {{!}} colspan=2
style=\"}}
width:100%;padding:0px;`{{{liststyle|}}}`{=mediawiki};`{{{evenstyle|}}}`{=mediawiki};`{{{list20style|}}}`{=mediawiki}\"
class=\"navbox-list
navbox-{{#ifeq:`{{{evenodd|}}}`{=mediawiki}\|swap\|odd\|`{{{evenodd|even}}}`{=mediawiki}}}\"
{{!}}

<div style="padding:{{{listpadding|0em 0.25em}}}">

`{{{list20|}}}`{=mediawiki}

</div>

}} {{#if:`{{{below|}}}`{=mediawiki}\|
{{#if:`{{{title|}}}`{=mediawiki}`{{{above|}}}`{=mediawiki}`{{{list1|}}}`{=mediawiki}`{{{list2|}}}`{=mediawiki}`{{{list3|}}}`{=mediawiki}\|
{{!}}- style=\"height:2px;\" {{!}} }} {{!}}- {{!}}
class=\"navbox-abovebelow\"
style=\"`{{{basestyle|}}}`{=mediawiki};`{{{belowstyle|}}}`{=mediawiki}\"
colspan=\"{{#expr:2{{#if:`{{{imageleft|}}}`{=mediawiki}\|+1}}{{#if:`{{{image|}}}`{=mediawiki}\|+1}}}}\"
{{!}} `{{{below}}}`{=mediawiki} }}
{{!}}}{{#switch:`{{{border|{{{1|}}}`{=mediawiki}}}}\|subgroup\|child=\|none=\|#default=
{{!}}}
}}`<noinclude>`{=html}`{{Documentation}}`{=mediawiki}`</noinclude>`{=html}
