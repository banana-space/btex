"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var TableElement = /** @class */ (function () {
    function TableElement() {
        this.name = 'table';
        this.cells = [];
        this.cellOptions = [];
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = false;
        this.isPlain = false;
        // current cell
        this.row = 0;
        this.col = 0;
    }
    TableElement.prototype.isEmpty = function () {
        return false;
    };
    TableElement.prototype.normalise = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var row = _a[_i];
            for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                var paragraph = row_1[_b];
                paragraph.normalise();
            }
        }
    };
    TableElement.prototype.enter = function (context) {
        this.columnOptions = context.get('table-cols', true);
        this.isPlain = context.getBoolean('table-plain', false, true);
        this.cells.push([new ParagraphElement_1.ParagraphElement(context)]);
        this.cellOptions.push(['']);
        this.paragraph = this.cells[0][0];
        this.onEnterCell(context);
    };
    TableElement.prototype.exit = function (context) {
        this.onExitCell(context);
    };
    TableElement.prototype.event = function (name, context, initiator) {
        switch (name) {
            case 'par':
                context.throw('NO_PARAGRAPHS_IN_TABLES', initiator);
                return true;
            case 'r':
                this.onExitCell(context);
                this.row++;
                this.col = 0;
                while (this.cells.length <= this.row)
                    this.cells.push([]);
                while (this.cellOptions.length <= this.row)
                    this.cellOptions.push([]);
                if (this.cells[this.row].length === 0)
                    this.cells[this.row].push(new ParagraphElement_1.ParagraphElement(context));
                if (this.cellOptions[this.row].length === 0)
                    this.cellOptions[this.row].push('');
                this.paragraph = this.cells[this.row][0];
                this.onEnterCell(context);
                return true;
            case 'c':
                this.onExitCell(context);
                this.col++;
                while (this.cells[this.row].length <= this.col)
                    this.cells[this.row].push(new ParagraphElement_1.ParagraphElement(context));
                while (this.cellOptions[this.row].length <= this.col)
                    this.cellOptions[this.row].push('');
                this.paragraph = this.cells[this.row][this.col];
                this.onEnterCell(context);
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    TableElement.prototype.onEnterCell = function (context) {
        context.enterSemisimple();
    };
    TableElement.prototype.onExitCell = function (context) {
        var options = context.get('table-cell-opt');
        if (options && this.cellOptions[this.row])
            this.cellOptions[this.row][this.col] = options;
        context.exitSemisimple();
        context.flushSpan();
    };
    TableElement.prototype.render = function (options) {
        var _a, _b, _c, _d, _e, _f;
        var div = document.createElement('div');
        div.classList.add('table-wrapper');
        var table = document.createElement('table');
        if (!this.isPlain)
            table.classList.add('wikitable');
        div.append(table);
        var tbody = document.createElement('tbody');
        table.append(tbody);
        var colAlign = [];
        if (this.columnOptions) {
            for (var _i = 0, _g = ((_a = this.columnOptions) !== null && _a !== void 0 ? _a : '').split(''); _i < _g.length; _i++) {
                var char = _g[_i];
                if (/[lcr]/i.test(char))
                    colAlign.push(char.toLowerCase());
            }
        }
        for (var r = 0; r < this.cells.length; r++) {
            var tr = document.createElement('tr');
            table.append(tr);
            var row = this.cells[r];
            for (var c = 0; c < row.length; c++) {
                var options_1 = (_b = this.cellOptions[r][c]) !== null && _b !== void 0 ? _b : '';
                var isTh = options_1.includes('[!]');
                var align = (_c = colAlign[c]) !== null && _c !== void 0 ? _c : '';
                for (var _h = 0, _j = (_d = options_1.match(/\[[lcr]\]/gi)) !== null && _d !== void 0 ? _d : []; _h < _j.length; _h++) {
                    var match = _j[_h];
                    align = match[1].toLowerCase();
                }
                if (align)
                    align = align === 'l' ? 'left' : align === 'r' ? 'right' : 'center';
                var rowspan = 0;
                for (var _k = 0, _l = (_e = options_1.match(/\[r\d+\]/gi)) !== null && _e !== void 0 ? _e : []; _k < _l.length; _k++) {
                    var match = _l[_k];
                    rowspan = parseInt(match.substring(2, match.length - 1));
                }
                var colspan = 0;
                for (var _m = 0, _o = (_f = options_1.match(/\[c\d+\]/gi)) !== null && _f !== void 0 ? _f : []; _m < _o.length; _m++) {
                    var match = _o[_m];
                    colspan = parseInt(match.substring(2, match.length - 1));
                }
                var td = document.createElement(isTh ? 'th' : 'td');
                if (align)
                    td.setAttribute('style', 'text-align:' + align);
                if (rowspan)
                    td.setAttribute('rowspan', rowspan.toString());
                if (colspan)
                    td.setAttribute('colspan', colspan.toString());
                tr.append(td);
                var content = row[c].renderInner();
                td.append.apply(td, content);
            }
        }
        return [div];
    };
    return TableElement;
}());
exports.TableElement = TableElement;
//# sourceMappingURL=TableElement.js.map