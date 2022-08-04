"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var ListElement = /** @class */ (function () {
    function ListElement() {
        this.name = 'list';
        this.children = [];
        // This first paragraph element will not be rendered; rendering starts after the first \item.
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.contentMode = true;
    }
    ListElement.prototype.normalise = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            for (var _b = 0, _c = child.label; _b < _c.length; _b++) {
                var e = _c[_b];
                e.normalise();
            }
            child.label = child.label.filter(function (e) { return !e.isEmpty(); });
            for (var _d = 0, _e = child.content; _d < _e.length; _d++) {
                var e = _e[_d];
                e.normalise();
            }
            child.content = child.content.filter(function (e) { return !e.isEmpty(); });
        }
        this.children = this.children.filter(function (child) { return child.label.length > 0 || child.content.length > 0; });
    };
    ListElement.prototype.isEmpty = function () {
        return this.children.length === 0;
    };
    ListElement.prototype.enter = function (context) {
        this.classes = context.get('g.list-classes', true);
    };
    ListElement.prototype.event = function (arg, context) {
        var _a;
        // TODO: errors when returning false
        switch (arg) {
            case '+':
                if (!this.contentMode)
                    return false;
                this.paragraph = new ParagraphElement_1.ParagraphElement();
                var indent = context.getInteger('list-indent', 0, true);
                if (!(indent >= 1 && indent <= 3))
                    indent = undefined;
                this.children.push({ label: [this.paragraph], content: [], classes: [], indent: indent });
                this.contentMode = false;
                return true;
            case '.':
                if (this.children.length === 0 || this.contentMode)
                    return false;
                this.contentMode = true;
                this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                this.children[this.children.length - 1].content.push(this.paragraph);
                if (context.getBoolean('list-item-no-sep-above', false, true)) {
                    if (this.children.length > 1)
                        this.children[this.children.length - 2].classes.push('list-item-no-sep');
                    else
                        this.classes = (((_a = this.classes) !== null && _a !== void 0 ? _a : '') + ' list-no-sep-above').trim();
                }
                return true;
            case 'par':
                var child = this.children[this.children.length - 1];
                if (!child)
                    return true;
                var list = this.contentMode ? child.content : child.label;
                this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                list.push(this.paragraph);
                return true;
        }
        return false;
    };
    ListElement.prototype.render = function (options) {
        var _a;
        if (this.isEmpty())
            return [];
        var table = document.createElement('table');
        table.classList.add('list');
        if (this.classes)
            (_a = table.classList).add.apply(_a, this.classes.split(' '));
        for (var _i = 0, _b = this.children; _i < _b.length; _i++) {
            var child = _b[_i];
            var tr = document.createElement('tr');
            tr.classList.add('list-item');
            for (var _c = 0, _d = child.classes; _c < _d.length; _c++) {
                var cls = _d[_c];
                tr.classList.add(cls);
            }
            if (child.indent)
                tr.classList.add("list-item-indent-" + child.indent);
            table.append(tr);
            var td = document.createElement('td');
            td.classList.add('list-item-label');
            tr.append(td);
            for (var _e = 0, _f = child.label; _e < _f.length; _e++) {
                var e = _f[_e];
                td.append.apply(td, e.render(options));
            }
            td = document.createElement('td');
            td.classList.add('list-item-content');
            tr.append(td);
            for (var _g = 0, _h = child.content; _g < _h.length; _g++) {
                var e = _h[_g];
                td.append.apply(td, e.render(options));
            }
        }
        return [table];
    };
    return ListElement;
}());
exports.ListElement = ListElement;
//# sourceMappingURL=ListElement.js.map