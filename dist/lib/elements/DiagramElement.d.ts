import { Bezier, Point } from 'bezier-js';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { MathElement } from './MathElement';
import { ParagraphElement } from './ParagraphElement';
export declare class DiagramElement implements ContainerElement {
    name: 'diagram';
    isInline: boolean;
    id: string;
    cells: Cell[][];
    arrows: Arrow[];
    activeArrow?: Arrow;
    activeLabel?: ArrowLabel;
    columnOptions?: string;
    paragraph: ParagraphElement;
    row: number;
    column: number;
    rowSep: number;
    columnSep: number;
    rowSepBetweenOrigins: boolean;
    columnSepBetweenOrigins: boolean;
    cellPaddingX: number;
    cellPaddingY: number;
    labelPadding: number;
    rendered: boolean;
    renderResult: HTMLElement[];
    renderedHeight: number;
    renderedWidth: number;
    rowHeight: number[];
    rowDepth: number[];
    rowPosition: number[];
    columnWidth: number[];
    columnPosition: number[];
    private svgId;
    constructor();
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context): void;
    exit(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
    private diagramOption;
    private toEm;
    private arrowOption;
    private createPathElement;
    private computeLayout;
    private getKatexHeight;
    private getCellBBox;
    private drawArrowHead;
    private getJaxSize;
    private parseLength;
}
declare class Cell {
    content: MathElement;
    html: string;
    size: BoxSize;
    constructor();
}
declare class Arrow {
    r1: number;
    c1: number;
    r2: number;
    c2: number;
    head: string;
    tail: string;
    lineType: string;
    lineWidth: number;
    labels: ArrowLabel[];
    dashArray?: number[];
    bend?: number;
    bendLooseness?: number;
    shift?: number;
    whiteout?: number;
    bezier?: Bezier;
    constructor(r1: number, c1: number, r2: number, c2: number);
}
declare class ArrowLabel {
    content: MathElement;
    progress: number;
    side: number;
    position: Point;
    html: string;
    size: {
        width: number;
        height: number;
    };
    heightAboveBaseline: number;
    whiteout?: boolean;
    isVirtual?: boolean;
    constructor();
}
interface BoxSize {
    height: number;
    depth: number;
    width: number;
}
export {};
//# sourceMappingURL=DiagramElement.d.ts.map