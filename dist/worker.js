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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawWork = void 0;
var jsdom_1 = require("jsdom");
var worker_threads_1 = require("worker_threads");
var Command_1 = require("./lib/Command");
var Compiler_1 = require("./lib/Compiler");
var Context_1 = require("./lib/Context");
var MathElement_1 = require("./lib/elements/MathElement");
var Parser_1 = require("./lib/Parser");
var Token_1 = require("./lib/Token");
var window = new jsdom_1.JSDOM().window;
global['document'] = window.document;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', function (value) {
    work(value).then(function (res) { return worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(res); }, function () {
        var _a;
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
            taskId: (_a = value.taskId) !== null && _a !== void 0 ? _a : 0,
            html: '',
            data: '',
            errors: ['UNKNOWN'],
            warnings: [],
        });
    });
});
function rawWork(data) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var globalContext, contextData, key, context, preamble, code, lineBreak, html;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Reconstruct the Context object from JSON data
                    if ((_a = data.options) === null || _a === void 0 ? void 0 : _a.equationMode)
                        data.options.inline = true;
                    globalContext = new Context_1.Context(undefined, data.options);
                    contextData = data.globalContext;
                    globalContext.newCommands = {};
                    globalContext.newVariables = contextData.newVariables;
                    for (key in contextData.newCommands)
                        globalContext.newCommands[key] = Command_1.Command.reconstructFrom(contextData.newCommands[key]);
                    globalContext.set('__code__', data.code);
                    context = new Context_1.Context(globalContext);
                    // Compile preamble
                    if (data.preamble) {
                        preamble = Parser_1.Parser.parse(data.preamble, 'preamble');
                        context.noOutput = true;
                        Compiler_1.Compiler.compile(preamble, context);
                        context.noOutput = false;
                    }
                    // Parse and compile
                    if ((_b = data.options) === null || _b === void 0 ? void 0 : _b.equationMode) {
                        context.enterContainer(new MathElement_1.MathElement(), Token_1.Token.fromCode('$', Token_1.TokenType.Text, { line: 0, col: 0 }, { line: 0, col: 0 }));
                    }
                    code = Parser_1.Parser.parse(data.code, 'code');
                    if (!((_c = data.options) === null || _c === void 0 ? void 0 : _c.inline)) {
                        lineBreak = Token_1.Token.fromCode('\n', Token_1.TokenType.Whitespace, { line: 0, col: 0 }, { line: 0, col: 0 });
                        code.tokens.splice(0, 0, lineBreak, lineBreak);
                    }
                    Compiler_1.Compiler.compile(code, context);
                    if ((_d = data.options) === null || _d === void 0 ? void 0 : _d.equationMode) {
                        context.exitContainer();
                    }
                    return [4 /*yield*/, context.render(data.renderOptions)];
                case 1:
                    html = _e.sent();
                    return [2 /*return*/, {
                            html: html,
                            data: JSON.stringify(context.compilerData),
                            errors: context.errors.map(function (e) { return e.getMessage('zh'); }),
                            warnings: context.warnings.map(function (e) { return e.getMessage('zh'); }),
                        }];
            }
        });
    });
}
exports.rawWork = rawWork;
function work(data) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (data.expiresAt && new Date().getTime() > data.expiresAt) {
                        return [2 /*return*/, {
                                taskId: (_a = data.taskId) !== null && _a !== void 0 ? _a : 0,
                                html: '',
                                data: '',
                                errors: ['SERVER_IS_BUSY'],
                                warnings: [],
                            }];
                    }
                    return [4 /*yield*/, rawWork(data)];
                case 1:
                    result = _c.sent();
                    result.taskId = (_b = data.taskId) !== null && _b !== void 0 ? _b : 0;
                    return [2 /*return*/, result];
            }
        });
    });
}
//# sourceMappingURL=worker.js.map