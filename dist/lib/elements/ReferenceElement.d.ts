import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { LabelElement } from './LabelElement';
import { ParagraphElement } from './ParagraphElement';
import { SpanStyle } from './SpanElement';
export declare class ReferenceElement implements ContainerElement {
    name: 'ref';
    page?: string;
    key?: string;
    url?: string;
    pageSuffix?: string;
    inferPage?: boolean;
    noLink: boolean;
    isInline: boolean;
    paragraph: ParagraphElement;
    target?: LabelElement;
    style: SpanStyle;
    spacingType?: {
        first: string;
        last: string;
    };
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context): void;
    exit(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): Node[];
}
//# sourceMappingURL=ReferenceElement.d.ts.map