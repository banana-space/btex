"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var FunctionElement = /** @class */ (function () {
    function FunctionElement() {
        this.name = 'fun';
        this.isInline = true;
        this.functionName = '';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.children = [];
    }
    FunctionElement.prototype.normalise = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.normalise();
        }
    };
    FunctionElement.prototype.isEmpty = function () {
        return false;
    };
    FunctionElement.prototype.enter = function (context) {
        var _a;
        this.functionName = (_a = context.get('fun-name', true)) !== null && _a !== void 0 ? _a : '';
    };
    FunctionElement.prototype.event = function (arg, context, initiator) {
        switch (arg) {
            case 'fun-arg':
                context.flushSpan();
                this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                this.children.push(this.paragraph);
                return true;
            case 'par':
                context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
                return false;
        }
        context.throw('UNKNOWN_EVENT', initiator);
        return false;
    };
    FunctionElement.prototype.render = function (options) {
        var element = document.createElement('btex-fun');
        element.setAttribute('data-name', this.functionName);
        var i = 1;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var arg = document.createElement('btex-arg');
            // No options provided -- we need plain HTML for functions to work
            arg.append.apply(arg, child.renderInner());
            // '=' in tags may mess up wikitext template format
            if (!/^[^<]*=/.test(arg.innerHTML)) {
                arg.innerHTML = i + '=' + arg.innerHTML;
            }
            element.append(arg);
            i++;
        }
        return [element];
    };
    return FunctionElement;
}());
exports.FunctionElement = FunctionElement;
//# sourceMappingURL=FunctionElement.js.map