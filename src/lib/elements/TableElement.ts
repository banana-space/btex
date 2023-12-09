import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class TableElement implements ContainerElement {
  name: 'table' = 'table';
  cells: ParagraphElement[][] = [];
  cellOptions: string[][] = [];
  columnOptions?: string;
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = false;
  isPlain: boolean = false;

  // current cell
  row: number = 0;
  col: number = 0;

  isEmpty(): boolean {
    return false;
  }

  normalise() {
    for (let row of this.cells) for (let paragraph of row) paragraph.normalise();
  }

  enter(context: Context) {
    this.columnOptions = context.get('table-cols', true);
    this.isPlain = context.getBoolean('table-plain', false, true);

    this.cells.push([new ParagraphElement(context)]);
    this.cellOptions.push(['']);
    this.paragraph = this.cells[0][0];
    this.onEnterCell(context);
  }

  exit(context: Context) {
    this.onExitCell(context);
  }

  event(name: string, context: Context, initiator: Token) {
    switch (name) {
      case 'par':
        context.throw('NO_PARAGRAPHS_IN_TABLES', initiator);
        return true;
      case 'r':
        this.onExitCell(context);

        this.row++;
        this.col = 0;
        while (this.cells.length <= this.row) this.cells.push([]);
        while (this.cellOptions.length <= this.row) this.cellOptions.push([]);
        if (this.cells[this.row].length === 0)
          this.cells[this.row].push(new ParagraphElement(context));
        if (this.cellOptions[this.row].length === 0) this.cellOptions[this.row].push('');
        this.paragraph = this.cells[this.row][0];

        this.onEnterCell(context);
        return true;
      case 'c':
        this.onExitCell(context);

        this.col++;
        while (this.cells[this.row].length <= this.col)
          this.cells[this.row].push(new ParagraphElement(context));
        while (this.cellOptions[this.row].length <= this.col) this.cellOptions[this.row].push('');
        this.paragraph = this.cells[this.row][this.col];

        this.onEnterCell(context);
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  private onEnterCell(context: Context) {
    context.enterSemisimple();
  }

  private onExitCell(context: Context) {
    let options = context.get('table-cell-opt');
    if (options && this.cellOptions[this.row]) this.cellOptions[this.row][this.col] = options;
    context.exitSemisimple();
    context.flushSpan();
  }

  render(options?: RenderOptions): HTMLElement[] {
    let div = document.createElement('div');
    div.classList.add('table-wrapper');

    let table = document.createElement('table');
    if (!this.isPlain) table.classList.add('wikitable');
    div.append(table);

    let tbody = document.createElement('tbody');
    table.append(tbody);

    let colAlign: string[] = [];
    if (this.columnOptions) {
      for (let char of (this.columnOptions ?? '').split('')) {
        if (/[lcr]/i.test(char)) colAlign.push(char.toLowerCase());
      }
    }

    for (let r = 0; r < this.cells.length; r++) {
      let tr = document.createElement('tr');
      table.append(tr);

      let row = this.cells[r];
      for (let c = 0; c < row.length; c++) {
        let options = this.cellOptions[r][c] ?? '';
        let isTh = options.includes('[!]');

        let align = colAlign[c] ?? '';
        for (let match of options.match(/\[[lcr]\]/gi) ?? []) align = match[1].toLowerCase();
        if (align) align = align === 'l' ? 'left' : align === 'r' ? 'right' : 'center';

        let rowspan = 0;
        for (let match of options.match(/\[r\d+\]/gi) ?? [])
          rowspan = parseInt(match.substring(2, match.length - 1));

        let colspan = 0;
        for (let match of options.match(/\[c\d+\]/gi) ?? [])
          colspan = parseInt(match.substring(2, match.length - 1));

        let td = document.createElement(isTh ? 'th' : 'td');
        if (align) td.setAttribute('style', 'text-align:' + align);
        if (rowspan) td.setAttribute('rowspan', rowspan.toString());
        if (colspan) td.setAttribute('colspan', colspan.toString());
        tr.append(td);

        let content = row[c].renderInner();
        td.append(...content);
      }
    }

    return [div];
  }
}
