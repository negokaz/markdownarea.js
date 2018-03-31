var highlightJs             = require('highlight.js');
var markdownIt              = require('markdown-it');
var markdownItContainer     = require('markdown-it-container');

function highlight(src, lang) {
    if (lang && highlightJs.getLanguage(lang)) {
        try {
            return '<pre class="hljs"><code>' +
                    highlightJs.highlight(lang, src, true).value 
                    + '</code></pre>';
        } catch (__) {}
    }
    return '<pre class="hljs"><code>' + markdown.utils.escapeHtml(src) + '</code></pre>';
}

function renderContainer(tokens, idx, _options, env, self) {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
        var containerTypeName = tokens[idx].info.trim();
        tokens[idx].attrPush([ 'class', `alert alert-${containerTypeName}` ]);
    }
    return self.renderToken(tokens, idx, _options, env, self);
}

var markdown = markdownIt({
    html:           true,
    breaks:         true,
    linkify:        true,
    typographer:    true,
    highlight: highlight
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
.use(require('markdown-it-emoji'))
;

var renderFenceWithDefaultRule = markdown.renderer.rules.fence.bind(markdown.renderer.rules);

if (window.mermaid) {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
}

markdown.renderer.rules.fence = function (tokens, idx, _options, env, self) {
    var token = tokens[idx];
    const src = token.content.trim();
    if (token.info === 'mermaid') {
        if (window.mermaid) {
            return `<pre class="mermaid">${src}</pre>`;
        } else {
            return '<div class="alert alert-warning">'
                + '<b>Warning</b><br>'
                + 'mermaid is not found.<br>'
                + 'Please include mermaid on your page by script tag.</div>';
        }
    } else {
        return renderFenceWithDefaultRule(tokens, idx, _options, env, self);
    }
};

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
import 'highlight.js/styles/github.css';

// render markdown
var view = document.createElement('div');
view.className = "markdown-body";
var markdownSource = document.querySelector('.markdownarea').innerText;
view.innerHTML = markdown.render(unindentText(markdownSource));
document.body.appendChild(view);

// set title
var title = view.querySelector('h1');
if (title) {
    document.title = title.innerText;
}