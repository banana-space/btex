import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class FunctionElement implements ContainerElement {
    name: 'fun';
    isInline: boolean;
    functionName: string;
    paragraph: ParagraphElement;
    children: ParagraphElement[];
    normalise(): void;
    isEmpty(): boolean;
    enter(context: Context): void;
    event(arg: string, context: Context, initiator: Token): boolean;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=FunctionElement.d.ts.map