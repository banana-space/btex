import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class LabelElement implements ContainerElement {
    key: string;
    bookmarkId: string;
    name: 'label';
    paragraph: ParagraphElement;
    isInline: boolean;
    constructor(key: string, bookmarkId: string);
    isEmpty(): boolean;
    normalise(): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(): never[];
    getHTML(options?: RenderOptions): string;
}
//# sourceMappingURL=LabelElement.d.ts.map