import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class DivElement implements ContainerElement {
    name: 'div';
    type: string;
    classList: string[];
    headerParagraph?: ParagraphElement;
    paragraph: ParagraphElement;
    children: RenderElement[];
    normalise(): void;
    isEmpty(): boolean;
    enter(context: Context): void;
    event(arg: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLDivElement[];
}
//# sourceMappingURL=DivElement.d.ts.map