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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikzElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var url_1 = require("url");
var MathElement_1 = require("./MathElement");
var axios_1 = __importDefault(require("axios"));
var TikzElement = /** @class */ (function () {
    function TikzElement() {
        this.name = 'tikz';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
        this.variant = 'tikzpicture';
        this.noRender = false;
    }
    TikzElement.prototype.isEmpty = function () {
        return !this.getText();
    };
    TikzElement.prototype.normalise = function () { };
    TikzElement.prototype.getText = function () {
        return this.paragraph.getText();
    };
    TikzElement.prototype.event = function (name, context, initiator) {
        switch (name) {
            case 'par':
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    TikzElement.prototype.enter = function (context, initiator) {
        this.variant = context.get('tikz-variant') === 'tikzcd' ? 'tikzcd' : 'tikzpicture';
        var container = context.container;
        if (container instanceof MathElement_1.MathElement && container.isInline) {
            context.throw('TIKZ_IN_INLINE_MODE', initiator);
            this.noRender = true;
        }
        this.initiator = initiator;
    };
    TikzElement.prototype.exit = function (context) {
        context.promises.push(this.asyncRender(this.getText()));
    };
    TikzElement.prototype.render = function (options) {
        var _a, _b;
        if (this.noRender)
            return [];
        var span = document.createElement('span');
        span.classList.add('error');
        span.append(document.createTextNode('[TikZ 编译错误]'));
        if ((options === null || options === void 0 ? void 0 : options.inverseSearch) && this.initiator) {
            span.setAttribute('data-pos', (((_b = (_a = this.initiator.start) === null || _a === void 0 ? void 0 : _a.line) !== null && _b !== void 0 ? _b : 0) + 1).toString());
        }
        this.placeholder = span;
        return [span];
    };
    TikzElement.prototype.asyncRender = function (text) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var url, tex, body, _b, rand, i, div, element;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.noRender)
                            return [2 /*return*/];
                        url = new url_1.URL('http://127.0.0.1:9292');
                        url.searchParams.append('type', this.variant);
                        tex = text.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
                        url.searchParams.append('tex', tex);
                        if (!(this.svg === undefined)) return [3 /*break*/, 5];
                        this.svg = '';
                        body = '';
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post(url.href, {
                                responseType: 'text'
                            })];
                    case 2:
                        body = (_c.sent()).data;
                        return [3 /*break*/, 4];
                    case 3:
                        _b = _c.sent();
                        return [2 /*return*/];
                    case 4:
                        if (body) {
                            rand = '';
                            for (i = 0; i < 16; i++)
                                rand += Math.floor(Math.random() * 16).toString(16);
                            this.svg = body
                                .replace(/\n\s*/g, '')
                                .replace(/^<\?xml[^>]*\?>/, '')
                                .replace(/width="([\d\.]+)(pt)?"/, function (_, width) {
                                return 'width="' + width * 0.11 + 'em"';
                            })
                                .replace(/height="([\d\.]+)(pt)?"/, function (_, height) {
                                return 'height="' + height * 0.11 + 'em"';
                            })
                                .replace(/(id="|href="#|url\(#)/g, '$1' + rand);
                        }
                        _c.label = 5;
                    case 5:
                        if (this.svg) {
                            div = document.createElement('div');
                            div.innerHTML = this.svg;
                            element = div.firstChild;
                            if (element !== null)
                                (_a = this.placeholder) === null || _a === void 0 ? void 0 : _a.replaceWith(element);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return TikzElement;
}());
exports.TikzElement = TikzElement;
//# sourceMappingURL=TikzElement.js.map