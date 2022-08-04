"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataInternal = void 0;
var Compiler_1 = require("../Compiler");
/**
 * Adds entries to compiler data.
 */
exports.DataInternal = {
    execute: function (code, context) {
        var _a, _b;
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var dataKey = context.get('data-key', true);
        var value = '';
        if (dataKey && allowedKeys.includes(dataKey)) {
            if (richKeys.includes(dataKey)) {
                var group = code.readGroup();
                if (group) {
                    value = (_a = context.codeToHTML(group, initiator)) !== null && _a !== void 0 ? _a : '';
                }
            }
            else {
                value = (_b = Compiler_1.Compiler.readText(code, context, initiator)) !== null && _b !== void 0 ? _b : '';
            }
            if (value)
                context.compilerData[dataKey] = value;
        }
        else {
            code.readGroup();
        }
        code.spliceFrom(start);
        return true;
    },
};
var allowedKeys = ['displayTitle', 'htmlTitle', 'lang'];
var richKeys = ['displayTitle'];
//# sourceMappingURL=DataInternal.js.map