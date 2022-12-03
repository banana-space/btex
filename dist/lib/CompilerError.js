"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerError = void 0;
var errorMessages = {
    zh: {
        ARGUMENT_EXPECTED: '缺少命令的参数。',
        COMMAND_ALREADY_DEFINED_1: "命令 '$1' 已有定义。",
        COMMAND_EXPECTED: '缺少要定义的命令。',
        DUPLICATE_LABEL_1: "标签名称 '$1' 重复。",
        DUPLICATE_SUBPAGE_1: "子页面的名称 '$1' 重复。",
        ENVIRONMENT_ALREADY_DEFINED_1: "环境 '$1' 已有定义。",
        EQUATION_TAG_INLINE_MODE: '行间公式 ($...$) 不能编号。',
        INVALID_COMMAND_NAME_1: "命令名 '$1' 不合法。",
        INVALID_CONTAINER_NAME_1: "容器 '$1' 不存在。",
        MAX_EXPANSIONS_EXCEEDED_1: '宏展开次数超出最大限制 ($1 次)。',
        MAX_NESTING_EXCEEDED_1: '括号嵌套层数超出最大限制 ($1 层)。',
        MAX_TOKENS_EXCEEDED_1: '宏展开过程中，代码长度超出限制 ($1)。',
        MATH_MODE_REQUIRED: '命令只有在数学公式中才能使用。',
        NO_MATCHING_DEFINITIONS: '命令的用法与其定义不匹配。',
        NO_MATCHING_DEFINITIONS_1: "命令 '$1' 的用法与其定义不匹配。",
        NO_PARAGRAPHS_IN_INLINE_MODE: '此处不允许分段。',
        NO_PARAGRAPHS_IN_TABLES: '表格中不允许分段。',
        PLAIN_TEXT_EXPECTED: '参数应该是纯文本。',
        TABLE_IN_MATH_MODE: '数学公式中不能添加表格。',
        TIKZ_IN_INLINE_MODE: 'TikZ 插图不能在行间公式 ($...$) 中使用。',
        TOKEN_EXPECTED_1: "缺少 '$1'。",
        UNCLOSED_CONTAINER: '容器没有退出。',
        UNDEFINED_COMMAND: '命令没有定义。',
        UNDEFINED_COMMAND_1: "命令 '$1' 没有定义。",
        UNDEFINED_ENVIRONMENT: '环境没有定义。',
        UNDEFINED_ENVIRONMENT_1: "环境 '$1' 没有定义。",
        UNEXPECTED_TOKEN_1: "'$1' 不该出现在这里。",
        UNKNOWN_EVENT: '事件没有定义。',
        UNMATCHED_ENVIRONMENT: '环境没有配对',
        UNMATCHED_ENVIRONMENT_1: "环境 '$1' 没有配对",
        UNMATCHED_EXIT_CONTAINER: '容器没有配对。',
        UNMATCHED_LEFT_BRACKET: "括号 '{' 没有配对。",
        UNMATCHED_RIGHT_BRACKET: "括号 '}' 没有配对。",
        UNMATCHED_SEMISIMPLE: '半单括号没有配对。',
        UNKNOWN_THEOREM_STYLE: '不支持的定理风格。',
        UNKNOWN: '发生编译器内部错误。',
    },
};
var CompilerError = /** @class */ (function () {
    function CompilerError(type, initiator) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.type = type;
        this.initiator = initiator.source;
        this.args = args;
    }
    CompilerError.prototype.getMessage = function (lang) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var message = this.type;
        if (lang && errorMessages[lang]) {
            message =
                (_b = (_a = errorMessages[lang][this.type + '_' + this.args.length]) !== null && _a !== void 0 ? _a : errorMessages[lang][this.type]) !== null && _b !== void 0 ? _b : this.type;
            for (var i = 0; i < 9 && i < this.args.length; i++) {
                message = message.replace('$' + (i + 1), this.args[i]);
            }
        }
        return "".concat((_d = (_c = this.initiator.start) === null || _c === void 0 ? void 0 : _c.file) !== null && _d !== void 0 ? _d : '', ":").concat(((_f = (_e = this.initiator.start) === null || _e === void 0 ? void 0 : _e.line) !== null && _f !== void 0 ? _f : -1) + 1, ":").concat(((_h = (_g = this.initiator.start) === null || _g === void 0 ? void 0 : _g.col) !== null && _h !== void 0 ? _h : -1) + 1, " ").concat(message);
    };
    return CompilerError;
}());
exports.CompilerError = CompilerError;
//# sourceMappingURL=CompilerError.js.map