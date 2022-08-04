import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class VirtualElement implements ContainerElement {
    name: 'virtual';
    paragraph: ParagraphElement;
    isInline: boolean;
    isEmpty(): boolean;
    normalise(): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(): never[];
    getHTML(options?: RenderOptions): string;
}
//# sourceMappingURL=VirtualElement.d.ts.map