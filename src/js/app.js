var highlightJs             = require('highlight.js');
var markdownItContainer     = require('markdown-it-container');

function renderContainer(tokens, idx, _options, env, self) {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
        var containerTypeName = tokens[idx].info.trim();
        tokens[idx].attrPush([ 'class', `alert alert-${containerTypeName}` ]);
    }
    return self.renderToken(tokens, idx, _options, env, self);
}

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
.use(markdownItContainer, 'success', { render: renderContainer })
.use(markdownItContainer, 'info', { render: renderContainer })
.use(markdownItContainer, 'warning', { render: renderContainer })
.use(markdownItContainer, 'danger', { render: renderContainer })
.use(require('markdown-it-abbr'))
.use(require('markdown-it-footnote'))
.use(require('markdown-it-deflist'))
.use(require('markdown-it-mark'))
.use(require('markdown-it-ins'))
.use(require('markdown-it-sub'))
.use(require('markdown-it-sup'))
.use(require('markdown-it-task-lists'))
;

function unindentText(text) {
    if (!text) {
        return text;
    }
    var softTabText = text.replace(/\t/g, '    ');
    var lines = softTabText.split('\n');
    var indent = lines.reduce(function(acc, line) {
        if (/^\s*$/.test(line)) return acc;  // Completely ignore blank lines.
        var lineIndent = line.match(/^(\s*)/)[0].length;
        if (acc === null) {
            return lineIndent;
        } else {
            return lineIndent < acc ? lineIndent : acc;
        }
      }, /*initialValue*/null);
    return lines.map(function(line) { return line.substr(indent); }).join('\n');
}

import 'github-markdown-css';
import '../css/app.css';

// render markdown
var view = document.createElement('div');
view.className = "markdown-body";
var markdownSource = document.querySelector('.markdownarea').innerText;
view.innerHTML = markdownIt.render(unindentText(markdownSource));
document.body.appendChild(view);

// set title
var title = view.querySelector('h1');
if (title) {
    document.title = title.innerText;
}