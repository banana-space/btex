"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Containers = void 0;
var CaptionElement_1 = require("./elements/CaptionElement");
var DiagramElement_1 = require("./elements/DiagramElement");
var DivElement_1 = require("./elements/DivElement");
var FigureElement_1 = require("./elements/FigureElement");
var HeaderElement_1 = require("./elements/HeaderElement");
var ImageElement_1 = require("./elements/ImageElement");
var ListElement_1 = require("./elements/ListElement");
var MathElement_1 = require("./elements/MathElement");
var ReferenceElement_1 = require("./elements/ReferenceElement");
var TableElement_1 = require("./elements/TableElement");
var TableOfContentElement_1 = require("./elements/TableOfContentElement");
var TikzElement_1 = require("./elements/TikzElement");
exports.Containers = {
    diagram: DiagramElement_1.DiagramElement,
    div: DivElement_1.DivElement,
    header: HeaderElement_1.HeaderElement,
    list: ListElement_1.ListElement,
    math: MathElement_1.MathElement,
    table: TableElement_1.TableElement,
    toc: TableOfContentElement_1.TabelOfContentElement,
    ref: ReferenceElement_1.ReferenceElement,
    tikz: TikzElement_1.TikzElement,
    image: ImageElement_1.ImageElement,
    figure: FigureElement_1.FigureElement,
    caption: CaptionElement_1.CaptionElement,
};
//# sourceMappingURL=Element.js.map