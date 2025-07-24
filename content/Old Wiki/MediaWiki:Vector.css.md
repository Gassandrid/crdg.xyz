/\* Don\'t display some stuff on the main page \*/ .page-Main_Page
#deleteconfirm, .page-Main_Page #t-cite, .page-Main_Page
#footer-info-lastmod, .action-view.page-Main_Page #siteSub,
.action-view.page-Main_Page #contentSub, .action-view.page-Main_Page
#contentSub2 {

`   display: none !important;`

}

1.  coordinates {

`   position: absolute;`\
`   top: 3.5em;`\
`   right: 0;`\
`   line-height: 1.6;`\
`   text-align: right;`\
`   font-size: 92%;`\
`   white-space: nowrap;`\
`   float: right;`\
`   margin: 0;`\
`   padding: 0;`\
`   text-indent: 0;`\
`   text-transform: none;`

}

/\* correct position for VE \*/ .ve-ce-surface #coordinates {

`   margin-right: 2em;`\
`   margin-top: -1em;`

}

/\* FR topicon position \*/ div.flaggedrevs_short {

`   position: absolute;`\
`   top: -3em;`\
`   right: 100px;`\
`   z-index: 1;`

}

/\* Make \"From the Crdg wiki\' almost invisible \*/

1.  siteSub {

`   font-size: 1%;`

}

/\* Move page status indicators down slightly \*/ .mw-indicators {

`   padding-top: 0.4em;`

}

/\* Override [phab:T265947](phab:T265947 "phab:T265947"){.wikilink} \*/
.mw-body-content blockquote {

`   border-left: none;`

}

/\* Styling for tags in changes pages \*/ .mw-tag-markers {

`   font-style: italic;`\
`   font-size: 90%;`

}
