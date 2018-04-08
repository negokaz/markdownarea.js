var jquery                  = require('jquery');
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
        tokens[idx].attrPush([ 'class', 'alert alert-' + containerTypeName ]);
    }
    return self.renderToken(tokens, idx, _options, env, self);
}

function mkAnchorName(str) {
    var spaceRegex = new RegExp(markdown.utils.lib.ucmicro.Z.source, 'g');
    return str.replace(spaceRegex, '');
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
.use(require('markdown-it-anchor'), { permalink: true, permalinkClass: 'anchor', slugify: mkAnchorName, permalinkSymbol: '<span class="octicon octicon-link">&#xf05c</s>' })
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
            return '<pre class="mermaid">' + src + '</pre>';
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
import '../css/toc.css';
import './toc.js'

// render markdown
var view = jquery('<div class="markdown-body"></div>');
var markdownSource = jquery('.markdownarea').text();
view.html(markdown.render(unindentText(markdownSource)));
// render toc
var toc = jquery('<nav class="toc"></nav>');
var index = 0;
var currentLevel = 0;
var currentElem = toc;
var formatTocLi = function(headerElem) {
    return jquery(`<li><a href="#${headerElem.get(0).id}">${headerElem.html()}</a></li>`);
};
var headers = view.find('h1,h2,h3').map(function() {
    return {elem: jquery(this).clone().find('span.octicon').remove().end(), level: parseInt(this.localName.replace('h', ''))};
}).each(function() {
    var header = this;
    if (header.level > currentLevel) {
        var ul = jquery('<ul>');
        if (toc.find('ul').length == 0) {
            toc.append(ul.append(svg));
        }
        var li = formatTocLi(header.elem);
        currentElem.append(ul.append(li));
        currentElem = li;
    } else if (header.level == currentLevel) {
        var li = formatTocLi(header.elem);
        currentElem.parent().append(li);
        currentElem = li;
    } else if (header.level < currentLevel) {
        var li = formatTocLi(header.elem);
        currentElem.parent().parent().append(li);
        currentElem = li;
    }
    currentLevel = header.level;
});
var svg = 
    jquery(`
        <svg class="toc-marker" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <path stroke="#444" stroke-width="3" fill="transparent" stroke-dasharray="0, 0, 0, 1000" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.5, -0.5)" />
        </svg>
    `);
toc.append(svg);

jquery('body')
    .append(toc)
    .append(jquery('<div class="content"></div>').append(view));

// set title
var title = view.find('h1');
if (title.length > 0) {
    document.title = title[0].innerText;
}

// disable smooth scroll on IE and Edge to prevent toc nav jumping when scrolling
// see: css - IE 10 & 11 make fixed backgrounds jump when scrolling with mouse wheel - Stack Overflow
//      https://stackoverflow.com/questions/19377810/ie-10-11-make-fixed-backgrounds-jump-when-scrolling-with-mouse-wheel
if(navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/12\./)) {
    jquery('body').on("mousewheel", function () {
        event.preventDefault();
        window.scrollTo(0, window.pageYOffset - event.wheelDelta);
    });
}
