"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramElement = void 0;
var bezier_js_1 = require("bezier-js");
var MathElement_1 = require("./MathElement");
var ParagraphElement_1 = require("./ParagraphElement");
var MathJax;
require('mathjax')
    .init({
    loader: { load: ['input/tex', 'output/svg'] },
})
    .then(function (m) { return (MathJax = m); });
var DiagramElement = /** @class */ (function () {
    function DiagramElement() {
        this.name = 'diagram';
        this.isInline = true;
        this.cells = [];
        this.arrows = [];
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        // current cell
        this.row = 0;
        this.column = 0;
        // options
        this.rowSep = 1.8;
        this.columnSep = 2.4;
        this.rowSepBetweenOrigins = false;
        this.columnSepBetweenOrigins = false;
        this.cellPaddingX = 0.5;
        this.cellPaddingY = 0.5;
        this.labelPadding = 0.3;
        // render results
        this.rendered = false;
        this.renderResult = [];
        this.renderedHeight = 0;
        this.renderedWidth = 0;
        this.rowHeight = [];
        this.rowDepth = [];
        this.rowPosition = [];
        this.columnWidth = [];
        this.columnPosition = [];
        this.svgId = 0;
        this.id = '';
        for (var i = 0; i < 16; i++)
            this.id += Math.floor(Math.random() * 16).toString(16);
    }
    DiagramElement.prototype.isEmpty = function () {
        return false;
    };
    DiagramElement.prototype.normalise = function () { };
    DiagramElement.prototype.enter = function (context) {
        var cell = new Cell();
        this.cells.push([cell]);
        this.paragraph = cell.content.paragraph;
    };
    DiagramElement.prototype.exit = function (context) {
        context.flushSpan();
    };
    DiagramElement.prototype.event = function (name, context, initiator) {
        var _a, _b;
        switch (name) {
            case 'par':
                return true;
            case 'r':
                context.flushSpan();
                this.row++;
                this.column = 0;
                while (this.cells.length <= this.row)
                    this.cells.push([]);
                if (this.cells[this.row].length === 0)
                    this.cells[this.row].push(new Cell());
                this.paragraph = this.cells[this.row][this.column].content.paragraph;
                return true;
            case 'c':
                context.flushSpan();
                this.column++;
                while (this.cells[this.row].length <= this.column)
                    this.cells[this.row].push(new Cell());
                this.paragraph = this.cells[this.row][this.column].content.paragraph;
                return true;
            case 'ar':
                var ar = new Arrow(this.row, this.column, this.row, this.column);
                this.activeArrow = ar;
                this.arrows.push(ar);
                var virtualLabel = new ArrowLabel();
                virtualLabel.isVirtual = true;
                this.activeLabel = virtualLabel;
                return true;
            case 'option':
                var o = ((_a = context.get('diagram-option', true)) !== null && _a !== void 0 ? _a : '').trim();
                this.diagramOption(o);
                return true;
            case 'ar-option':
                var option = ((_b = context.get('ar-option', true)) !== null && _b !== void 0 ? _b : '').trim();
                this.arrowOption(option);
                return true;
            case 'ar-label':
                context.flushSpan();
                if (!this.activeLabel || !this.activeLabel.isVirtual)
                    this.activeLabel = new ArrowLabel();
                else
                    this.activeLabel.isVirtual = false;
                this.paragraph = this.activeLabel.content.paragraph;
                return true;
            case 'ar-endlabel':
                context.flushSpan();
                this.paragraph = this.cells[this.row][this.column].content.paragraph;
                if (!this.activeArrow || !this.activeLabel || this.activeLabel.isVirtual)
                    return true;
                this.activeArrow.labels.push(this.activeLabel);
                if (this.activeArrow.lineType === '') {
                    this.activeLabel.side = 0;
                    this.activeLabel.content.isScriptStyle = false;
                }
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    DiagramElement.prototype.render = function (options) {
        if (this.rendered)
            return this.renderResult;
        var rootSpan = document.createElement('span');
        rootSpan.classList.add('btex-diagram');
        // Calculate sizes & positions
        this.computeLayout();
        var width = this.renderedWidth;
        var height = this.renderedHeight;
        rootSpan.style.height = height + 'em';
        rootSpan.style.width = width + 'em';
        rootSpan.style.verticalAlign = (height / 2).toFixed(3) + 'em';
        // Insert overlay
        var svg = document.createElement('svg');
        svg.classList.add('overlay');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.style.width = width + 'em';
        svg.style.height = height + 'em';
        svg.setAttribute('viewBox', "0 0 ".concat(width, " ").concat(height));
        svg.setAttribute('version', '1.1');
        rootSpan.append(svg);
        var defs = document.createElement('defs');
        svg.append(defs);
        // Draw cells
        for (var r = 0; r < this.cells.length; r++) {
            for (var c = 0; c < this.cells[r].length; c++) {
                var cell = this.cells[r][c];
                var compensation = Math.max(0, 0.9 - cell.size.height + this.cellPaddingY) / 2 -
                    Math.max(0, 0.36 - cell.size.depth + this.cellPaddingY) / 2;
                var cellSpan = document.createElement('span');
                cellSpan.classList.add('cell');
                cellSpan.style.top =
                    (this.rowPosition[r] - (cell.size.height - cell.size.depth) / 2 - compensation).toFixed(3) + 'em';
                cellSpan.style.left = this.columnPosition[c].toFixed(3) + 'em';
                cellSpan.innerHTML = cell.html;
                rootSpan.append(cellSpan);
            }
        }
        // Draw arrows
        for (var _i = 0, _a = this.arrows; _i < _a.length; _i++) {
            var arrow = _a[_i];
            if (!(this.cells[arrow.r1][arrow.c1] && this.cells[arrow.r2][arrow.c2]))
                continue;
            if (!arrow.bezier)
                continue;
            // draw arrow body
            var bezier = arrow.bezier;
            var mask = document.createElement('mask');
            mask.innerHTML = "<rect x=\"0\" y=\"0\" width=\"".concat(width, "\" height=\"").concat(height, "\" fill=\"white\" />");
            var path = void 0;
            switch (arrow.lineType) {
                case 'single':
                    path = this.createPathElement(bezier, arrow);
                    svg.append(path);
                    break;
                case 'double':
                    var maskPath = this.createPathElement(bezier, arrow);
                    maskPath.style.stroke = 'black';
                    maskPath.style.strokeWidth = (arrow.lineWidth * 4).toString();
                    maskPath.style.strokeLinecap = 'square';
                    mask.append(maskPath);
                    path = this.createPathElement(bezier, arrow);
                    path.style.strokeWidth = (arrow.lineWidth * 6).toFixed(3);
                    svg.append(path);
                    break;
            }
            svg.append.apply(svg, this.drawArrowHead(bezier.get(0), { x: -bezier.derivative(0.01).x, y: -bezier.derivative(0.01).y }, arrow.tail, arrow.lineWidth));
            svg.append.apply(svg, this.drawArrowHead(bezier.get(1), bezier.derivative(0.99), arrow.head, arrow.lineWidth));
            // labels with whiteout
            for (var _b = 0, _c = arrow.labels; _b < _c.length; _b++) {
                var label = _c[_b];
                if (!label.whiteout)
                    continue;
                var rect = document.createElement('rect');
                rect.setAttribute('x', (label.position.x - label.size.width / 2).toFixed(3));
                rect.setAttribute('y', (label.position.y - label.size.height / 2).toFixed(3));
                rect.setAttribute('width', label.size.width.toFixed(3));
                rect.setAttribute('height', label.size.height.toFixed(3));
                rect.setAttribute('fill', 'black');
                rect.style.stroke = 'black';
                rect.style.strokeWidth = (this.labelPadding * 2).toFixed(3);
                rect.style.strokeLinejoin = 'round';
                mask.append(rect);
            }
            // arrows with whiteout
            var afterSelf = false;
            for (var _d = 0, _e = this.arrows; _d < _e.length; _d++) {
                var otherArrow = _e[_d];
                if (otherArrow === arrow) {
                    afterSelf = true;
                    continue;
                }
                if (otherArrow.whiteout &&
                    otherArrow.bezier &&
                    (!arrow.whiteout || afterSelf) &&
                    bezier.overlaps(otherArrow.bezier)) {
                    var maskPath = this.createPathElement(otherArrow.bezier, otherArrow);
                    maskPath.style.stroke = 'black';
                    maskPath.style.strokeWidth = (otherArrow.lineWidth *
                        (12 + (otherArrow.lineType === 'double' ? 6 : 0)) *
                        otherArrow.whiteout).toString();
                    mask.append(maskPath);
                }
            }
            // insert mask element
            if (path && mask.children.length > 1) {
                var maskId = this.id + '-' + this.svgId;
                mask.id = maskId;
                path.setAttribute('mask', "url(#".concat(maskId, ")"));
                defs.append(mask);
                this.svgId++;
                // Firefox bug: mask doesn't work on objects with no height or no width
                var bbox = bezier.bbox();
                if (bbox.x.max - bbox.x.min < 1 || bbox.y.max - bbox.y.min < 1)
                    path.setAttribute('d', path.getAttribute('d') + ' m -10000 0 l 1 1');
            }
            // draw labels
            for (var _f = 0, _g = arrow.labels; _f < _g.length; _f++) {
                var label = _g[_f];
                var compensation = Math.max(0, 0.9 - label.heightAboveBaseline) / 2 -
                    Math.max(0, 0.36 - (label.size.height - label.heightAboveBaseline)) / 2;
                var labelSpan = document.createElement('span');
                labelSpan.classList.add('label');
                labelSpan.style.top = (label.position.y - compensation).toFixed(3) + 'em';
                labelSpan.style.left = label.position.x.toFixed(3) + 'em';
                labelSpan.innerHTML = label.html;
                if (labelSpan.children.length === 1)
                    labelSpan.innerHTML = labelSpan.children[0].innerHTML;
                rootSpan.append(labelSpan);
            }
        }
        this.rendered = true;
        this.renderResult = [rootSpan];
        return this.renderResult;
    };
    DiagramElement.prototype.diagramOption = function (option) {
        if (option.includes('=')) {
            var index = option.indexOf('=');
            var key = option.substring(0, index).trim();
            var value = option.substring(index + 1, option.length).trim();
            switch (key) {
                case 'column sep':
                    var columnSep = this.toEm(value, false);
                    if (isFinite(columnSep))
                        this.columnSep = columnSep;
                    if (value.includes('between origins'))
                        this.columnSepBetweenOrigins = true;
                    return;
                case 'row sep':
                    var rowSep = this.toEm(value, true);
                    if (isFinite(rowSep))
                        this.rowSep = rowSep;
                    if (value.includes('between origins'))
                        this.rowSepBetweenOrigins = true;
                    return;
            }
            return;
        }
    };
    DiagramElement.prototype.toEm = function (length, isRowSep) {
        length = length
            .replace(/^tiny/, isRowSep ? '0.45em' : '0.6em')
            .replace(/^small/, isRowSep ? '0.9em' : '1.2em')
            .replace(/^scriptsize/, isRowSep ? '1.35em' : '1.8em')
            .replace(/^normal/, isRowSep ? '1.8em' : '2.4em')
            .replace(/^large/, isRowSep ? '2.7em' : '3.6em')
            .replace(/^huge/, isRowSep ? '3.6em' : '4.8em');
        var match = length.match(/^\s*(-?\d*\.?\d*)\s*(em|ex|pt)/);
        if (!match)
            return NaN;
        var value = parseFloat(match[1]);
        switch (match[2]) {
            case 'em':
                return value;
            case 'ex':
                return value * 0.45;
            case 'pt':
                return value * 0.1;
        }
        return NaN;
    };
    DiagramElement.prototype.arrowOption = function (option) {
        if (!this.activeArrow)
            return;
        var arrow = this.activeArrow;
        if (/^[udlr]+$/.test(option)) {
            var offsetX = 0, offsetY = 0;
            for (var i = 0; i < option.length; i++) {
                switch (option[i]) {
                    case 'u':
                        offsetY--;
                        break;
                    case 'd':
                        offsetY++;
                        break;
                    case 'l':
                        offsetX--;
                        break;
                    case 'r':
                        offsetX++;
                        break;
                }
            }
            arrow.c2 = arrow.c1 + offsetX;
            arrow.r2 = arrow.r1 + offsetY;
            return;
        }
        if (option.includes('=')) {
            var index = option.indexOf('=');
            var key = option.substring(0, index).trim();
            var value = option.substring(index + 1, option.length).trim();
            var numValue = parseFloat(value);
            switch (key) {
                case 'pos':
                    if (isFinite(numValue) && this.activeLabel)
                        this.activeLabel.progress = Math.max(0, Math.min(1, numValue));
                    return;
                case 'distance':
                    if (isFinite(numValue) && this.activeLabel)
                        this.activeLabel.side =
                            Math.max(0, Math.min(100, numValue)) * (this.activeLabel.side >= 0 ? 1 : -1);
                    return;
                case 'bend left':
                    if (isFinite(numValue))
                        arrow.bend = numValue;
                    return;
                case 'bend right':
                    if (isFinite(numValue))
                        arrow.bend = -numValue;
                    return;
                case 'looseness':
                    if (isFinite(numValue))
                        arrow.bendLooseness = Math.max(0, Math.min(10, numValue));
                    return;
                case 'shift left':
                    if (isFinite(numValue))
                        arrow.shift = Math.max(-100, Math.min(100, numValue));
                    return;
                case 'shift right':
                    if (isFinite(numValue))
                        arrow.shift = Math.max(-100, Math.min(100, -numValue));
                    return;
                case 'whiteout':
                    if (isFinite(numValue))
                        arrow.shift = Math.max(0, Math.min(10, -numValue));
                    return;
            }
            return;
        }
        switch (option) {
            case "'":
                if (this.activeLabel)
                    this.activeLabel.side = -1;
                return;
            case 'near start':
                if (this.activeLabel)
                    this.activeLabel.progress = 0.3;
                return;
            case 'near end':
                if (this.activeLabel)
                    this.activeLabel.progress = 0.7;
                return;
            case 'very near start':
                if (this.activeLabel)
                    this.activeLabel.progress = 0.1;
                return;
            case 'very near end':
                if (this.activeLabel)
                    this.activeLabel.progress = 0.9;
                return;
            case 'description':
                if (this.activeLabel) {
                    this.activeLabel.side = 0;
                    this.activeLabel.whiteout = true;
                }
                return;
            case 'marking':
                if (this.activeLabel) {
                    this.activeLabel.side = 0;
                    this.activeLabel.content.isScriptStyle = false;
                }
                return;
            case 'bend left':
                arrow.bend = 30;
                return;
            case 'bend right':
                arrow.bend = -30;
                return;
            case 'shift left':
                arrow.shift = 1;
                return;
            case 'shift right':
                arrow.shift = -1;
                return;
            case 'to head':
                arrow.head = 'to';
                return;
            case 'rightarrow':
                arrow.head = 'to';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'leftarrow':
                arrow.head = '';
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'leftrightarrow':
                arrow.head = 'to';
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'Rightarrow':
                arrow.head = 'To';
                arrow.tail = '';
                arrow.lineType = 'double';
                return;
            case 'Leftarrow':
                arrow.head = '';
                arrow.tail = 'To';
                arrow.lineType = 'double';
                return;
            case 'Leftrightarrow':
                arrow.head = 'To';
                arrow.tail = 'To';
                arrow.lineType = 'double';
                return;
            case 'maps to':
                arrow.tail = 'bar';
                arrow.lineType = 'single';
                return;
            case 'mapsto':
                arrow.head = 'to';
                arrow.tail = 'bar';
                arrow.lineType = 'single';
                return;
            case 'mapsfrom':
                arrow.head = 'bar';
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'Mapsto':
                arrow.head = 'To';
                arrow.tail = 'Bar';
                arrow.lineType = 'double';
                return;
            case 'Mapsfrom':
                arrow.head = 'Bar';
                arrow.tail = 'To';
                arrow.lineType = 'double';
                return;
            case 'hook':
                arrow.tail = 'hook';
                arrow.lineType = 'single';
                return;
            case "hook'":
                arrow.tail = "hook'";
                arrow.lineType = 'single';
                return;
            case 'hookrightarrow':
                arrow.head = 'to';
                arrow.tail = 'hook';
                arrow.lineType = 'single';
                return;
            case 'hookleftarrow':
                arrow.head = "hook'";
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'tail':
                arrow.tail = 'tail';
                arrow.lineType = 'single';
                return;
            case 'rightarrowtail':
                arrow.head = 'to';
                arrow.tail = 'tail';
                arrow.lineType = 'single';
                return;
            case 'leftarrowtail':
                arrow.head = 'tail';
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'two heads':
                arrow.head = 'two heads';
                arrow.lineType = 'single';
                return;
            case 'twoheadrightarrow':
                arrow.head = 'two heads';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'twoheadleftarrow':
                arrow.head = '';
                arrow.tail = 'two heads';
                arrow.lineType = 'single';
                return;
            case 'harpoon':
                arrow.head = 'harpoon';
                arrow.lineType = 'single';
                return;
            case "harpoon'":
                arrow.head = "harpoon'";
                arrow.lineType = 'single';
                return;
            case 'rightharpoonup':
                arrow.head = 'harpoon';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'rightharpoondown':
                arrow.head = "harpoon'";
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'leftharpoonup':
                arrow.head = '';
                arrow.tail = "harpoon'";
                arrow.lineType = 'single';
                return;
            case 'leftharpoondown':
                arrow.head = '';
                arrow.tail = 'harpoon';
                arrow.lineType = 'single';
                return;
            case 'two heads':
                arrow.head = 'two heads';
                arrow.lineType = 'single';
                return;
            case 'twoheadrightarrow':
                arrow.head = 'two heads';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'twoheadleftarrow':
                arrow.head = '';
                arrow.tail = 'two heads';
                arrow.lineType = 'single';
                return;
            case 'dashed':
                arrow.dashArray = [7.5, 5];
                return;
            case 'dashrightarrow':
                arrow.dashArray = [7.5, 5];
                arrow.head = 'to';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'dashleftarrow':
                arrow.dashArray = [7.5, 5];
                arrow.head = '';
                arrow.tail = 'to';
                arrow.lineType = 'single';
                return;
            case 'dotted':
                arrow.dashArray = [1.5, 3];
                return;
            case 'no head':
                arrow.head = '';
                return;
            case 'no tail':
                arrow.tail = '';
                return;
            case 'dash':
                arrow.head = '';
                arrow.tail = '';
                arrow.lineType = 'single';
                return;
            case 'equal':
            case 'equals':
                arrow.head = '';
                arrow.tail = '';
                arrow.lineType = 'double';
                return;
            case 'loop left':
                arrow.bend = -120;
                return;
            case 'loop right':
                arrow.bend = 120;
                return;
            case 'phantom':
                arrow.lineType = '';
                arrow.head = '';
                arrow.tail = '';
                for (var _i = 0, _a = arrow.labels; _i < _a.length; _i++) {
                    var label = _a[_i];
                    label.side = 0;
                    label.content.isScriptStyle = false;
                }
                return;
            case 'crossing over':
            case 'whiteout':
                arrow.whiteout = 1;
                return;
        }
    };
    DiagramElement.prototype.createPathElement = function (bezier, arrow) {
        var path = document.createElement('path');
        path.setAttribute('d', bezier.toSVG().replace(/(\.\d\d\d)\d+/g, '$1'));
        path.style.stroke = 'black';
        path.style.fill = 'none';
        if (arrow) {
            path.style.strokeWidth = arrow.lineWidth.toString();
            if (arrow.dashArray)
                path.style.strokeDasharray = arrow.dashArray.map(function (v) { return v * arrow.lineWidth; }).join(' ');
        }
        return path;
    };
    DiagramElement.prototype.computeLayout = function () {
        var _a, _b;
        // Cells
        for (var r = 0; r < this.cells.length; r++) {
            this.rowHeight.push(0);
            this.rowDepth.push(0);
            for (var c = 0; c < this.cells[r].length; c++) {
                while (this.columnWidth.length <= c)
                    this.columnWidth.push(0);
                var cell = this.cells[r][c];
                var jaxSize = this.getJaxSize(cell.content);
                cell.html = cell.content.render()[0].innerHTML;
                var kh = this.getKatexHeight(cell.html);
                cell.size = {
                    width: jaxSize.width + 2 * this.cellPaddingX,
                    height: (kh.matched ? kh.height : jaxSize.height / 2) + this.cellPaddingY,
                    depth: (kh.matched ? kh.depth : jaxSize.height / 2) + this.cellPaddingY,
                };
                if (cell.size.height > this.rowHeight[r])
                    this.rowHeight[r] = cell.size.height;
                if (cell.size.depth > this.rowDepth[r])
                    this.rowDepth[r] = cell.size.depth;
                if (cell.size.width > this.columnWidth[c])
                    this.columnWidth[c] = cell.size.width;
            }
        }
        var t = this.rowHeight[0];
        this.rowPosition.push(+t.toFixed(3));
        for (var r = 1; r < this.rowHeight.length; r++) {
            t += this.rowSep;
            if (!this.rowSepBetweenOrigins)
                t += this.rowDepth[r - 1] + this.rowHeight[r];
            this.rowPosition.push(+t.toFixed(3));
        }
        var height = +(t + this.rowDepth[this.rowHeight.length - 1]).toFixed(3);
        t = this.columnWidth[0] / 2;
        this.columnPosition.push(+t.toFixed(3));
        for (var r = 1; r < this.columnWidth.length; r++) {
            t += this.columnSep;
            if (!this.columnSepBetweenOrigins)
                t += this.columnWidth[r - 1] / 2 + this.columnWidth[r] / 2;
            this.columnPosition.push(+t.toFixed(3));
        }
        var width = +(t + this.columnWidth[this.columnWidth.length - 1] / 2).toFixed(3);
        // Arrows
        var top = 0, bottom = height, left = 0, right = width;
        var _loop_1 = function (arrow) {
            if (!(this_1.cells[arrow.r1][arrow.c1] && this_1.cells[arrow.r2][arrow.c2]))
                return "continue";
            // match line type with arrowhead
            if (arrow.lineType === 'double') {
                if (arrow.head === 'to')
                    arrow.head = 'To';
                if (arrow.tail === 'to')
                    arrow.tail = 'To';
                if (['hook', "hook'"].includes(arrow.head))
                    arrow.head = '';
                if (['hook', "hook'"].includes(arrow.tail))
                    arrow.tail = '';
            }
            else if (arrow.lineType === 'double') {
                if (arrow.head === 'To')
                    arrow.head = 'to';
                if (arrow.tail === 'To')
                    arrow.tail = 'to';
            }
            // compute bezier curve
            var start = this_1.getCellBBox(arrow.r1, arrow.c1);
            var end = this_1.getCellBBox(arrow.r2, arrow.c2);
            var bend = (_a = arrow.bend) !== null && _a !== void 0 ? _a : 0;
            var looseness = (_b = arrow.bendLooseness) !== null && _b !== void 0 ? _b : 1;
            if (arrow.r1 === arrow.r2 && arrow.c1 === arrow.c2) {
                if (bend < 0.1 && bend > -0.1)
                    return "continue";
                start.Yc -= 0.1 * (bend > 0 ? 1 : -1);
                end.Yc += 0.1 * (bend > 0 ? 1 : -1);
                bend = bend * (bend > 0 ? 1 : -1);
                looseness *= 60;
            }
            if (bend > -5 && bend < 5)
                looseness = Math.min(Math.abs(bend) * 2, looseness);
            var d = {
                x: end.X - start.X,
                y: end.Yc - start.Yc,
            };
            var rotation = {
                x: Math.cos((bend / 180) * Math.PI),
                y: Math.sin((bend / 180) * Math.PI),
            };
            var c1 = {
                x: start.X + ((d.x * rotation.x + d.y * rotation.y) * looseness) / 3,
                y: start.Yc + ((-d.x * rotation.y + d.y * rotation.x) * looseness) / 3,
            };
            var c2 = {
                x: end.X - ((d.x * rotation.x - d.y * rotation.y) * looseness) / 3,
                y: end.Yc - ((d.x * rotation.y + d.y * rotation.x) * looseness) / 3,
            };
            var bezier = new bezier_js_1.Bezier(start.X, start.Yc, c1.x, c1.y, c2.x, c2.y, end.X, end.Yc);
            var startT = Math.min.apply(Math, __spreadArray(__spreadArray(__spreadArray(__spreadArray([1], bezier.lineIntersects(start.lineN), false), bezier.lineIntersects(start.lineS), false), bezier.lineIntersects(start.lineW), false), bezier.lineIntersects(start.lineE), false));
            if (startT === 1)
                startT = 0;
            var endT = Math.max.apply(Math, __spreadArray(__spreadArray(__spreadArray(__spreadArray([0], bezier.lineIntersects(end.lineN), false), bezier.lineIntersects(end.lineS), false), bezier.lineIntersects(end.lineW), false), bezier.lineIntersects(end.lineE), false));
            if (endT === 0)
                endT = 1;
            // add extra margin (4x line width) for certain types of arrow tips
            var specialTips = ['To', 'hook', "hook'", 'tail'];
            if (specialTips.includes(arrow.tail)) {
                var d_1 = bezier.derivative(startT);
                var abs = Math.sqrt(d_1.x * d_1.x + d_1.y * d_1.y);
                startT += (arrow.lineWidth * 4) / abs;
            }
            if (specialTips.includes(arrow.head)) {
                var d_2 = bezier.derivative(endT);
                var abs = Math.sqrt(d_2.x * d_2.x + d_2.y * d_2.y);
                endT -= (arrow.lineWidth * 4) / abs;
            }
            if (endT < startT)
                return "continue";
            // compute shifts
            if (arrow.shift) {
                var absd = Math.sqrt(d.x * d.x + d.y * d.y);
                var normal_1 = { x: d.y / absd, y: -d.x / absd };
                bezier = new bezier_js_1.Bezier(bezier.points.map(function (p) {
                    var _a, _b;
                    return ({
                        x: p.x + normal_1.x * arrow.lineWidth * 6 * ((_a = arrow.shift) !== null && _a !== void 0 ? _a : 0),
                        y: p.y + normal_1.y * arrow.lineWidth * 6 * ((_b = arrow.shift) !== null && _b !== void 0 ? _b : 0),
                    });
                }));
            }
            // bezier done!
            bezier = bezier.split(startT, endT);
            arrow.bezier = bezier;
            var bbox = bezier.bbox();
            var margin = arrow.lineWidth * (arrow.lineType === 'double' ? 10 : 7.5) + 0.1;
            if (bbox.x.min - margin < left)
                left = bbox.x.min - margin;
            if (bbox.x.max + margin > right)
                right = bbox.x.max + margin;
            if (bbox.y.min - margin < top)
                top = bbox.y.min - margin;
            if (bbox.y.max + margin > bottom)
                bottom = bbox.y.max + margin;
            // compute label positions
            for (var _h = 0, _j = arrow.labels; _h < _j.length; _h++) {
                var label = _j[_h];
                var jaxSize = this_1.getJaxSize(label.content);
                label.html = label.content.render()[0].innerHTML;
                var kh = this_1.getKatexHeight(label.html);
                label.size = {
                    width: jaxSize.width,
                    height: kh.matched ? kh.height + kh.depth : jaxSize.height,
                };
                label.heightAboveBaseline = kh.matched ? kh.height : jaxSize.height / 2;
                var origin_1 = arrow.bezier.get(label.progress);
                var normal = arrow.bezier.normal(label.progress);
                var offsetLength = Math.max(Math.abs((label.size.width / 2) * normal.x + (label.size.height / 2) * normal.y), Math.abs((label.size.width / 2) * normal.x - (label.size.height / 2) * normal.y)) + this_1.labelPadding;
                offsetLength += arrow.lineWidth / 2;
                if (arrow.lineType === 'double')
                    offsetLength += arrow.lineWidth * 2.5;
                label.position = {
                    x: origin_1.x - label.side * normal.x * offsetLength,
                    y: origin_1.y - label.side * normal.y * offsetLength,
                };
                var bbox_1 = {
                    x: {
                        min: label.position.x - label.size.width / 2 - this_1.labelPadding,
                        max: label.position.x + label.size.width / 2 + this_1.labelPadding,
                    },
                    y: {
                        min: label.position.y - label.size.height / 2 - this_1.labelPadding,
                        max: label.position.y + label.size.height / 2 + this_1.labelPadding,
                    },
                };
                if (bbox_1.x.min < left)
                    left = bbox_1.x.min;
                if (bbox_1.x.max > right)
                    right = bbox_1.x.max;
                if (bbox_1.y.min < top)
                    top = bbox_1.y.min;
                if (bbox_1.y.max > bottom)
                    bottom = bbox_1.y.max;
            }
        };
        var this_1 = this;
        for (var _i = 0, _c = this.arrows; _i < _c.length; _i++) {
            var arrow = _c[_i];
            _loop_1(arrow);
        }
        // Offset all positions by (-left, -top)
        this.rowPosition = this.rowPosition.map(function (v) { return v - top; });
        this.columnPosition = this.columnPosition.map(function (v) { return v - left; });
        for (var _d = 0, _e = this.arrows; _d < _e.length; _d++) {
            var arrow = _e[_d];
            if (!arrow.bezier)
                continue;
            arrow.bezier = new bezier_js_1.Bezier(arrow.bezier.points.map(function (p) { return ({ x: p.x - left, y: p.y - top }); }));
            for (var _f = 0, _g = arrow.labels; _f < _g.length; _f++) {
                var label = _g[_f];
                label.position = { x: label.position.x - left, y: label.position.y - top };
            }
        }
        this.renderedHeight = bottom - top;
        this.renderedWidth = right - left;
    };
    DiagramElement.prototype.getKatexHeight = function (html) {
        var _a;
        var height = 0, depth = 0;
        var matched = false;
        while (true) {
            var match = html.match(/<span class="strut" style="height:\s*(-?[\d\.]+)em(?:;\s*vertical-align:\s*(-?[\d\.]+)em)?/);
            if (!match)
                break;
            matched = true;
            height = Math.max(height, +match[1] + (+match[2] || 0));
            depth = Math.max(depth, -match[2] || 0);
            html = html.substring(((_a = match.index) !== null && _a !== void 0 ? _a : 0) + 54);
        }
        return { matched: matched, height: height, depth: depth };
    };
    DiagramElement.prototype.getCellBBox = function (row, column) {
        var X = this.columnPosition[column];
        var Y = this.rowPosition[row];
        var Ya = Y - 0.24; // Y is baseline and Yc is centerline
        var size = this.cells[row][column].size;
        var NW = { x: X - size.width / 2, y: Y - size.height };
        var NE = { x: X + size.width / 2, y: Y - size.height };
        var SW = { x: X - size.width / 2, y: Y + size.depth };
        var SE = { x: X + size.width / 2, y: Y + size.depth };
        var lineN = { p1: NW, p2: NE };
        var lineS = { p1: SW, p2: SE };
        var lineW = { p1: NW, p2: SW };
        var lineE = { p1: NE, p2: SE };
        return { X: X, Y: Y, Yc: Ya, size: size, NW: NW, NE: NE, SW: SW, SE: SE, lineN: lineN, lineS: lineS, lineW: lineW, lineE: lineE };
    };
    DiagramElement.prototype.drawArrowHead = function (position, direction, type, width) {
        if (direction.x === 0 && direction.y === 0)
            direction.x = 1;
        var length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;
        if (type === 'tail') {
            type = 'to';
            direction.x *= -1;
            direction.y *= -1;
        }
        function transform(p) {
            return ((position.x + p.x * width * direction.x - p.y * width * direction.y).toFixed(3) +
                ' ' +
                (position.y + p.y * width * direction.x + p.x * width * direction.y).toFixed(3));
        }
        var data = '';
        switch (type) {
            case '':
                return [];
            case 'to':
                data =
                    "M ".concat(transform({ x: -5.4, y: 6.5 }), " ") +
                        "C ".concat(transform({ x: -4.8, y: 3 }), " ") +
                        "".concat(transform({ x: -2, y: 1 }), " ") +
                        "".concat(transform({ x: 0, y: 0 }), " ") +
                        "C ".concat(transform({ x: -2, y: -1 }), " ") +
                        "".concat(transform({ x: -4.8, y: -3 }), " ") +
                        "".concat(transform({ x: -5.4, y: -6.5 }));
                break;
            case 'To':
                data =
                    "M ".concat(transform({ x: -4.5, y: 7.5 }), " ") +
                        "C ".concat(transform({ x: -3, y: 4.5 }), " ") +
                        "".concat(transform({ x: 1.5, y: 1 }), " ") +
                        "".concat(transform({ x: 4.5, y: 0 }), " ") +
                        "C ".concat(transform({ x: 1.5, y: -1 }), " ") +
                        "".concat(transform({ x: -3, y: -4.5 }), " ") +
                        "".concat(transform({ x: -4.5, y: -7.5 }));
                break;
            case 'two heads':
                data =
                    "M ".concat(transform({ x: -5.4, y: 6.5 }), " ") +
                        "C ".concat(transform({ x: -4.8, y: 3 }), " ") +
                        "".concat(transform({ x: -2, y: 1 }), " ") +
                        "".concat(transform({ x: 0, y: 0 }), " ") +
                        "C ".concat(transform({ x: -2, y: -1 }), " ") +
                        "".concat(transform({ x: -4.8, y: -3 }), " ") +
                        "".concat(transform({ x: -5.4, y: -6.5 }), " ") +
                        "M ".concat(transform({ x: -9.9, y: 6.5 }), " ") +
                        "C ".concat(transform({ x: -9.3, y: 3 }), " ") +
                        "".concat(transform({ x: -6.5, y: 1 }), " ") +
                        "".concat(transform({ x: -4.5, y: 0 }), " ") +
                        "C ".concat(transform({ x: -6.5, y: -1 }), " ") +
                        "".concat(transform({ x: -9.3, y: -3 }), " ") +
                        "".concat(transform({ x: -9.9, y: -6.5 }));
                break;
            case 'hook':
                data =
                    "M ".concat(transform({ x: 0, y: 0 }), " ") +
                        "C ".concat(transform({ x: 6, y: 0 }), " ") +
                        "".concat(transform({ x: 6, y: 5 }), " ") +
                        "".concat(transform({ x: 0, y: 5 }));
                break;
            case "hook'":
                data =
                    "M ".concat(transform({ x: 0, y: 0 }), " ") +
                        "C ".concat(transform({ x: 6, y: 0 }), " ") +
                        "".concat(transform({ x: 6, y: -5 }), " ") +
                        "".concat(transform({ x: 0, y: -5 }));
                break;
            case 'bar':
                data = "M ".concat(transform({ x: 0, y: 5 }), " L ").concat(transform({ x: 0, y: -5 }));
                break;
            case 'Bar':
                data = "M ".concat(transform({ x: 0, y: 7.5 }), " L ").concat(transform({ x: 0, y: -7.5 }));
                break;
            case 'harpoon':
                data =
                    "M ".concat(transform({ x: -5.4, y: -6.5 }), " ") +
                        "C ".concat(transform({ x: -4.8, y: -3 }), " ") +
                        "".concat(transform({ x: -2, y: -1 }), " ") +
                        "".concat(transform({ x: 0, y: 0 }), " ") +
                        "L ".concat(transform({ x: -1, y: 0 }));
                break;
            case "harpoon'":
                data =
                    "M ".concat(transform({ x: -5.4, y: 6.5 }), " ") +
                        "C ".concat(transform({ x: -4.8, y: 3 }), " ") +
                        "".concat(transform({ x: -2, y: 1 }), " ") +
                        "".concat(transform({ x: 0, y: 0 }), " ") +
                        "L ".concat(transform({ x: -1, y: 0 }));
                break;
        }
        if (!data)
            return [];
        var path = document.createElement('path');
        path.setAttribute('d', data);
        path.style.stroke = 'black';
        path.style.strokeWidth = width.toString();
        path.style.fill = 'none';
        return [path];
    };
    // Use MathJax to get the size for diagram drawing
    DiagramElement.prototype.getJaxSize = function (math) {
        var text = math.getText();
        if (text === '')
            return { width: 0, height: 0 };
        try {
            var jaxText = text.replace(/u3400-u9fff/g, '{00}');
            var svg = MathJax.tex2svg(jaxText, {
                display: false,
            }).children[0];
            return {
                width: this.parseLength(svg.attributes.width),
                height: this.parseLength(svg.attributes.height),
            };
        }
        catch (_a) {
            return { width: 0, height: 0 };
        }
    };
    // Converts eg '10ex' to 4.5 (em)
    DiagramElement.prototype.parseLength = function (length) {
        return parseFloat(length.replace(/ex/, '')) * 0.45;
    };
    return DiagramElement;
}());
exports.DiagramElement = DiagramElement;
var Cell = /** @class */ (function () {
    function Cell() {
        this.html = '';
        this.size = { height: 0, depth: 0, width: 0 };
        this.content = new MathElement_1.MathElement();
        this.content.isDiagramCell = true;
    }
    return Cell;
}());
var Arrow = /** @class */ (function () {
    function Arrow(r1, c1, r2, c2) {
        this.r1 = r1;
        this.c1 = c1;
        this.r2 = r2;
        this.c2 = c2;
        this.head = 'to';
        this.tail = '';
        this.lineType = 'single';
        this.lineWidth = 0.04;
        this.labels = [];
    }
    return Arrow;
}());
var ArrowLabel = /** @class */ (function () {
    function ArrowLabel() {
        this.content = new MathElement_1.MathElement();
        this.progress = 0.5;
        this.side = 1;
        this.position = { x: 0, y: 0 };
        this.html = '';
        this.size = { width: 0, height: 0 };
        this.heightAboveBaseline = 0;
        // Virtual labels are used to store options before label is created
        this.isVirtual = false;
        this.content.isScriptStyle = true;
    }
    return ArrowLabel;
}());
//# sourceMappingURL=DiagramElement.js.map