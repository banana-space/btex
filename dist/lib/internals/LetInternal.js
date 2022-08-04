"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LetInternal = void 0;
var Code_1 = require("../Code");
var Command_1 = require("../Command");
var Internal_1 = require("../Internal");
var Token_1 = require("../Token");
exports.LetInternal = {
    execute: function (code, context) {
        var _a, _b;
        var _c, _d;
        var start = code.pointer;
        var initiator = code.token;
        if (!code.canStep()) {
            context.throw('COMMAND_EXPECTED', initiator);
            return false;
        }
        code.step();
        var t = code.token;
        var name = t.text;
        if ((t.type !== Token_1.TokenType.Command &&
            t.type !== Token_1.TokenType.Text &&
            t.type !== Token_1.TokenType.Whitespace) ||
            Internal_1.Internals[name]) {
            context.throw('INVALID_COMMAND_NAME', t, t.text);
            return false;
        }
        if (!code.canStep()) {
            context.throw('COMMAND_EXPECTED', initiator);
            return false;
        }
        code.step();
        var second = code.token;
        if (second.type !== Token_1.TokenType.Command) {
            context.throw('COMMAND_EXPECTED', initiator);
            return false;
        }
        var secondCommand = context.findCommand(second.text);
        if (!secondCommand) {
            var internal = Internal_1.Internals[second.text];
            if (internal) {
                secondCommand = new Command_1.Command(second.text);
                secondCommand.definitions.push({
                    pattern: new Code_1.Code([]),
                    replace: new Code_1.Code([
                        Token_1.Token.fromCode(second.text, Token_1.TokenType.Command, { line: 0, col: 0 }, { line: 0, col: 0 }),
                    ]),
                });
            }
            if (!secondCommand) {
                context.throw('UNDEFINED_COMMAND', second, second.text);
                return false;
            }
        }
        var command = context.newCommands[name];
        if (!command) {
            command = (_d = (_c = context.findCommand(name)) === null || _c === void 0 ? void 0 : _c.clone()) !== null && _d !== void 0 ? _d : new Command_1.Command(name);
        }
        var overwrite = true;
        context.getBoolean('def-expand', false, true);
        if (context.getBoolean('def-prepend', false, true)) {
            (_a = command.definitions).splice.apply(_a, __spreadArrays([0, 0], secondCommand.definitions));
            overwrite = false;
        }
        if (context.getBoolean('def-append', false, true)) {
            (_b = command.definitions).push.apply(_b, secondCommand.definitions);
            overwrite = false;
        }
        if (overwrite) {
            command.definitions = __spreadArrays(secondCommand.definitions);
        }
        command.isGlobal = context.getBoolean('def-global', false, true);
        command.isTextCommand = context.getBoolean('def-text', false, true);
        context.defineCommand(command);
        code.step();
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=LetInternal.js.map