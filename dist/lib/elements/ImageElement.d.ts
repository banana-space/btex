import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class ImageElement implements ContainerElement {
    name: 'image';
    paragraph: ParagraphElement;
    isInline: boolean;
    source?: string;
    imageOptions?: string;
    width?: string;
    height?: string;
    constructor();
    isEmpty(): boolean;
    normalise(): void;
    parseOption(imageOptions: string): void;
    enter(context: Context, initiator: Token): void;
    event(name: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=ImageElement.d.ts.map