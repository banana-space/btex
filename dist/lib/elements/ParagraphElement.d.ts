import { Context } from '../Context';
import { RenderElement, RenderOptions } from '../Element';
export declare class ParagraphElement implements RenderElement {
    name: 'paragraph';
    children: RenderElement[];
    style: {
        textAlign?: string;
    };
    constructor(context?: Context);
    clone(): ParagraphElement;
    normalise(): {
        first: string;
        last: string;
    };
    isEmpty(): boolean;
    append(element: RenderElement): void;
    render(options?: RenderOptions): Node[];
    renderInner(options?: RenderOptions): Node[];
    getText(): string;
}
//# sourceMappingURL=ParagraphElement.d.ts.map