import { Code } from './Code';
import { Command } from './Command';
import { CompilerOptions } from './Compiler';
import { CompilerError, CompilerErrorType } from './CompilerError';
import { ContainerElement, RenderOptions } from './Element';
import { BookmarkElement } from './elements/BookmarkElement';
import { HeaderElement } from './elements/HeaderElement';
import { LabelElement } from './elements/LabelElement';
import { ReferenceElement } from './elements/ReferenceElement';
import { RootElement } from './elements/RootElement';
import { SpanElement } from './elements/SpanElement';
import { SubpageDeclaration } from './internals/SubpageInternal';
import { Token } from './Token';
/**
 * The object that stores all the data during compilation.
 * A `Context` object is created for every scope in the code.
 */
export declare class Context {
    options: CompilerOptions;
    /**
     * Variables defined **exactly** in this scope.
     */
    newVariables: {
        [name: string]: string;
    };
    /**
     * Commands defined **exactly** in this scope.
     */
    newCommands: {
        [name: string]: Command;
    };
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
    errors: CompilerError[];
    /**
     * Compiler warnings.
     * This is shared by all scopes.
     */
    warnings: CompilerError[];
    /**
     * Semi-simple groups that are parents of the current scope.
     */
    semisimple: Context[];
    bookmarks: BookmarkElement[];
    labels: LabelElement[];
    references: ReferenceElement[];
    headers: HeaderElement[];
    subpages: SubpageDeclaration[];
    subpageOfLevel: string[];
    promises: Promise<void>[];
    externalLinks: string[];
    compilerData: any;
    _expansions: number;
    _nesting: number;
    constructor(basedOn?: Context, options?: CompilerOptions);
    private _span?;
    /**
     * The span element that is currently written to.
     */
    get span(): SpanElement;
    set span(value: SpanElement);
    private _noOutput?;
    /**
     * Whether in no-output mode.
     */
    get noOutput(): boolean;
    set noOutput(value: boolean);
    /**
     * The current container being written to.
     */
    get container(): ContainerElement;
    recordExpansion(): number;
    /**
     * Sets the value of a variable.
     * @param key The name of the variable.
     * @param value The value of the variable.
     */
    set(key: string, value: string | undefined): void;
    /**
     * Adds a command definition to the current scope.
     * @param command The command definition.
     */
    defineCommand(command: Command): void;
    /**
     * Gets the value of a variable.
     * @param key The name of the variable.
     * @param reset Whether to delete the variable after the operation.
     * When set to `true`, variables in parent scopes will not be read or deleted.
     * Only those in the current scope will be read.
     */
    get(key: string, reset?: boolean): string | undefined;
    /**
     * Gets the definition of a command.
     * @param name The name of the command.
     */
    findCommand(name: string): Command | undefined;
    getBoolean(key: string, defaultValue: boolean, reset?: boolean): boolean;
    getInteger(key: string, defaultValue: number, reset?: boolean): number;
    getFloat(key: string, defaultValue: number, reset?: boolean): number;
    throw(type: CompilerErrorType, initiator: Token, ...args: string[]): number;
    warn(type: CompilerErrorType, initiator: Token, ...args: string[]): number;
    /**
     * Generates a `Context` object as a sub-scope of the current scope.
     */
    passToSubgroup(): Context;
    /**
     * Collects data from a sub-scope after the sub-scope is finished.
     */
    collectFromSubgroup(subgroup: Context, initiator: Token): boolean;
    /**
     * Starts a new span element (for styles to apply, etc.).
     */
    flushSpan(): void;
    /**
     * Enters a container element.
     * @param element The container to enter.
     * @param initiator The token that initiates the operation.
     * @returns `false` if an error occurs, `true` otherwise.
     */
    enterContainer(element: ContainerElement, initiator: Token): boolean;
    /**
     * Exits a container element.
     */
    exitContainer(): void;
    /**
     * Does things after compiling everything and before rendering.
     * This is pretty much equivalent to a second LaTeX run
     * in order to get the links and TOC right.
     */
    finalise(): void;
    /**
     * Renders everything to HTML.
     */
    render(options?: RenderOptions): Promise<string>;
    /**
     * Impersonates another scope.
     * @param context The scope to impersonate.
     */
    changeTo(context: Context): void;
    /**
     * Enters a semi-simple group.
     */
    enterSemisimple(): void;
    /**
     * Exits a semi-simple group.
     */
    exitSemisimple(): void;
    /**
     * Compiles a code fragment to HTML, using a virtual container.
     * This does not write to the output.
     * @param code The code to compile.
     * @param initiator The token that initiates the operation.
     */
    codeToHTML(code: Code, initiator: Token): string | null;
    /**
     * Compiles a command to HTML, using a virtual container.
     * This does not write to the output.
     * @param command The command to compile, e.g. `'\foo'`.
     * @param initiator The token that initiates the operation.
     */
    commandToHTML(command: string, initiator: Token): string | null;
    private removeInaccessibleBookmarks;
    private handleReferences;
    private addTableOfContents;
}
//# sourceMappingURL=Context.d.ts.map