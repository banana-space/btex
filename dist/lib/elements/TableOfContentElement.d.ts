import { Context } from '../Context';
import { ContainerElement } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
export declare class TabelOfContentElement implements ContainerElement {
    name: 'toc';
    numberHTML?: string;
    bookmarkId: string;
    level: number;
    paragraph: ParagraphElement;
    isInline: boolean;
    isEmpty(): boolean;
    normalise(): void;
    enter(context: Context, initiator: Token): void;
    event(name: string, context: Context, initiator: Token): boolean;
    exit(context: Context): void;
    render(): never[];
}
//# sourceMappingURL=TableOfContentElement.d.ts.map