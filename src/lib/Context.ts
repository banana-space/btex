import { Code } from './Code';
import { Command } from './Command';
import { Compiler, CompilerOptions, defaultCompilerOptions } from './Compiler';
import { CompilerError, CompilerErrorType } from './CompilerError';
import { ContainerElement, RenderOptions } from './Element';
import { BookmarkElement } from './elements/BookmarkElement';
import { HeaderElement } from './elements/HeaderElement';
import { LabelElement } from './elements/LabelElement';
import { ReferenceElement } from './elements/ReferenceElement';
import { RootElement } from './elements/RootElement';
import { SpanElement } from './elements/SpanElement';
import { TabelOfContentElement } from './elements/TableOfContentElement';
import { VirtualElement } from './elements/VirtualElement';
import { SubpageDeclaration } from './internals/SubpageInternal';
import { Token, TokenType } from './Token';

/**
 * The object that stores all the data during compilation.
 * A `Context` object is created for every scope in the code.
 */
export class Context {
  options: CompilerOptions;

  /**
   * Variables defined **exactly** in this scope.
   */
  newVariables: { [name: string]: string } = {};

  /**
   * Commands defined **exactly** in this scope.
   */
  newCommands: { [name: string]: Command } = {};

  /**
   * The parent scope.
   */
  base?: Context;

  /**
   * The global scope.
   */
  global: Context;

  /**
   * Stores the output.
   * This object is shared by all scopes.
   */
  root: RootElement;

  /**
   * The container stack.
   * This is shared by all scopes.
   */
  stack: ContainerElement[];

  /**
   * Compiler errors.
   * This is shared by all scopes.
   */
  errors: CompilerError[] = [];

  /**
   * Compiler warnings.
   * This is shared by all scopes.
   */
  warnings: CompilerError[] = [];

  /**
   * Semi-simple groups that are parents of the current scope.
   */
  semisimple: Context[] = [];

  // Bookmarks
  bookmarks: BookmarkElement[] = [];
  labels: LabelElement[] = [];
  references: ReferenceElement[] = [];
  headers: HeaderElement[] = [];
  tableOfContents: TabelOfContentElement[] = [];

  // Subpages declared with \subpage
  subpages: SubpageDeclaration[] = [];
  subpageOfLevel: string[] = [];

  // Pending async renderings
  // TODO other changes needed?
  promises: Promise<void>[] = [];

  // External links
  externalLinks: string[] = [];

  // Compiler data to be sent in output
  compilerData: any = {};

  _expansions: number = 0;
  _nesting: number = 0;

  // When adding new features, also update changeTo() and enterSemisimple()
  constructor(basedOn?: Context, options?: CompilerOptions) {
    this.base = basedOn;
    this.options = basedOn?.options ?? defaultCompilerOptions;
    if (options) Object.assign(this.options, options);

    if (basedOn) {
      this.global = basedOn.global;
      this.root = basedOn.root;
      this.stack = basedOn.stack;
      this.errors = basedOn.errors;
      this.warnings = basedOn.warnings;
      this.bookmarks = basedOn.bookmarks;
      this.labels = basedOn.labels;
      this.headers = basedOn.headers;
      this.subpages = basedOn.subpages;
      this.references = basedOn.references;
      this.externalLinks = basedOn.externalLinks;
      this.promises = basedOn.promises;
    } else {
      this.global = this;
      this.root = new RootElement();
      this.root.isInline = this.options.inline;
      this.stack = [this.root];
      this._noOutput = false;
      this._span = new SpanElement();
    }
  }

  private _span?: SpanElement;

  /**
   * The span element that is currently written to.
   */
  get span(): SpanElement {
    return this.global._span as SpanElement;
  }

  set span(value: SpanElement) {
    this.global._span = value;
  }

  private _noOutput?: boolean;

  /**
   * Whether in no-output mode.
   */
  get noOutput(): boolean {
    return this.global._noOutput ?? false;
  }

