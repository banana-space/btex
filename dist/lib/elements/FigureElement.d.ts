import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class FigureElement implements ContainerElement {
    name: 'figure';
    paragraph: ParagraphElement;
    isInline: boolean;
    textAlign: string;
    constructor();
    isEmpty(): boolean;
    getText(): string;
    normalise(): void;
    enter(context: Context, initiator: Token): void;
    event(arg: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=FigureElement.d.ts.map