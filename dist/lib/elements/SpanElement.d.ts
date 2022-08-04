import { Context } from '../Context';
import { RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { TextNode } from './TextNode';
export interface SpanStyle {
    italic?: boolean;
    bold?: boolean;
    colour?: string;
    fontSize?: number;
    preservesSpaces?: boolean;
    lang?: string;
    classes?: string;
    sup?: boolean;
    sub?: boolean;
}
export declare class SpanElement implements RenderElement {
    name: 'span';
    children: TextNode[];
    style: SpanStyle;
    spacyCommand?: Token;
    static colourRegex: RegExp;
    static langRegex: RegExp;
    static minFontSize: number;
    static maxFontSize: number;
    isEmpty(): boolean;
    normalise(): void;
    initialise(context: Context): void;
    canMergeWith(span: SpanElement): boolean;
    append(text: string, source?: Token): void;
    getText(): string;
    render(options?: RenderOptions): Node[];
}
//# sourceMappingURL=SpanElement.d.ts.map