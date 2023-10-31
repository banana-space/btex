import { Context } from './Context';
import { CaptionElement } from './elements/CaptionElement';
import { DiagramElement } from './elements/DiagramElement';
import { DivElement } from './elements/DivElement';
import { FigureElement } from './elements/FigureElement';
import { HeaderElement } from './elements/HeaderElement';
import { ImageElement } from './elements/ImageElement';
import { ListElement } from './elements/ListElement';
import { MathElement } from './elements/MathElement';
import { ParagraphElement } from './elements/ParagraphElement';
import { ReferenceElement } from './elements/ReferenceElement';
import { TableElement } from './elements/TableElement';
import { TabelOfContentElement } from './elements/TableOfContentElement';
import { TikzElement } from './elements/TikzElement';
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

export const Containers: { [name: string]: ContainerConstructor } = {
  diagram: DiagramElement,
  div: DivElement,
  header: HeaderElement,
  list: ListElement,
  math: MathElement,
  table: TableElement,
  toc: TabelOfContentElement,
  ref: ReferenceElement,
  tikz: TikzElement,
  image: ImageElement,
  figure: FigureElement,
  caption: CaptionElement,
};
