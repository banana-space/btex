import { RenderElement } from '../Element';
export declare class BookmarkElement implements RenderElement {
    name: 'bookmark';
    prefix?: string;
    id: number;
    isUnused?: boolean;
    isEmpty(): boolean;
    normalise(): void;
    render(): HTMLElement[];
}
//# sourceMappingURL=BookmarkElement.d.ts.map