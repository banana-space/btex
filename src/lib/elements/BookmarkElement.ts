import { RenderElement } from '../Element';

export class BookmarkElement implements RenderElement {
  name: 'bookmark' = 'bookmark';
  prefix?: string;
  id: number = -1;
  isUnused?: boolean;

  isEmpty(): boolean {
    return this.isUnused === true;
  }

  normalise() {}

  render(): HTMLElement[] {
    if (this.isUnused) return [];
    let element = document.createElement('span');
    element.setAttribute('id', (this.prefix ?? '') + (this.id + 1));
    return [element];
  }
}
