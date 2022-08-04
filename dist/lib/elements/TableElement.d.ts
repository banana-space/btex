import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class TableElement implements ContainerElement {
    name: 'table';
    cells: ParagraphElement[][];
    cellOptions: string[][];
    columnOptions?: string;
    paragraph: ParagraphElement;
    isInline: boolean;
    isPlain: boolean;
    row: number;
    col: number;
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context): void;
    exit(context: Context): void;
    event(name: string, context: Context, initiator: Token): boolean;
    private onEnterCell;
    private onExitCell;
    render(options?: RenderOptions): HTMLElement[];
}
//# sourceMappingURL=TableElement.d.ts.map