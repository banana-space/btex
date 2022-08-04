import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';
export declare class ListElement implements ContainerElement {
    name: 'list';
    classes?: string;
    children: {
        label: RenderElement[];
        content: RenderElement[];
        classes: string[];
        indent?: number;
    }[];
    paragraph: ParagraphElement;
    contentMode: boolean;
    normalise(): void;
    isEmpty(): boolean;
    enter(context: Context): void;
    event(arg: string, context: Context): boolean;
    render(options?: RenderOptions): HTMLTableElement[];
}
//# sourceMappingURL=ListElement.d.ts.map