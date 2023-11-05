import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class CaptionElement implements ContainerElement {
    name: 'caption';
    paragraph: ParagraphElement;
    isInline: boolean;
    constructor();
    isEmpty(): boolean;
    getText(): string;
    normalise(): void;
    enter(context: Context, initiator: Token): void;
    event(arg: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=CaptionElement.d.ts.map