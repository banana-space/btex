import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';
import { Token } from '../Token';
export declare class TikzElement implements ContainerElement {
    name: 'tikz';
    paragraph: ParagraphElement;
    isInline: boolean;
    variant: string;
    noRender: boolean;
    initiator?: Token;
    svg?: string;
    placeholder?: HTMLElement;
    isEmpty(): boolean;
    normalise(): void;
    getText(): string;
    event(name: string, context: Context, initiator: Token): boolean;
    enter(context: Context, initiator: Token): void;
    exit(context: Context): void;
    render(options?: RenderOptions): Node[];
    asyncRender(text: string): Promise<undefined>;
}
//# sourceMappingURL=TikzElement.d.ts.map