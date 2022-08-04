import { Bezier, Point, Line, BBox } from 'bezier-js';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { MathElement } from './MathElement';
import { ParagraphElement } from './ParagraphElement';

let MathJax: any;
require('mathjax')
  .init({
    loader: { load: ['input/tex', 'output/svg'] },
  })
  .then((m: any) => (MathJax = m));

export class DiagramElement implements ContainerElement {
  name: 'diagram' = 'diagram';
  isInline: boolean = true;
  id: string;
  cells: Cell[][] = [];
  arrows: Arrow[] = [];
  activeArrow?: Arrow;
  activeLabel?: ArrowLabel;
  columnOptions?: string;
  paragraph: ParagraphElement = new ParagraphElement();

  // current cell
  row: number = 0;
  column: number = 0;

  // options
  rowSep: number = 1.8;
  columnSep: number = 2.4;
  rowSepBetweenOrigins: boolean = false;
  columnSepBetweenOrigins: boolean = false;
  cellPaddingX: number = 0.5;
  cellPaddingY: number = 0.5;
  labelPadding: number = 0.3;

  // render results
  rendered: boolean = false;
  renderResult: HTMLElement[] = [];
  renderedHeight: number = 0;
  renderedWidth: number = 0;
  rowHeight: number[] = [];
  rowDepth: number[] = [];
  rowPosition: number[] = [];
  columnWidth: number[] = [];
  columnPosition: number[] = [];

  private svgId: number = 0;

  constructor() {
    this.id = '';
    for (let i = 0; i < 16; i++) this.id += Math.floor(Math.random() * 16).toString(16);
  }

  isEmpty(): boolean {
    return false;
  }

  normalise() {}

  enter(context: Context) {
    let cell = new Cell();
    this.cells.push([cell]);
    this.paragraph = cell.content.paragraph;
  }

  exit(context: Context) {
    context.flushSpan();
  }

  event(name: string, context: Context, initiator: Token) {
    switch (name) {
      case 'par':
        return true;

      case 'r':
        context.flushSpan();

        this.row++;
        this.column = 0;
        while (this.cells.length <= this.row) this.cells.push([]);
        if (this.cells[this.row].length === 0) this.cells[this.row].push(new Cell());

        this.paragraph = this.cells[this.row][this.column].content.paragraph;
        return true;

      case 'c':
        context.flushSpan();

        this.column++;
        while (this.cells[this.row].length <= this.column) this.cells[this.row].push(new Cell());

        this.paragraph = this.cells[this.row][this.column].content.paragraph;
        return true;

      case 'ar':
        let ar = new Arrow(this.row, this.column, this.row, this.column);
        this.activeArrow = ar;
        this.arrows.push(ar);

        let virtualLabel = new ArrowLabel();
        virtualLabel.isVirtual = true;
        this.activeLabel = virtualLabel;
        return true;

      case 'option':
        let o = (context.get('diagram-option', true) ?? '').trim();
        this.diagramOption(o);

        return true;

      case 'ar-option':
        let option = (context.get('ar-option', true) ?? '').trim();
        this.arrowOption(option);

        return true;

      case 'ar-label':
        context.flushSpan();

        if (!this.activeLabel || !this.activeLabel.isVirtual) this.activeLabel = new ArrowLabel();
        else this.activeLabel.isVirtual = false;
        this.paragraph = this.activeLabel.content.paragraph;

        return true;

      case 'ar-endlabel':
        context.flushSpan();
        this.paragraph = this.cells[this.row][this.column].content.paragraph;

        if (!this.activeArrow || !this.activeLabel || this.activeLabel.isVirtual) return true;
        this.activeArrow.labels.push(this.activeLabel);

        if (this.activeArrow.lineType === '') {
          this.activeLabel.side = 0;
          this.activeLabel.content.isScriptStyle = false;
        }

        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    if (this.rendered) return this.renderResult;

    let rootSpan = document.createElement('span');
    rootSpan.classList.add('btex-diagram');

    // Calculate sizes & positions
    this.computeLayout();
    let width = this.renderedWidth;
    let height = this.renderedHeight;

    rootSpan.style.height = height + 'em';
    rootSpan.style.width = width + 'em';
    rootSpan.style.verticalAlign = (height / 2).toFixed(3) + 'em';

    // Insert overlay
    let svg = document.createElement('svg');
    svg.classList.add('overlay');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.width = width + 'em';
    svg.style.height = height + 'em';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('version', '1.1');
    rootSpan.append(svg);

    let defs = document.createElement('defs');
    svg.append(defs);

    // Draw cells
    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.cells[r].length; c++) {
        let cell = this.cells[r][c];
        let compensation =
          Math.max(0, 0.9 - cell.size.height + this.cellPaddingY) / 2 -
          Math.max(0, 0.36 - cell.size.depth + this.cellPaddingY) / 2;
        let cellSpan = document.createElement('span');
        cellSpan.classList.add('cell');
        cellSpan.style.top =
          (this.rowPosition[r] - (cell.size.height - cell.size.depth) / 2 - compensation).toFixed(
            3
          ) + 'em';
        cellSpan.style.left = this.columnPosition[c].toFixed(3) + 'em';
        cellSpan.innerHTML = cell.html;

        rootSpan.append(cellSpan);
      }
    }

