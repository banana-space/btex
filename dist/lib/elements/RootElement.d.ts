import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class RootElement implements ContainerElement {
    name: 'root';
    paragraph: ParagraphElement;
    children: RenderElement[];
    isInline: boolean;
    tocRendered?: HTMLElement;
    normalise(): void;
    isEmpty(): boolean;
    event(name: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=RootElement.d.ts.map