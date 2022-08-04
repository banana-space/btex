import { Context } from './Context';
import { ParagraphElement } from './elements/ParagraphElement';
import { Token } from './Token';
export interface RenderOptions {
    inverseSearch?: boolean;
    noKatex?: boolean;
}
export interface RenderElement {
    name: string;
    isEmpty(): boolean;
    normalise(): void;
    render(options?: RenderOptions): Node[];
}
export interface ContainerElement extends RenderElement {
    paragraph: ParagraphElement;
    isInline?: boolean;
    spacingType?: {
        first: string;
        last: string;
    };
    enter?(context: Context, initiator: Token): void;
    exit?(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
}
interface ContainerConstructor {
    new (): ContainerElement;
}
export declare const Containers: {
    [name: string]: ContainerConstructor;
};
export {};
//# sourceMappingURL=Element.d.ts.map