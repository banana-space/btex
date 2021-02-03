import { Context } from './Context';
import { DivElement } from './elements/DivElement';
import { HeaderElement } from './elements/HeaderElement';
import { ListElement } from './elements/ListElement';
import { MathElement } from './elements/MathElement';
import { ParagraphElement } from './elements/ParagraphElement';
import { ReferenceElement } from './elements/ReferenceElement';
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

  enter?(context: Context): void;

  exit?(context: Context): void;

  event(name: string, context: Context, initiator: Token): boolean;

  render(options?: RenderOptions): HTMLElement[];
}

interface ContainerConstructor {
  new (): ContainerElement;
}

export const Containers: { [name: string]: ContainerConstructor } = {
  div: DivElement,
  header: HeaderElement,
  list: ListElement,
  math: MathElement,
  ref: ReferenceElement,
};
