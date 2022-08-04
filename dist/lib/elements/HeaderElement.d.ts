import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class HeaderElement implements ContainerElement {
    name: 'header';
    type?: string;
    hash?: string;
    numberHTML?: string;
    noToc?: boolean;
    paragraph: ParagraphElement;
    isInline: boolean;
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context, initiator: Token): void;
    exit(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=HeaderElement.d.ts.map