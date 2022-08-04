"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var HeaderElement = /** @class */ (function () {
    function HeaderElement() {
        this.name = 'header';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    HeaderElement.prototype.isEmpty = function () {
        return this.paragraph.isEmpty();
    };
    HeaderElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    HeaderElement.prototype.enter = function (context, initiator) {
        var _a;
        this.type = context.get('header-type', true);
        this.noToc = context.getBoolean('header-no-toc', false, true);
        if (context.getBoolean('header-numbered', false)) {
            this.numberHTML = (_a = context.commandToHTML('\\@headernumber', initiator)) !== null && _a !== void 0 ? _a : undefined;
        }
    };
    HeaderElement.prototype.exit = function (context) {
        var _a;
        var hash = (_a = context.get('header-hash', true)) !== null && _a !== void 0 ? _a : this.paragraph.getText();
        hash = hash.trim().replace(/\s/g, '_');
        // Find an available hash of the form hash_1, hash_2, ...
        var i = /^([a-z]?\d+)?$/i.test(hash) ? 1 : 0;
        var name = hash;
        for (;; i++) {
            if (i > 0)
                name = hash + '_' + i;
            var flag = true;
            for (var _i = 0, _b = context.headers; _i < _b.length; _i++) {
                var header = _b[_i];
                if (header.hash === name) {
                    flag = false;
                    break;
                }
            }
            if (flag)
                break;
        }
        this.hash = name;
        context.set('ref-id', name);
        context.headers.push(this);
    };
    HeaderElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    HeaderElement.prototype.render = function (options) {
        if (!this.type || !/^h[234]$/.test(this.type))
            this.type = 'h2';
        var element = document.createElement(this.type);
        if (this.hash)
            element.setAttribute('id', this.hash);
        if (this.numberHTML) {
            var span = document.createElement('span');
            span.classList.add('header-number');
            span.append(this.numberHTML);
            element.append(span);
        }
        element.append.apply(element, this.paragraph.renderInner(options));
        return [element];
    };
    return HeaderElement;
}());
exports.HeaderElement = HeaderElement;
//# sourceMappingURL=HeaderElement.js.map