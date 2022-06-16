import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';

export class ListElement implements ContainerElement {
  name: 'list' = 'list';
  classes?: string;
  children: {
    label: RenderElement[];
    content: RenderElement[];
    classes: string[];
    indent?: number;
  }[] = [];

  // This first paragraph element will not be rendered; rendering starts after the first \item.
  paragraph: ParagraphElement = new ParagraphElement();

  contentMode: boolean = true;

  normalise() {
    for (let child of this.children) {
      for (let e of child.label) e.normalise();
      child.label = child.label.filter((e) => !e.isEmpty());
      for (let e of child.content) e.normalise();
      child.content = child.content.filter((e) => !e.isEmpty());
    }
    this.children = this.children.filter(
      (child) => child.label.length > 0 || child.content.length > 0
    );
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  enter(context: Context) {
    this.classes = context.get('g.list-classes', true);
  }

  event(arg: string, context: Context): boolean {
    // TODO: errors when returning false
    switch (arg) {
      case '+':
        if (!this.contentMode) return false;
        this.paragraph = new ParagraphElement();
        let indent: number | undefined = context.getInteger('list-indent', 0, true);
        if (!(indent >= 1 && indent <= 3)) indent = undefined;
        this.children.push({ label: [this.paragraph], content: [], classes: [], indent });
        this.contentMode = false;
        return true;
      case '.':
        if (this.children.length === 0 || this.contentMode) return false;
        this.contentMode = true;
        this.paragraph = new ParagraphElement(context);

        this.children[this.children.length - 1].content.push(this.paragraph);
        if (context.getBoolean('list-item-no-sep-above', false, true)) {
          if (this.children.length > 1)
            this.children[this.children.length - 2].classes.push('list-item-no-sep');
          else this.classes = ((this.classes ?? '') + ' list-no-sep-above').trim();
        }
        return true;
      case 'par':
        let child = this.children[this.children.length - 1];
        if (!child) return true;
        let list = this.contentMode ? child.content : child.label;
        this.paragraph = new ParagraphElement(context);
        list.push(this.paragraph);
        return true;
    }
    return false;
  }

  render(options?: RenderOptions): HTMLTableElement[] {
    if (this.isEmpty()) return [];

    let table = document.createElement('table');
    table.classList.add('list');
    if (this.classes) table.classList.add(...this.classes.split(' '));

    for (let child of this.children) {
      let tr = document.createElement('tr');
      tr.classList.add('list-item');
      for (let cls of child.classes) tr.classList.add(cls);
      if (child.indent) tr.classList.add(`list-item-indent-${child.indent}`);
      table.append(tr);

      let td = document.createElement('td');
      td.classList.add('list-item-label');
      tr.append(td);
      for (let e of child.label) td.append(...e.render(options));

      td = document.createElement('td');
      td.classList.add('list-item-content');
      tr.append(td);
      for (let e of child.content) td.append(...e.render(options));
    }

    return [table];
  }
}
