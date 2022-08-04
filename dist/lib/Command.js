"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
var Code_1 = require("./Code");
var Command = /** @class */ (function () {
    function Command(name) {
        this.definitions = [];
        this.isGlobal = false;
        this.isTextCommand = false;
        this.name = name;
    }
    Command.prototype.clone = function () {
        var _a;
        var cloned = new Command(this.name);
        (_a = cloned.definitions).push.apply(_a, this.definitions);
        cloned.isGlobal = this.isGlobal;
        cloned.isTextCommand = this.isTextCommand;
        return cloned;
    };
    // Used in worker threads
    Command.reconstructFrom = function (command) {
        var c = new Command(command.name);
        for (var _i = 0, _a = command.definitions; _i < _a.length; _i++) {
            var def = _a[_i];
            c.definitions.push({
                pattern: new Code_1.Code(def.pattern.tokens),
                replace: new Code_1.Code(def.replace.tokens),
            });
        }
        c.isGlobal = command.isGlobal;
        c.isTextCommand = command.isTextCommand;
        return c;
    };
    return Command;
}());
exports.Command = Command;
//# sourceMappingURL=Command.js.map