"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
var Code_1 = require("./Code");
var Compiler_1 = require("./Compiler");
var CompilerError_1 = require("./CompilerError");
var RootElement_1 = require("./elements/RootElement");
var SpanElement_1 = require("./elements/SpanElement");
var VirtualElement_1 = require("./elements/VirtualElement");
var Token_1 = require("./Token");
/**
 * The object that stores all the data during compilation.
 * A `Context` object is created for every scope in the code.
 */
var Context = /** @class */ (function () {
    // When adding new features, also update changeTo() and enterSemisimple()
    function Context(basedOn, options) {
        var _a;
        /**
         * Variables defined **exactly** in this scope.
         */
        this.newVariables = {};
        /**
         * Commands defined **exactly** in this scope.
         */
        this.newCommands = {};
        /**
         * Compiler errors.
         * This is shared by all scopes.
         */
        this.errors = [];
        /**
         * Compiler warnings.
         * This is shared by all scopes.
         */
        this.warnings = [];
        /**
         * Semi-simple groups that are parents of the current scope.
         */
        this.semisimple = [];
        // Bookmarks
        this.bookmarks = [];
        this.labels = [];
        this.references = [];
        this.headers = [];
        // Subpages declared with \subpage
        this.subpages = [];
        this.subpageOfLevel = [];
        // Pending async renderings
        // TODO other changes needed?
        this.promises = [];
        // External links
        this.externalLinks = [];
        // Compiler data to be sent in output
        this.compilerData = {};
        this._expansions = 0;
        this._nesting = 0;
        this.base = basedOn;
        this.options = (_a = basedOn === null || basedOn === void 0 ? void 0 : basedOn.options) !== null && _a !== void 0 ? _a : Compiler_1.defaultCompilerOptions;
        if (options)
            Object.assign(this.options, options);
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
        }
        else {
            this.global = this;
            this.root = new RootElement_1.RootElement();
            this.root.isInline = this.options.inline;
            this.stack = [this.root];
            this._noOutput = false;
            this._span = new SpanElement_1.SpanElement();
        }
    }
    Object.defineProperty(Context.prototype, "span", {
        /**
         * The span element that is currently written to.
         */
        get: function () {
            return this.global._span;
        },
        set: function (value) {
            this.global._span = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "noOutput", {
        /**
         * Whether in no-output mode.
         */
        get: function () {
            var _a;
            return (_a = this.global._noOutput) !== null && _a !== void 0 ? _a : false;
        },
        set: function (value) {
            this.global._noOutput = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "container", {
        /**
         * The current container being written to.
         */
        get: function () {
            return this.stack[this.stack.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Context.prototype.recordExpansion = function () {
        return ++this.global._expansions;
    };
    /**
     * Sets the value of a variable.
     * @param key The name of the variable.
     * @param value The value of the variable.
     */
    Context.prototype.set = function (key, value) {
        var scope = key.startsWith('g.') ? this.global : this;
        if (value === undefined) {
            delete scope.newVariables[key];
        }
        else {
            scope.newVariables[key] = value;
        }
    };
    /**
     * Adds a command definition to the current scope.
     * @param command The command definition.
     */
    Context.prototype.defineCommand = function (command) {
        delete this.newCommands[command.name];
        var scope = command.isGlobal ? this.global : this;
        scope.newCommands[command.name] = command;
    };
    /**
     * Gets the value of a variable.
     * @param key The name of the variable.
     * @param reset Whether to delete the variable after the operation.
     * When set to `true`, variables in parent scopes will not be read or deleted.
     * Only those in the current scope will be read.
     */
    Context.prototype.get = function (key, reset) {
        if (reset === void 0) { reset = false; }
        var context = key.startsWith('g.') ? this.global : this;
        do {
            var value = context.newVariables[key];
            if (value !== undefined) {
                if (reset)
                    context.set(key, undefined);
                return value;
            }
            context = context.base;
        } while (!reset && context);
    };
    /**
     * Gets the definition of a command.
     * @param name The name of the command.
     */
    Context.prototype.findCommand = function (name) {
        var context = this;
        do {
            var value = context.newCommands[name];
            if (value !== undefined)
                return value;
            context = context.base;
        } while (context);
    };
    Context.prototype.getBoolean = function (key, defaultValue, reset) {
        if (reset === void 0) { reset = false; }
        var value = this.get(key, reset);
        if (value === undefined)
            return defaultValue;
        var result = value === '1' ? true : value === '0' ? false : undefined;
        return result !== null && result !== void 0 ? result : defaultValue;
    };
    Context.prototype.getInteger = function (key, defaultValue, reset) {
        if (reset === void 0) { reset = false; }
        var value = this.get(key, reset);
        if (value === undefined)
            return defaultValue;
        var result = parseInt(value);
        return Number.isSafeInteger(result) ? result : defaultValue;
    };
    Context.prototype.getFloat = function (key, defaultValue, reset) {
        if (reset === void 0) { reset = false; }
        var value = this.get(key, reset);
        if (value === undefined)
            return defaultValue;
        var result = parseFloat(value);
        return Number.isFinite(result) ? result : defaultValue;
    };
    Context.prototype.throw = function (type, initiator) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return this.errors.push(new (CompilerError_1.CompilerError.bind.apply(CompilerError_1.CompilerError, __spreadArrays([void 0, type, initiator], args)))());
    };
    Context.prototype.warn = function (type, initiator) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return this.warnings.push(new (CompilerError_1.CompilerError.bind.apply(CompilerError_1.CompilerError, __spreadArrays([void 0, type, initiator], args)))());
    };
    /**
     * Generates a `Context` object as a sub-scope of the current scope.
     */
    Context.prototype.passToSubgroup = function () {
        var sub = new Context(this);
        sub._nesting = this._nesting + 1;
        return sub;
    };
    /**
     * Collects data from a sub-scope after the sub-scope is finished.
     */
    Context.prototype.collectFromSubgroup = function (subgroup, initiator) {
        if (subgroup.semisimple.length > 0) {
            this.throw('UNMATCHED_SEMISIMPLE', initiator);
            return false;
        }
        if (subgroup.newVariables['text-style-changed'] === '1') {
            // If the style changed in the subgroup, flush to reset the style
            this.flushSpan();
        }
        return true;
    };
    /**
     * Starts a new span element (for styles to apply, etc.).
     */
    Context.prototype.flushSpan = function () {
        if (!this.span.isEmpty()) {
            this.container.paragraph.append(this.span);
            this.span = new SpanElement_1.SpanElement();
        }
        this.span.initialise(this);
    };
    /**
     * Enters a container element.
     * @param element The container to enter.
     * @param initiator The token that initiates the operation.
     * @returns `false` if an error occurs, `true` otherwise.
     */
    Context.prototype.enterContainer = function (element, initiator) {
        var parentIsInline = this.container.isInline;
        this.flushSpan();
        if (element.enter)
            element.enter(this, initiator);
        this.stack.push(element);
        if (parentIsInline && !element.isInline) {
            this.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
            return false;
        }
        return true;
    };
    /**
     * Exits a container element.
     */
    Context.prototype.exitContainer = function () {
        if (this.stack.length <= 1)
            return;
        var child = this.container;
        this.flushSpan();
        this.stack.pop();
        if (child.exit)
            child.exit(this);
        if (!child.isEmpty()) {
            this.container.paragraph.append(child);
        }
    };
    /**
     * Does things after compiling everything and before rendering.
     * This is pretty much equivalent to a second LaTeX run
     * in order to get the links and TOC right.
     */
    Context.prototype.finalise = function () {
        while (this.stack.length > 1) {
            this.exitContainer();
        }
        this.removeInaccessibleBookmarks();
        this.handleReferences();
        this.root.normalise();
        this.addTableOfContents();
        // Generate compiler data
        var labels = {};
        var hasLabels = false;
        for (var _i = 0, _a = this.labels; _i < _a.length; _i++) {
            var label = _a[_i];
            var html = label
                .getHTML()
                .replace(/\uedaf"\uedaf/g, '~~.')
                .replace(/\uedae"\uedae/g, '~~');
            labels[label.key] = { id: label.bookmarkId, html: html };
            hasLabels = true;
        }
        if (hasLabels)
            this.compilerData.labels = labels;
        if (this.subpages.length > 0) {
            this.compilerData.subpages = this.subpages;
        }
        if (this.externalLinks.length > 0) {
            this.compilerData.externalLinks = this.externalLinks;
        }
    };
    /**
     * Renders everything to HTML.
     */
    Context.prototype.render = function (options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var result, html;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        result = this.root.render(options);
                        return [4 /*yield*/, Promise.all(this.promises)];
                    case 1:
                        _c.sent();
                        html = (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.outerHTML) !== null && _b !== void 0 ? _b : '';
                        html = html
                            .replace(/\uedaf"\uedaf/g, '<btex-ref data-key="--prefix--"></btex-ref>')
                            .replace(/\uedae"\uedae/g, '<btex-ref data-key="--pagenum--"></btex-ref>');
                        return [2 /*return*/, html];
                }
            });
        });
    };
    /**
     * Impersonates another scope.
     * @param context The scope to impersonate.
     */
    Context.prototype.changeTo = function (context) {
        this.base = context.base;
        this.newCommands = context.newCommands;
        this.newVariables = context.newVariables;
    };
    /**
     * Enters a semi-simple group.
     */
    Context.prototype.enterSemisimple = function () {
        var parent = new Context(this);
        parent.changeTo(this);
        this.base = parent;
        this.newCommands = {};
        this.newVariables = {};
        this.semisimple.push(parent);
        this._nesting++;
    };
    /**
     * Exits a semi-simple group.
     */
    Context.prototype.exitSemisimple = function () {
        var parent = this.semisimple.pop();
        if (!parent)
            return;
        this.changeTo(parent);
        this._nesting--;
    };
    /**
     * Compiles a code fragment to HTML, using a virtual container.
     * This does not write to the output.
     * @param code The code to compile.
     * @param initiator The token that initiates the operation.
     */
    Context.prototype.codeToHTML = function (code, initiator) {
        var element = new VirtualElement_1.VirtualElement();
        this.enterContainer(element, initiator);
        if (!Compiler_1.Compiler.compileGroup(code, this, initiator))
            return null;
        this.exitContainer();
        element.normalise();
        return element.getHTML();
    };
    /**
     * Compiles a command to HTML, using a virtual container.
     * This does not write to the output.
     * @param command The command to compile, e.g. `'\foo'`.
     * @param initiator The token that initiates the operation.
     */
    Context.prototype.commandToHTML = function (command, initiator) {
        var code = new Code_1.Code([Token_1.Token.fromParent(command, Token_1.TokenType.Command, initiator)]);
        return this.codeToHTML(code, initiator);
    };
    Context.prototype.removeInaccessibleBookmarks = function () {
        var _a, _b;
        // Remove bookmarks that are not assigned with a label
        var usedBookmarks = {};
        var inverseMap = {};
        for (var _i = 0, _c = this.labels; _i < _c.length; _i++) {
            var label = _c[_i];
            var id = parseInt(label.bookmarkId);
            if (id >= 0 && id < this.bookmarks.length && !(id in inverseMap)) {
                var prefix = (_a = this.bookmarks[id].prefix) !== null && _a !== void 0 ? _a : '';
                inverseMap[id] = { prefix: prefix, newId: -1 }; // newId to be assigned later
                ((_b = usedBookmarks[prefix]) !== null && _b !== void 0 ? _b : (usedBookmarks[prefix] = [])).push(id);
            }
        }
        for (var prefix in usedBookmarks)
            usedBookmarks[prefix].sort(function (a, b) { return a - b; });
        var newBookmarks = [];
        for (var _d = 0, _e = this.bookmarks; _d < _e.length; _d++) {
            var bookmark = _e[_d];
            bookmark.isUnused = true;
        }
        for (var prefix in usedBookmarks) {
            for (var i = 0; i < usedBookmarks[prefix].length; i++) {
                inverseMap[usedBookmarks[prefix][i]] = { prefix: prefix, newId: i };
                var bookmark = this.bookmarks[usedBookmarks[prefix][i]];
                bookmark.isUnused = false;
                bookmark.id = i;
                newBookmarks.push(bookmark);
            }
        }
        this.bookmarks = newBookmarks;
        for (var _f = 0, _g = this.labels; _f < _g.length; _f++) {
            var label = _g[_f];
            label.normalise();
            if (label.bookmarkId) {
                var map = inverseMap[parseInt(label.bookmarkId)];
                // label.bookmarkId may also be a section header
                if (map)
                    label.bookmarkId = map.prefix + (map.newId + 1);
            }
        }
    };
    Context.prototype.handleReferences = function () {
        var labelDict = {};
        for (var _i = 0, _a = this.labels; _i < _a.length; _i++) {
            var label = _a[_i];
            labelDict[label.key] = label;
        }
        for (var _b = 0, _c = this.references; _b < _c.length; _b++) {
            var ref = _c[_b];
            if (ref.page || !ref.key)
                continue;
            var label = labelDict[ref.key];
            if (!label)
                continue;
            ref.target = label;
        }
    };
    Context.prototype.addTableOfContents = function () {
        var _a, _b;
        if (this.getBoolean('g.toc-disabled', false))
            return;
        var headers = this.headers.filter(function (header) { return !header.noToc; });
        if (headers.length > 0) {
            var toc = document.createElement('div');
            toc.classList.add('toc');
            this.root.tocRendered = toc;
            var tocTitle = document.createElement('div');
            tocTitle.classList.add('toctitle');
            tocTitle.innerHTML = (_a = this.commandToHTML('\\tocname', Token_1.Token.fromCode('\\tocname', Token_1.TokenType.Command, { line: 0, col: 0 }, { line: 0, col: 0 }))) !== null && _a !== void 0 ? _a : '??';
            toc.append(tocTitle);
            var ul = document.createElement('ul');
            toc.append(ul);
            var _loop_1 = function (header) {
                var level = header.type === 'h4' ? 3 : header.type === 'h3' ? 2 : 1;
                var li = document.createElement('li');
                li.classList.add('toclevel-' + level);
                ul.append(li);
                var a = document.createElement('a');
                a.setAttribute('href', '#' + encodeURIComponent((_b = header.hash) !== null && _b !== void 0 ? _b : ''));
                li.append(a);
                if (header.numberHTML) {
                    var tocNumber = document.createElement('span');
                    tocNumber.classList.add('tocnumber');
                    tocNumber.innerHTML = header.numberHTML;
                    a.append(tocNumber);
                }
                var tocText = document.createElement('span');
                tocText.classList.add('toctext');
                header.paragraph.renderInner().map(function (node) { return tocText.append(node); });
                a.append(tocText);
            };
            for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                var header = headers_1[_i];
                _loop_1(header);
            }
        }
    };
    return Context;
}());
exports.Context = Context;
//# sourceMappingURL=Context.js.map