    // Draw arrows
    for (let arrow of this.arrows) {
      if (!(this.cells[arrow.r1][arrow.c1] && this.cells[arrow.r2][arrow.c2])) continue;
      if (!arrow.bezier) continue;

      // draw arrow body
      let bezier = arrow.bezier;
      let mask = document.createElement('mask');
      mask.innerHTML = `<rect x="0" y="0" width="${width}" height="${height}" fill="white" />`;

      let path: HTMLElement | undefined;
      switch (arrow.lineType) {
        case 'single':
          path = this.createPathElement(bezier, arrow);
          svg.append(path);
          break;
        case 'double':
          let maskPath = this.createPathElement(bezier, arrow);
          maskPath.style.stroke = 'black';
          maskPath.style.strokeWidth = (arrow.lineWidth * 4).toString();
          maskPath.style.strokeLinecap = 'square';
          mask.append(maskPath);

          path = this.createPathElement(bezier, arrow);
          path.style.strokeWidth = (arrow.lineWidth * 6).toFixed(3);

          svg.append(path);
          break;
      }

      svg.append(
        ...this.drawArrowHead(
          bezier.get(0),
          { x: -bezier.derivative(0.01).x, y: -bezier.derivative(0.01).y },
          arrow.tail,
          arrow.lineWidth
        )
      );
      svg.append(
        ...this.drawArrowHead(bezier.get(1), bezier.derivative(0.99), arrow.head, arrow.lineWidth)
      );

      // labels with whiteout
      for (let label of arrow.labels) {
        if (!label.whiteout) continue;

        let rect = document.createElement('rect');
        rect.setAttribute('x', (label.position.x - label.size.width / 2).toFixed(3));
        rect.setAttribute('y', (label.position.y - label.size.height / 2).toFixed(3));
        rect.setAttribute('width', label.size.width.toFixed(3));
        rect.setAttribute('height', label.size.height.toFixed(3));
        rect.setAttribute('fill', 'black');
        rect.style.stroke = 'black';
        rect.style.strokeWidth = (this.labelPadding * 2).toFixed(3);
        rect.style.strokeLinejoin = 'round';

        mask.append(rect);
      }

      // arrows with whiteout
      let afterSelf = false;
      for (let otherArrow of this.arrows) {
        if (otherArrow === arrow) {
          afterSelf = true;
          continue;
        }

        if (
          otherArrow.whiteout &&
          otherArrow.bezier &&
          (!arrow.whiteout || afterSelf) &&
          bezier.overlaps(otherArrow.bezier)
        ) {
          let maskPath = this.createPathElement(otherArrow.bezier, otherArrow);
          maskPath.style.stroke = 'black';
          maskPath.style.strokeWidth = (
            otherArrow.lineWidth *
            (12 + (otherArrow.lineType === 'double' ? 6 : 0)) *
            otherArrow.whiteout
          ).toString();
          mask.append(maskPath);
        }
      }

      // insert mask element
      if (path && mask.children.length > 1) {
        let maskId = this.id + '-' + this.svgId;
        mask.id = maskId;
        path.setAttribute('mask', `url(#${maskId})`);
        defs.append(mask);
        this.svgId++;

        // Firefox bug: mask doesn't work on objects with no height or no width
        let bbox = bezier.bbox();
        if (bbox.x.max - bbox.x.min < 1 || bbox.y.max - bbox.y.min < 1)
          path.setAttribute('d', path.getAttribute('d') + ' m -10000 0 l 1 1');
      }

      // draw labels
      for (let label of arrow.labels) {
        let compensation =
          Math.max(0, 0.9 - label.heightAboveBaseline) / 2 -
          Math.max(0, 0.36 - (label.size.height - label.heightAboveBaseline)) / 2;

        let labelSpan = document.createElement('span');
        labelSpan.classList.add('label');
        labelSpan.style.top = (label.position.y - compensation).toFixed(3) + 'em';
        labelSpan.style.left = label.position.x.toFixed(3) + 'em';
        labelSpan.innerHTML = label.html;

        if (labelSpan.children.length === 1) labelSpan.innerHTML = labelSpan.children[0].innerHTML;

        rootSpan.append(labelSpan);
      }
    }

