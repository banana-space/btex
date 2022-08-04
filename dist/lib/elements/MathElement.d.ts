import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
import { SpanStyle } from './SpanElement';
export declare class MathElement implements ContainerElement {
    name: 'math';
    mainParagraph: ParagraphElement;
    paragraph: ParagraphElement;
    children: RenderElement[];
    isInline: boolean;
    isScriptStyle?: boolean;
    isDiagramCell?: boolean;
    style: SpanStyle;
    tagMode?: 'left' | 'right';
    tagLeft?: ParagraphElement;
    tagRight?: ParagraphElement;
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context): void;
    exit(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
    getText(): string;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=MathElement.d.ts.map