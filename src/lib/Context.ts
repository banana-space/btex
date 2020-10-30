import { Command } from './Command';
import { CompilerOptions, defaultCompilerOptions } from './Compiler';
import { CompilerError, CompilerErrorType } from './CompilerError';
import { ContainerElement } from './Element';
import { BookmarkElement } from './elements/BookmarkElement';
import { HeaderElement } from './elements/HeaderElement';
import { LabelElement } from './elements/LabelElement';
import { RootElement } from './elements/RootElement';
import { SpanElement } from './elements/SpanElement';
import { Token } from './Token';

export class Context {
  options: CompilerOptions;

  // Variables and commands defined **exactly** in this scope
  // Use put() and find() to look up the correct values
  newVariables: { [name: string]: string } = {};
  newCommands: { [name: string]: Command } = {};

  base?: Context;
  global: Context;

  // When compiling, compiled elements enter the root element
  root: RootElement;

  // The elements currently being written to; the array is shared by all contexts.
  stack: ContainerElement[];

  // All contexts share the same errors array
  errors: CompilerError[] = [];
  warnings: CompilerError[] = [];

  // Ancestor semi-simple groups
  semisimple: Context[] = [];

  // Bookmarks
  bookmarks: BookmarkElement[] = [];
  labels: LabelElement[] = [];
  headers: HeaderElement[] = [];

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

  get span(): SpanElement {
    return this.global._span as SpanElement;
  }

  set span(value: SpanElement) {
    this.global._span = value;
  }

  // No-output mode for internal use
  private _noOutput?: boolean;

  get noOutput(): boolean {
    return this.global._noOutput ?? false;
  }

  set noOutput(value: boolean) {
    this.global._noOutput = value;
  }

  get container(): ContainerElement {
    return this.stack[this.stack.length - 1];
  }

  recordExpansion(): number {
    return ++this.global._expansions;
  }

  set(key: string, value: string | undefined) {
    const scope = key.startsWith('g.') ? this.global : this;
    if (value === undefined) {
      delete scope.newVariables[key];
    } else {
      scope.newVariables[key] = value;
    }
  }

  defineCommand(command: Command) {
    delete this.newCommands[command.name];
    const scope = command.isGlobal ? this.global : this;
    scope.newCommands[command.name] = command;
  }

  // When `reset` is false, reads the value of a variable.
  // When `reset` is true and variable is not global,
  // only reads from the current scope, and resets the value.
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

  passToSubgroup(): Context {
    let sub = new Context(this);
    sub._nesting = this._nesting + 1;
    return sub;
  }

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

  flushSpan() {
    if (!this.span.isEmpty()) {
      this.container.paragraph.append(this.span);
      this.span = new SpanElement();
    }

    this.span.initialise(this);
  }

  enterContainer(element: ContainerElement, initiator: Token): boolean {
    let parentIsInline = this.container.isInline;

    this.flushSpan();
    if (element.enter) element.enter(this);
    this.stack.push(element);

    if (parentIsInline && !element.isInline) {
      this.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
      return false;
    }
    return true;
  }

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

  finish() {
    while (this.stack.length > 1) {
      this.exitContainer();
    }

    let usedBookmarks: { [prefix: string]: number[] } = {};
    let inverseMap: { [id: number]: { prefix: string; newId: number } } = {};
    for (let label of this.labels) {
      let id = parseInt(label.bookmarkId);
      if (id >= 0 && id < this.bookmarks.length && !(id in inverseMap)) {
        let prefix = this.bookmarks[id].prefix ?? '';
        inverseMap[id] = { prefix, newId: -1 }; // newId to be assigned later
        (usedBookmarks[prefix] ??= []).push(id);
      } else label.bookmarkId = '';
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
        let { prefix, newId } = inverseMap[parseInt(label.bookmarkId)];
        label.bookmarkId = prefix + (newId + 1);
      }
    }

    this.root.normalise();
  }

  changeTo(context: Context) {
    this.base = context.base;
    this.newCommands = context.newCommands;
    this.newVariables = context.newVariables;
  }

  enterSemisimple() {
    let parent = new Context(this);
    parent.changeTo(this);
    this.base = parent;
    this.newCommands = {};
    this.newVariables = {};
    this.semisimple.push(parent);
    this._nesting++;
  }

  exitSemisimple() {
    let parent = this.semisimple.pop();
    if (!parent) return;

    this.changeTo(parent);
    this._nesting--;
  }
}