    this.rendered = true;
    this.renderResult = [rootSpan];
    return this.renderResult;
  }

  private diagramOption(option: string) {
    if (option.includes('=')) {
      let index = option.indexOf('=');
      let key = option.substring(0, index).trim();
      let value = option.substring(index + 1, option.length).trim();

      switch (key) {
        case 'column sep':
          let columnSep = this.toEm(value, false);
          if (isFinite(columnSep)) this.columnSep = columnSep;
          if (value.includes('between origins')) this.columnSepBetweenOrigins = true;
          return;
        case 'row sep':
          let rowSep = this.toEm(value, true);
          if (isFinite(rowSep)) this.rowSep = rowSep;
          if (value.includes('between origins')) this.rowSepBetweenOrigins = true;
          return;
      }

      return;
    }
  }

  private toEm(length: string, isRowSep: boolean): number {
    length = length
      .replace(/^tiny/, isRowSep ? '0.45em' : '0.6em')
      .replace(/^small/, isRowSep ? '0.9em' : '1.2em')
      .replace(/^scriptsize/, isRowSep ? '1.35em' : '1.8em')
      .replace(/^normal/, isRowSep ? '1.8em' : '2.4em')
      .replace(/^large/, isRowSep ? '2.7em' : '3.6em')
      .replace(/^huge/, isRowSep ? '3.6em' : '4.8em');

    let match = length.match(/^\s*(-?\d*\.?\d*)\s*(em|ex|pt)/);
    if (!match) return NaN;

    let value = parseFloat(match[1]);
    switch (match[2]) {
      case 'em':
        return value;
      case 'ex':
        return value * 0.45;
      case 'pt':
        return value * 0.1;
    }
    return NaN;
  }

  private arrowOption(option: string) {
    if (!this.activeArrow) return;
    let arrow = this.activeArrow;

    if (/^[udlr]+$/.test(option)) {
      let offsetX = 0,
        offsetY = 0;
      for (let i = 0; i < option.length; i++) {
        switch (option[i]) {
          case 'u':
            offsetY--;
            break;
          case 'd':
            offsetY++;
            break;
          case 'l':
            offsetX--;
            break;
          case 'r':
            offsetX++;
            break;
        }
      }
      arrow.c2 = arrow.c1 + offsetX;
      arrow.r2 = arrow.r1 + offsetY;
      return;
    }

    if (option.includes('=')) {
      let index = option.indexOf('=');
      let key = option.substring(0, index).trim();
      let value = option.substring(index + 1, option.length).trim();
      let numValue = parseFloat(value);

      switch (key) {
        case 'pos':
          if (isFinite(numValue) && this.activeLabel)
            this.activeLabel.progress = Math.max(0, Math.min(1, numValue));
          return;
        case 'distance':
          if (isFinite(numValue) && this.activeLabel)
            this.activeLabel.side =
              Math.max(0, Math.min(100, numValue)) * (this.activeLabel.side >= 0 ? 1 : -1);
          return;
        case 'bend left':
          if (isFinite(numValue)) arrow.bend = numValue;
          return;
        case 'bend right':
          if (isFinite(numValue)) arrow.bend = -numValue;
          return;
        case 'looseness':
          if (isFinite(numValue)) arrow.bendLooseness = Math.max(0, Math.min(10, numValue));
          return;
        case 'shift left':
          if (isFinite(numValue)) arrow.shift = Math.max(-100, Math.min(100, numValue));
          return;
        case 'shift right':
          if (isFinite(numValue)) arrow.shift = Math.max(-100, Math.min(100, -numValue));
          return;
        case 'whiteout':
          if (isFinite(numValue)) arrow.shift = Math.max(0, Math.min(10, -numValue));
          return;
      }

      return;
    }

    switch (option) {
      case "'":
        if (this.activeLabel) this.activeLabel.side = -1;
        return;
      case 'near start':
        if (this.activeLabel) this.activeLabel.progress = 0.3;
        return;
      case 'near end':
        if (this.activeLabel) this.activeLabel.progress = 0.7;
        return;
      case 'very near start':
        if (this.activeLabel) this.activeLabel.progress = 0.1;
        return;
      case 'very near end':
        if (this.activeLabel) this.activeLabel.progress = 0.9;
        return;
      case 'description':
        if (this.activeLabel) {
          this.activeLabel.side = 0;
          this.activeLabel.whiteout = true;
        }
        return;
      case 'marking':
        if (this.activeLabel) {
          this.activeLabel.side = 0;
          this.activeLabel.content.isScriptStyle = false;
        }
        return;
      case 'bend left':
        arrow.bend = 30;
        return;
      case 'bend right':
        arrow.bend = -30;
        return;
      case 'shift left':
        arrow.shift = 1;
        return;
      case 'shift right':
        arrow.shift = -1;
        return;
      case 'to head':
        arrow.head = 'to';
        return;
      case 'rightarrow':
        arrow.head = 'to';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'leftarrow':
        arrow.head = '';
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'leftrightarrow':
        arrow.head = 'to';
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'Rightarrow':
        arrow.head = 'To';
        arrow.tail = '';
        arrow.lineType = 'double';
        return;
      case 'Leftarrow':
        arrow.head = '';
        arrow.tail = 'To';
        arrow.lineType = 'double';
        return;
      case 'Leftrightarrow':
        arrow.head = 'To';
        arrow.tail = 'To';
        arrow.lineType = 'double';
        return;
      case 'maps to':
        arrow.tail = 'bar';
        arrow.lineType = 'single';
        return;
      case 'mapsto':
        arrow.head = 'to';
        arrow.tail = 'bar';
        arrow.lineType = 'single';
        return;
      case 'mapsfrom':
        arrow.head = 'bar';
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'Mapsto':
        arrow.head = 'To';
        arrow.tail = 'Bar';
        arrow.lineType = 'double';
        return;
      case 'Mapsfrom':
        arrow.head = 'Bar';
        arrow.tail = 'To';
        arrow.lineType = 'double';
        return;
      case 'hook':
        arrow.tail = 'hook';
        arrow.lineType = 'single';
        return;
      case "hook'":
        arrow.tail = "hook'";
        arrow.lineType = 'single';
        return;
      case 'hookrightarrow':
        arrow.head = 'to';
        arrow.tail = 'hook';
        arrow.lineType = 'single';
        return;
      case 'hookleftarrow':
        arrow.head = "hook'";
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'tail':
        arrow.tail = 'tail';
        arrow.lineType = 'single';
        return;
      case 'rightarrowtail':
        arrow.head = 'to';
        arrow.tail = 'tail';
        arrow.lineType = 'single';
        return;
      case 'leftarrowtail':
        arrow.head = 'tail';
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'two heads':
        arrow.head = 'two heads';
        arrow.lineType = 'single';
        return;
      case 'twoheadrightarrow':
        arrow.head = 'two heads';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'twoheadleftarrow':
        arrow.head = '';
        arrow.tail = 'two heads';
        arrow.lineType = 'single';
        return;
      case 'harpoon':
        arrow.head = 'harpoon';
        arrow.lineType = 'single';
        return;
      case "harpoon'":
        arrow.head = "harpoon'";
        arrow.lineType = 'single';
        return;
      case 'rightharpoonup':
        arrow.head = 'harpoon';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'rightharpoondown':
        arrow.head = "harpoon'";
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'leftharpoonup':
        arrow.head = '';
        arrow.tail = "harpoon'";
        arrow.lineType = 'single';
        return;
      case 'leftharpoondown':
        arrow.head = '';
        arrow.tail = 'harpoon';
        arrow.lineType = 'single';
        return;
      case 'two heads':
        arrow.head = 'two heads';
        arrow.lineType = 'single';
        return;
      case 'twoheadrightarrow':
        arrow.head = 'two heads';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'twoheadleftarrow':
        arrow.head = '';
        arrow.tail = 'two heads';
        arrow.lineType = 'single';
        return;
      case 'dashed':
        arrow.dashArray = [7.5, 5];
        return;
      case 'dashrightarrow':
        arrow.dashArray = [7.5, 5];
        arrow.head = 'to';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'dashleftarrow':
        arrow.dashArray = [7.5, 5];
        arrow.head = '';
        arrow.tail = 'to';
        arrow.lineType = 'single';
        return;
      case 'dotted':
        arrow.dashArray = [1.5, 3];
        return;
      case 'no head':
        arrow.head = '';
        return;
      case 'no tail':
        arrow.tail = '';
        return;
      case 'dash':
        arrow.head = '';
        arrow.tail = '';
        arrow.lineType = 'single';
        return;
      case 'equal':
      case 'equals':
        arrow.head = '';
        arrow.tail = '';
        arrow.lineType = 'double';
        return;
      case 'loop left':
        arrow.bend = -120;
        return;
      case 'loop right':
        arrow.bend = 120;
        return;
      case 'phantom':
        arrow.lineType = '';
        arrow.head = '';
        arrow.tail = '';
        for (let label of arrow.labels) {
          label.side = 0;
          label.content.isScriptStyle = false;
        }
        return;
      case 'crossing over':
      case 'whiteout':
        arrow.whiteout = 1;
        return;
    }
  }

  private createPathElement(bezier: Bezier, arrow?: Arrow): HTMLElement {
    let path = document.createElement('path');
    path.setAttribute('d', bezier.toSVG().replace(/(\.\d\d\d)\d+/g, '$1'));
    path.style.stroke = 'black';
    path.style.fill = 'none';

    if (arrow) {
      path.style.strokeWidth = arrow.lineWidth.toString();
      if (arrow.dashArray)
        path.style.strokeDasharray = arrow.dashArray.map((v) => v * arrow.lineWidth).join(' ');
    }

    return path;
  }

  private computeLayout() {
    // Cells
    for (let r = 0; r < this.cells.length; r++) {
      this.rowHeight.push(0);
      this.rowDepth.push(0);

      for (let c = 0; c < this.cells[r].length; c++) {
        while (this.columnWidth.length <= c) this.columnWidth.push(0);

        let cell = this.cells[r][c];
        let jaxSize = this.getJaxSize(cell.content);

        cell.html = cell.content.render()[0].innerHTML;

        let kh = this.getKatexHeight(cell.html);
        cell.size = {
          width: jaxSize.width + 2 * this.cellPaddingX,
          height: (kh.matched ? kh.height : jaxSize.height / 2) + this.cellPaddingY,
          depth: (kh.matched ? kh.depth : jaxSize.height / 2) + this.cellPaddingY,
        };

        if (cell.size.height > this.rowHeight[r]) this.rowHeight[r] = cell.size.height;
        if (cell.size.depth > this.rowDepth[r]) this.rowDepth[r] = cell.size.depth;
        if (cell.size.width > this.columnWidth[c]) this.columnWidth[c] = cell.size.width;
      }
    }

    let t = this.rowHeight[0];
    this.rowPosition.push(+t.toFixed(3));
    for (let r = 1; r < this.rowHeight.length; r++) {
      t += this.rowSep;
      if (!this.rowSepBetweenOrigins) t += this.rowDepth[r - 1] + this.rowHeight[r];
      this.rowPosition.push(+t.toFixed(3));
    }
    let height = +(t + this.rowDepth[this.rowHeight.length - 1]).toFixed(3);

    t = this.columnWidth[0] / 2;
    this.columnPosition.push(+t.toFixed(3));
    for (let r = 1; r < this.columnWidth.length; r++) {
      t += this.columnSep;
      if (!this.columnSepBetweenOrigins) t += this.columnWidth[r - 1] / 2 + this.columnWidth[r] / 2;
      this.columnPosition.push(+t.toFixed(3));
    }
    let width = +(t + this.columnWidth[this.columnWidth.length - 1] / 2).toFixed(3);

    // Arrows
    let top = 0,
      bottom = height,
      left = 0,
      right = width;
    for (let arrow of this.arrows) {
      if (!(this.cells[arrow.r1][arrow.c1] && this.cells[arrow.r2][arrow.c2])) continue;

      // match line type with arrowhead
      if (arrow.lineType === 'double') {
        if (arrow.head === 'to') arrow.head = 'To';
        if (arrow.tail === 'to') arrow.tail = 'To';
        if (['hook', "hook'"].includes(arrow.head)) arrow.head = '';
        if (['hook', "hook'"].includes(arrow.tail)) arrow.tail = '';
      } else if (arrow.lineType === 'double') {
        if (arrow.head === 'To') arrow.head = 'to';
        if (arrow.tail === 'To') arrow.tail = 'to';
      }

      // compute bezier curve
      let start = this.getCellBBox(arrow.r1, arrow.c1);
      let end = this.getCellBBox(arrow.r2, arrow.c2);
      let bend = arrow.bend ?? 0;
      let looseness = arrow.bendLooseness ?? 1;

      if (arrow.r1 === arrow.r2 && arrow.c1 === arrow.c2) {
        if (bend < 0.1 && bend > -0.1) continue;

        start.Yc -= 0.1 * (bend > 0 ? 1 : -1);
        end.Yc += 0.1 * (bend > 0 ? 1 : -1);
        bend = bend * (bend > 0 ? 1 : -1);
        looseness *= 60;
      }

      if (bend > -5 && bend < 5) looseness = Math.min(Math.abs(bend) * 2, looseness);

      let d = {
        x: end.X - start.X,
        y: end.Yc - start.Yc,
      };
      let rotation = {
        x: Math.cos((bend / 180) * Math.PI),
        y: Math.sin((bend / 180) * Math.PI),
      };
      let c1 = {
        x: start.X + ((d.x * rotation.x + d.y * rotation.y) * looseness) / 3,
        y: start.Yc + ((-d.x * rotation.y + d.y * rotation.x) * looseness) / 3,
      };
      let c2 = {
        x: end.X - ((d.x * rotation.x - d.y * rotation.y) * looseness) / 3,
        y: end.Yc - ((d.x * rotation.y + d.y * rotation.x) * looseness) / 3,
      };

      let bezier = new Bezier(start.X, start.Yc, c1.x, c1.y, c2.x, c2.y, end.X, end.Yc);

      let startT = Math.min(
        1,
        ...bezier.lineIntersects(start.lineN),
        ...bezier.lineIntersects(start.lineS),
        ...bezier.lineIntersects(start.lineW),
        ...bezier.lineIntersects(start.lineE)
      );
      if (startT === 1) startT = 0;

      let endT = Math.max(
        0,
        ...bezier.lineIntersects(end.lineN),
        ...bezier.lineIntersects(end.lineS),
        ...bezier.lineIntersects(end.lineW),
        ...bezier.lineIntersects(end.lineE)
      );
      if (endT === 0) endT = 1;

      // add extra margin (4x line width) for certain types of arrow tips
      const specialTips = ['To', 'hook', "hook'", 'tail'];
      if (specialTips.includes(arrow.tail)) {
        let d = bezier.derivative(startT);
        let abs = Math.sqrt(d.x * d.x + d.y * d.y);
        startT += (arrow.lineWidth * 4) / abs;
      }
      if (specialTips.includes(arrow.head)) {
        let d = bezier.derivative(endT);
        let abs = Math.sqrt(d.x * d.x + d.y * d.y);
        endT -= (arrow.lineWidth * 4) / abs;
      }
      if (endT < startT) continue;

      // compute shifts
      if (arrow.shift) {
        let absd = Math.sqrt(d.x * d.x + d.y * d.y);
        let normal = { x: d.y / absd, y: -d.x / absd };
        bezier = new Bezier(
          bezier.points.map((p) => ({
            x: p.x + normal.x * arrow.lineWidth * 6 * (arrow.shift ?? 0),
            y: p.y + normal.y * arrow.lineWidth * 6 * (arrow.shift ?? 0),
          }))
        );
      }

      // bezier done!
      bezier = bezier.split(startT, endT);
      arrow.bezier = bezier;

      let bbox = bezier.bbox();
      let margin = arrow.lineWidth * (arrow.lineType === 'double' ? 10 : 7.5) + 0.1;
      if (bbox.x.min - margin < left) left = bbox.x.min - margin;
      if (bbox.x.max + margin > right) right = bbox.x.max + margin;
      if (bbox.y.min - margin < top) top = bbox.y.min - margin;
      if (bbox.y.max + margin > bottom) bottom = bbox.y.max + margin;

      // compute label positions
      for (let label of arrow.labels) {
        let jaxSize = this.getJaxSize(label.content);

        label.html = label.content.render()[0].innerHTML;
        let kh = this.getKatexHeight(label.html);
        label.size = {
          width: jaxSize.width,
          height: kh.matched ? kh.height + kh.depth : jaxSize.height,
        };
        label.heightAboveBaseline = kh.matched ? kh.height : jaxSize.height / 2;

        let origin = arrow.bezier.get(label.progress);
        let normal = arrow.bezier.normal(label.progress);
        let offsetLength =
          Math.max(
            Math.abs((label.size.width / 2) * normal.x + (label.size.height / 2) * normal.y),
            Math.abs((label.size.width / 2) * normal.x - (label.size.height / 2) * normal.y)
          ) + this.labelPadding;
        offsetLength += arrow.lineWidth / 2;
        if (arrow.lineType === 'double') offsetLength += arrow.lineWidth * 2.5;

        label.position = {
          x: origin.x - label.side * normal.x * offsetLength,
          y: origin.y - label.side * normal.y * offsetLength,
        };

        let bbox: BBox = {
          x: {
            min: label.position.x - label.size.width / 2 - this.labelPadding,
            max: label.position.x + label.size.width / 2 + this.labelPadding,
          },
          y: {
            min: label.position.y - label.size.height / 2 - this.labelPadding,
            max: label.position.y + label.size.height / 2 + this.labelPadding,
          },
        };

        if (bbox.x.min < left) left = bbox.x.min;
        if (bbox.x.max > right) right = bbox.x.max;
        if (bbox.y.min < top) top = bbox.y.min;
        if (bbox.y.max > bottom) bottom = bbox.y.max;
      }
    }

    // Offset all positions by (-left, -top)
    this.rowPosition = this.rowPosition.map((v) => v - top);
    this.columnPosition = this.columnPosition.map((v) => v - left);
    for (let arrow of this.arrows) {
      if (!arrow.bezier) continue;
      arrow.bezier = new Bezier(arrow.bezier.points.map((p) => ({ x: p.x - left, y: p.y - top })));
      for (let label of arrow.labels) {
        label.position = { x: label.position.x - left, y: label.position.y - top };
      }
    }

    this.renderedHeight = bottom - top;
    this.renderedWidth = right - left;
  }

  private getKatexHeight(html: string): { matched: boolean; height: number; depth: number } {
    let height = 0,
      depth = 0;
    let matched = false;
    while (true) {
      let match = html.match(
        /<span class="strut" style="height:\s*(-?[\d\.]+)em(?:;\s*vertical-align:\s*(-?[\d\.]+)em)?/
      );
      if (!match) break;
      matched = true;
      height = Math.max(height, +match[1] + (+match[2] || 0));
      depth = Math.max(depth, -match[2] || 0);
      html = html.substring((match.index ?? 0) + 54);
    }
    return { matched, height, depth };
  }

  private getCellBBox(row: number, column: number) {
    let X = this.columnPosition[column];
    let Y = this.rowPosition[row];
    let Ya = Y - 0.24; // Y is baseline and Yc is centerline
    let size = this.cells[row][column].size;

    let NW: Point = { x: X - size.width / 2, y: Y - size.height };
    let NE: Point = { x: X + size.width / 2, y: Y - size.height };
    let SW: Point = { x: X - size.width / 2, y: Y + size.depth };
    let SE: Point = { x: X + size.width / 2, y: Y + size.depth };

    let lineN: Line = { p1: NW, p2: NE };
    let lineS: Line = { p1: SW, p2: SE };
    let lineW: Line = { p1: NW, p2: SW };
    let lineE: Line = { p1: NE, p2: SE };

    return { X, Y, Yc: Ya, size, NW, NE, SW, SE, lineN, lineS, lineW, lineE };
  }

  private drawArrowHead(
    position: Point,
    direction: Point,
    type: string,
    width: number
  ): HTMLElement[] {
    if (direction.x === 0 && direction.y === 0) direction.x = 1;
    let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    direction.x /= length;
    direction.y /= length;

    if (type === 'tail') {
      type = 'to';
      direction.x *= -1;
      direction.y *= -1;
    }

    function transform(p: Point): string {
      return (
        (position.x + p.x * width * direction.x - p.y * width * direction.y).toFixed(3) +
        ' ' +
        (position.y + p.y * width * direction.x + p.x * width * direction.y).toFixed(3)
      );
    }

    let data = '';

    switch (type) {
      case '':
        return [];
      case 'to':
        data =
          `M ${transform({ x: -5.4, y: 6.5 })} ` +
          `C ${transform({ x: -4.8, y: 3 })} ` +
          `${transform({ x: -2, y: 1 })} ` +
          `${transform({ x: 0, y: 0 })} ` +
          `C ${transform({ x: -2, y: -1 })} ` +
          `${transform({ x: -4.8, y: -3 })} ` +
          `${transform({ x: -5.4, y: -6.5 })}`;
        break;
      case 'To':
        data =
          `M ${transform({ x: -4.5, y: 7.5 })} ` +
          `C ${transform({ x: -3, y: 4.5 })} ` +
          `${transform({ x: 1.5, y: 1 })} ` +
          `${transform({ x: 4.5, y: 0 })} ` +
          `C ${transform({ x: 1.5, y: -1 })} ` +
          `${transform({ x: -3, y: -4.5 })} ` +
          `${transform({ x: -4.5, y: -7.5 })}`;
        break;
      case 'two heads':
        data =
          `M ${transform({ x: -5.4, y: 6.5 })} ` +
          `C ${transform({ x: -4.8, y: 3 })} ` +
          `${transform({ x: -2, y: 1 })} ` +
          `${transform({ x: 0, y: 0 })} ` +
          `C ${transform({ x: -2, y: -1 })} ` +
          `${transform({ x: -4.8, y: -3 })} ` +
          `${transform({ x: -5.4, y: -6.5 })} ` +
          `M ${transform({ x: -9.9, y: 6.5 })} ` +
          `C ${transform({ x: -9.3, y: 3 })} ` +
          `${transform({ x: -6.5, y: 1 })} ` +
          `${transform({ x: -4.5, y: 0 })} ` +
          `C ${transform({ x: -6.5, y: -1 })} ` +
          `${transform({ x: -9.3, y: -3 })} ` +
          `${transform({ x: -9.9, y: -6.5 })}`;
        break;
      case 'hook':
        data =
          `M ${transform({ x: 0, y: 0 })} ` +
          `C ${transform({ x: 6, y: 0 })} ` +
          `${transform({ x: 6, y: 5 })} ` +
          `${transform({ x: 0, y: 5 })}`;
        break;
      case "hook'":
        data =
          `M ${transform({ x: 0, y: 0 })} ` +
          `C ${transform({ x: 6, y: 0 })} ` +
          `${transform({ x: 6, y: -5 })} ` +
          `${transform({ x: 0, y: -5 })}`;
        break;
      case 'bar':
        data = `M ${transform({ x: 0, y: 5 })} L ${transform({ x: 0, y: -5 })}`;
        break;
      case 'Bar':
        data = `M ${transform({ x: 0, y: 7.5 })} L ${transform({ x: 0, y: -7.5 })}`;
        break;
      case 'harpoon':
        data =
          `M ${transform({ x: -5.4, y: -6.5 })} ` +
          `C ${transform({ x: -4.8, y: -3 })} ` +
          `${transform({ x: -2, y: -1 })} ` +
          `${transform({ x: 0, y: 0 })} ` +
          `L ${transform({ x: -1, y: 0 })}`;
        break;
      case "harpoon'":
        data =
          `M ${transform({ x: -5.4, y: 6.5 })} ` +
          `C ${transform({ x: -4.8, y: 3 })} ` +
          `${transform({ x: -2, y: 1 })} ` +
          `${transform({ x: 0, y: 0 })} ` +
          `L ${transform({ x: -1, y: 0 })}`;
        break;
    }

    if (!data) return [];

    let path = document.createElement('path');
    path.setAttribute('d', data);
    path.style.stroke = 'black';
    path.style.strokeWidth = width.toString();
    path.style.fill = 'none';
    return [path];
  }

  // Use MathJax to get the size for diagram drawing
  private getJaxSize(math: MathElement): { width: number; height: number } {
    let text = math.getText();
    if (text === '') return { width: 0, height: 0 };

    try {
      let jaxText = text.replace(/u3400-u9fff/g, '{00}');

      let svg = MathJax.tex2svg(jaxText, {
        display: false,
      }).children[0];

      return {
        width: this.parseLength(svg.attributes.width),
        height: this.parseLength(svg.attributes.height),
      };
    } catch {
      return { width: 0, height: 0 };
    }
  }

  // Converts eg '10ex' to 4.5 (em)
  private parseLength(length: string): number {
    return parseFloat(length.replace(/ex/, '')) * 0.45;
  }
}

class Cell {
  content: MathElement;

  html: string = '';
  size: BoxSize = { height: 0, depth: 0, width: 0 };

  constructor() {
    this.content = new MathElement();
    this.content.isDiagramCell = true;
  }
}

class Arrow {
  head: string = 'to';
  tail: string = '';
  lineType: string = 'single';
  lineWidth: number = 0.04;
  labels: ArrowLabel[] = [];

  dashArray?: number[];
  bend?: number;
  bendLooseness?: number;
  shift?: number;
  whiteout?: number;

  bezier?: Bezier;

  constructor(public r1: number, public c1: number, public r2: number, public c2: number) {}
}

class ArrowLabel {
  content: MathElement = new MathElement();
  progress: number = 0.5;
  side: number = 1;

  position: Point = { x: 0, y: 0 };
  html: string = '';
  size: { width: number; height: number } = { width: 0, height: 0 };
  heightAboveBaseline: number = 0;
  whiteout?: boolean;

  // Virtual labels are used to store options before label is created
  isVirtual?: boolean = false;

  constructor() {
    this.content.isScriptStyle = true;
  }
}

interface BoxSize {
  height: number;
  depth: number;
  width: number;
}