  set noOutput(value: boolean) {
    this.global._noOutput = value;
  }

  /**
   * The current container being written to.
   */
  get container(): ContainerElement {
    return this.stack[this.stack.length - 1];
  }

  recordExpansion(): number {
    return ++this.global._expansions;
  }

  /**
   * Sets the value of a variable.
   * @param key The name of the variable.
   * @param value The value of the variable.
   */
  set(key: string, value: string | undefined) {
    const scope = key.startsWith('g.') ? this.global : this;
    if (value === undefined) {
      delete scope.newVariables[key];
    } else {
      scope.newVariables[key] = value;
    }
  }

  /**
   * Adds a command definition to the current scope.
   * @param command The command definition.
   */
  defineCommand(command: Command) {
    delete this.newCommands[command.name];
    const scope = command.isGlobal ? this.global : this;
    scope.newCommands[command.name] = command;
  }

  /**
   * Gets the value of a variable.
   * @param key The name of the variable.
   * @param reset Whether to delete the variable after the operation.
   * When set to `true`, variables in parent scopes will not be read or deleted.
   * Only those in the current scope will be read.
   */
  get(key: string, reset: boolean = false): string | undefined {
    let context: Context | undefined = key.startsWith('g.') ? this.global : this;
    do {
      let value = context.newVariables[key];
      if (value !== undefined) {
        if (reset) context.set(key, undefined);
        return value;
      }
      context = context.base;
    } while (!reset && context);
  }

  /**
   * Gets the definition of a command.
   * @param name The name of the command.
   */
  findCommand(name: string): Command | undefined {
    let context: Context | undefined = this;
    do {
      let value = context.newCommands[name];
      if (value !== undefined) return value;
      context = context.base;
    } while (context);
  }

  getBoolean(key: string, defaultValue: boolean, reset: boolean = false): boolean {
    let value = this.get(key, reset);
    if (value === undefined) return defaultValue;
    let result = value === '1' ? true : value === '0' ? false : undefined;
    return result ?? defaultValue;
  }

  getInteger(key: string, defaultValue: number, reset: boolean = false): number {
    let value = this.get(key, reset);
    if (value === undefined) return defaultValue;
    let result = parseInt(value);
    return Number.isSafeInteger(result) ? result : defaultValue;
  }

  getFloat(key: string, defaultValue: number, reset: boolean = false): number {
    let value = this.get(key, reset);
    if (value === undefined) return defaultValue;
    let result = parseFloat(value);
    return Number.isFinite(result) ? result : defaultValue;
  }

  throw(type: CompilerErrorType, initiator: Token, ...args: string[]): number {
    return this.errors.push(new CompilerError(type, initiator, ...args));
  }

  warn(type: CompilerErrorType, initiator: Token, ...args: string[]): number {
    return this.warnings.push(new CompilerError(type, initiator, ...args));
  }

  /**
   * Generates a `Context` object as a sub-scope of the current scope.
   */
  passToSubgroup(): Context {
    let sub = new Context(this);
    sub._nesting = this._nesting + 1;
    return sub;
  }

  /**
   * Collects data from a sub-scope after the sub-scope is finished.
   */
  collectFromSubgroup(subgroup: Context, initiator: Token): boolean {
    if (subgroup.semisimple.length > 0) {
      this.throw('UNMATCHED_SEMISIMPLE', initiator);
      return false;
    }
    if (subgroup.newVariables['text-style-changed'] === '1') {
      // If the style changed in the subgroup, flush to reset the style
      this.flushSpan();
    }
    return true;
  }

  /**
   * Starts a new span element (for styles to apply, etc.).
   */
  flushSpan() {
    if (!this.span.isEmpty()) {
      this.container.paragraph.append(this.span);
      this.span = new SpanElement();
    }

    this.span.initialise(this);
  }

