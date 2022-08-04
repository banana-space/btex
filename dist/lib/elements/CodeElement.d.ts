import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';
export declare class CodeElement implements ContainerElement {
    name: 'code';
    text: string;
    lang?: string;
    isInline: boolean;
    paragraph: ParagraphElement;
    normalise(): void;
    isEmpty(): boolean;
    enter(context: Context): void;
    event(): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=CodeElement.d.ts.map