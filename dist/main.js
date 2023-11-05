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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.runWorker = exports.globalContext = exports.rawWork = exports.WorkerPool = void 0;
var fs_1 = require("fs");
var http_1 = require("http");
var path_1 = require("path");
var jsdom_1 = require("jsdom");
var Compiler_1 = require("./lib/Compiler");
var Context_1 = require("./lib/Context");
var Parser_1 = require("./lib/Parser");
var WorkerPool_1 = require("./WorkerPool");
var WorkerPool_2 = require("./WorkerPool");
Object.defineProperty(exports, "WorkerPool", { enumerable: true, get: function () { return WorkerPool_2.WorkerPool; } });
var yargs_1 = __importDefault(require("yargs/yargs"));
var helpers_1 = require("yargs/helpers");
var worker_1 = require("./worker");
Object.defineProperty(exports, "rawWork", { enumerable: true, get: function () { return worker_1.rawWork; } });
var window = new jsdom_1.JSDOM().window;
global['document'] = window.document;
// Initialise context using lib/init.btx
exports.globalContext = new Context_1.Context();
Compiler_1.Compiler.compile(Parser_1.Parser.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../src/lib/init.btx')).toString()), exports.globalContext);
var pool = undefined;
function runWorker(code, preamble, options, renderOptions) {
    if (pool === undefined) {
        pool = new WorkerPool_1.WorkerPool(4);
    }
    return pool.work({
        code: code,
        preamble: preamble,
        options: options,
        renderOptions: renderOptions,
        globalContext: exports.globalContext,
    });
}
exports.runWorker = runWorker;
function render(data, preamble) {
    return runWorker(data, preamble, Compiler_1.defaultCompilerOptions, { inverseSearch: false }).then(function (result) {
        if (result.errors.length) {
            return result.errors.join();
        }
        else {
            return result.html;
        }
    }, function (err) { return err; });
}
exports.render = render;
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}
function serve(port) {
    var requests = 0;
    var server = (0, http_1.createServer)(function (request, response) {
        if (request.method !== 'POST') {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'text/plain');
            response.end("Please send a POST request with a 'code' field.");
        }
        else {
            var body_1 = '';
            request.on('data', function (data) { return (body_1 += data); });
            request.on('end', function () {
                var _a;
                var start = new Date();
                var id = ++requests;
                console.log("[".concat(getTimestamp(), "] #").concat(id, " Accepted."));
                var post = JSON.parse(body_1);
                var code = (_a = post['code']) !== null && _a !== void 0 ? _a : '';
                var renderOptions = {
                    inverseSearch: post['inverseSearch'] === true,
                };
                var options = Compiler_1.defaultCompilerOptions;
                options.inline = post['inline'] === true;
                options.equationMode = post['equationMode'] === true;
                runWorker(code, post['preamble'], options, renderOptions).then(function (result) {
                    var ms = new Date().getTime() - start.getTime();
                    console.log("[".concat(getTimestamp(), "] #").concat(id, " Resolved (").concat(ms, " ms)."));
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(result));
                });
            });
        }
    });
    server.listen(port, '127.0.0.1', function () {
        console.log("[".concat(getTimestamp(), "] bTeX running at http://127.0.0.1:").concat(port));
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var result, katexCss;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runWorker((0, fs_1.readFileSync)('./test/test.btx').toString())];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    katexCss = 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css';
                    (0, fs_1.writeFileSync)('test/test.html', "<!DOCTYPE html><head><meta charset=\"UTF-8\"><link rel=\"stylesheet\" href=\"".concat(katexCss, "\"><link rel=\"stylesheet\" href=\"test.css\"><title>Test Page</title></head><body>").concat(result.html, "</body>"));
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    var argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .option('port', {
        alias: 'p',
        describe: 'Port to bind on',
        default: 7200,
        number: true,
    }).option('worker', {
        alias: 'w',
        describe: 'Number of workers',
        default: 4,
        number: true
    }).parseSync();
    pool = new WorkerPool_1.WorkerPool(argv.worker);
    serve(argv.port);
    // Uncomment to compile ./test/test.btx to ./test/test.html
    // test();
}
//# sourceMappingURL=main.js.map