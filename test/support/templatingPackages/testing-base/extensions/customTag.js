const nunjucks = require('nunjucks');

module.CustomTag = class CustomTag {

    constructor() {
        this.TAG_OPEN = 'basePackageTag';
        this.TAG_CLOSE = 'endBasePackageTag';
        this.ERROR_TOKEN = 'error';
        this.tags = [this.TAG_OPEN];
    }

    parse(parser, nodes, lexer) {
        const openingTag = parser.nextToken();
        const args = parser.parseSignature(null, true);

        parser.advanceAfterBlockEnd(openingTag.value);

        const content = parser.parseUntilBlocks(this.ERROR_TOKEN, this.TAG_CLOSE);

        if (!parser.skipSymbol(this.ERROR_TOKEN)) {
            parser.advanceAfterBlockEnd();
            return new nodes.CallExtension(this, 'run', args, [content]);
        }

        parser.skip(lexer.TOKEN_BLOCK_END);
        const errorContent = parser.parseUntilBlocks(this.TAG_CLOSE);
        return new nodes.CallExtension(this, 'run', args, [content, errorContent]);
    }

    run(context, showError, content, errorContent, callback) {
        if (!showError) {
            const html = `<div class="base-package-tag">${content()}</div>`;
            return callback(null, new nunjucks.runtime.SafeString(html));
        }
        const html = `<div class="base-package-tag-error">${errorContent()}</div>`;
        return callback(null, new nunjucks.runtime.SafeString(html));
    }
};