  /**
   * Enters a container element.
   * @param element The container to enter.
   * @param initiator The token that initiates the operation.
   * @returns `false` if an error occurs, `true` otherwise.
   */
  enterContainer(element: ContainerElement, initiator: Token): boolean {
    let parentIsInline = this.container.isInline;

    this.flushSpan();
    if (element.enter) element.enter(this, initiator);
    this.stack.push(element);

    if (parentIsInline && !element.isInline) {
      this.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
      return false;
    }
    return true;
  }

  /**
   * Exits a container element.
   */
  exitContainer() {
    if (this.stack.length <= 1) return;

    let child = this.container;
    this.flushSpan();
    this.stack.pop();
    if (child.exit) child.exit(this);

    if (!child.isEmpty()) {
      this.container.paragraph.append(child);
    }
  }

  /**
   * Does things after compiling everything and before rendering.
   * This is pretty much equivalent to a second LaTeX run
   * in order to get the links and TOC right.
   */
  finalise() {
    while (this.stack.length > 1) {
      this.exitContainer();
    }

    this.removeInaccessibleBookmarks();
    this.handleReferences();
    this.root.normalise();
    this.addTableOfContents();

    // Generate compiler data
    let labels: any = {};
    let hasLabels = false;
    for (let label of this.labels) {
      let html = label
        .getHTML()
        .replace(/\uedaf"\uedaf/g, '~~.')
        .replace(/\uedae"\uedae/g, '~~');
      labels[label.key] = { id: label.bookmarkId, html };
      hasLabels = true;
    }
    if (hasLabels) this.compilerData.labels = labels;

    if (this.subpages.length > 0) {
      this.compilerData.subpages = this.subpages;
    }

    if (this.externalLinks.length > 0) {
      this.compilerData.externalLinks = this.externalLinks;
    }
  }

  /**
   * Renders everything to HTML.
   */
  async render(options?: RenderOptions): Promise<string> {
    let result = this.root.render(options);
    await Promise.all(this.promises);
    let html = result[0]?.outerHTML ?? '';
    html = html
      .replace(/\uedaf"\uedaf/g, '<btex-ref data-key="--prefix--"></btex-ref>')
      .replace(/\uedae"\uedae/g, '<btex-ref data-key="--pagenum--"></btex-ref>');
    return html;
  }

  /**
   * Impersonates another scope.
   * @param context The scope to impersonate.
   */
  changeTo(context: Context) {
    this.base = context.base;
    this.newCommands = context.newCommands;
    this.newVariables = context.newVariables;
  }

  /**
   * Enters a semi-simple group.
   */
  enterSemisimple() {
    let parent = new Context(this);
    parent.changeTo(this);
    this.base = parent;
    this.newCommands = {};
    this.newVariables = {};
    this.semisimple.push(parent);
    this._nesting++;
  }

  /**
   * Exits a semi-simple group.
   */
  exitSemisimple() {
    let parent = this.semisimple.pop();
    if (!parent) return;

    this.changeTo(parent);
    this._nesting--;
  }

  /**
   * Compiles a code fragment to HTML, using a virtual container.
   * This does not write to the output.
   * @param code The code to compile.
   * @param initiator The token that initiates the operation.
   */
  codeToHTML(code: Code, initiator: Token): string | null {
    let element = new VirtualElement();

    this.enterContainer(element, initiator);
    if (!Compiler.compileGroup(code, this, initiator)) return null;
    this.exitContainer();
    element.normalise();

    return element.getHTML();
  }

  /**
   * Compiles a command to HTML, using a virtual container.
   * This does not write to the output.
   * @param command The command to compile, e.g. `'\foo'`.
   * @param initiator The token that initiates the operation.
   */
  commandToHTML(command: string, initiator: Token): string | null {
    let code = new Code([Token.fromParent(command, TokenType.Command, initiator)]);
    return this.codeToHTML(code, initiator);
  }

  private removeInaccessibleBookmarks() {
    // Remove bookmarks that are not assigned with a label
    let usedBookmarks: { [prefix: string]: number[] } = {};
    let inverseMap: { [id: number]: { prefix: string; newId: number } } = {};
    for (let label of this.labels) {
      let id = parseInt(label.bookmarkId);
      if (id >= 0 && id < this.bookmarks.length && !(id in inverseMap)) {
        let prefix = this.bookmarks[id].prefix ?? '';
        inverseMap[id] = { prefix, newId: -1 }; // newId to be assigned later
        (usedBookmarks[prefix] ??= []).push(id);
      }
    }
    for (let toc of this.tableOfContents) {
      let id = parseInt(toc.bookmarkId);
      if (id >= 0 && id < this.bookmarks.length && !(id in inverseMap)) {
        let prefix = this.bookmarks[id].prefix ?? '';
        inverseMap[id] = { prefix, newId: -1 }; // newId to be assigned later
        (usedBookmarks[prefix] ??= []).push(id);
      }
    }

    for (let prefix in usedBookmarks) usedBookmarks[prefix].sort((a, b) => a - b);

    let newBookmarks: BookmarkElement[] = [];
    for (let bookmark of this.bookmarks) bookmark.isUnused = true;
    for (let prefix in usedBookmarks) {
      for (let i = 0; i < usedBookmarks[prefix].length; i++) {
        inverseMap[usedBookmarks[prefix][i]] = { prefix, newId: i };

        let bookmark = this.bookmarks[usedBookmarks[prefix][i]];
        bookmark.isUnused = false;
        bookmark.id = i;
        newBookmarks.push(bookmark);
      }
    }
    this.bookmarks = newBookmarks;
    for (let label of this.labels) {
      label.normalise();
      if (label.bookmarkId) {
        let map = inverseMap[parseInt(label.bookmarkId)];
        // label.bookmarkId may also be a section header
        if (map) label.bookmarkId = map.prefix + (map.newId + 1);
      }
    }
    for (let toc of this.tableOfContents) {
      toc.normalise();
      if (toc.bookmarkId) {
        let map = inverseMap[parseInt(toc.bookmarkId)];
        // label.bookmarkId may also be a section header
        if (map) toc.bookmarkId = map.prefix + (map.newId + 1);
      }
    }
  }

  private handleReferences() {
    let labelDict: { [key: string]: LabelElement } = {};
    for (let label of this.labels) {
      labelDict[label.key] = label;
    }

    for (let ref of this.references) {
      if (ref.page || !ref.key) continue;
      let label = labelDict[ref.key];
      if (!label) continue;
      ref.target = label;
    }
  }

  private addTableOfContents() {
    if (this.getBoolean('g.toc-disabled', false)) return;

    if (this.tableOfContents.length > 0) {
      let toc = document.createElement('div');
      toc.classList.add('toc');
      this.root.tocRendered = toc;

      let tocTitle = document.createElement('div');
      tocTitle.classList.add('toctitle');
      tocTitle.innerHTML =
        this.commandToHTML(
          '\\tocname',
          Token.fromCode('\\tocname', TokenType.Command, { line: 0, col: 0 }, { line: 0, col: 0 })
        ) ?? '??';
      toc.append(tocTitle);

      let ul = document.createElement('ul');
      toc.append(ul);

      for (let tocitem of this.tableOfContents) {
        let level = tocitem.level;

        let li = document.createElement('li');
        li.classList.add('toclevel-' + level);
        ul.append(li);

        let a = document.createElement('a');
        a.setAttribute('href', '#' + encodeURIComponent(tocitem.bookmarkId));
        li.append(a);

        if (tocitem.numberHTML) {
          let tocNumber = document.createElement('span');
          tocNumber.classList.add('tocnumber');
          tocNumber.innerHTML = tocitem.numberHTML;
          a.append(tocNumber);
        }

        let tocText = document.createElement('span');
        tocText.classList.add('toctext');
        tocitem.paragraph.renderInner().map((node) => tocText.append(node));
        a.append(tocText);
      }
    }
  }
}
