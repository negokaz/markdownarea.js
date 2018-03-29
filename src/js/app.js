var highlightJs             = require('highlight.js');
var markdownItContainer     = require('markdown-it-container');
var markdownIt              = require('markdown-it')({
    html:           true,
    breaks:         true,
    linkify:        true,
    typographer:    true,
    highlight: function (str, lang) {
        if (lang && highlightJs.getLanguage(lang)) {
          try {
            return highlightJs.highlight(lang, str).value;
          } catch (__) {}
        }
        return ''; // use external default escaping
      }
})
.use(markdownItContainer, 'success')
.use(markdownItContainer, 'info')
.use(markdownItContainer, 'warning')
.use(markdownItContainer, 'danger')
.use(require('markdown-it-abbr'))
.use(require('markdown-it-footnote'))
.use(require('markdown-it-deflist'))
.use(require('markdown-it-mark'))
.use(require('markdown-it-ins'))
.use(require('markdown-it-sub'))
.use(require('markdown-it-sup'))
.use(require('markdown-it-task-lists'))
;

import '../css/app.css';

// render markdown
var view = document.createElement('div');
view.className = "markdown-body";
view.innerHTML = markdownIt.render(document.querySelector('.markdownarea').innerText);
document.body.appendChild(view);

// set title
var title = view.querySelector('h1');
if (title) {
    document.title = title.innerText;
}