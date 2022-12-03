"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubpageInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.SubpageInternal = {
    execute: function (code, context) {
        var _a, _b;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        context.set('c-link-arg', '1');
        var text = Compiler_1.Compiler.readText(code, context, initiator);
        context.set('c-link-arg', '0');
        if (text === undefined)
            return false;
        var level = context.getInteger('subpage-level', 1, true);
        if (!(level >= 1 && level <= 3))
            level = 1;
        while (context.subpageOfLevel.length > level - 1)
            context.subpageOfLevel.pop();
        context.subpageOfLevel.push(text);
        var fullTitle = './' + context.subpageOfLevel.join('/');
        context.set('subpage-title', fullTitle);
        var isDuplicate = false;
        for (var _i = 0, _c = context.subpages; _i < _c.length; _i++) {
            var subpage = _c[_i];
            if (subpage.title === fullTitle)
                isDuplicate = true;
        }
        // Get display title of subpage
        var displayTitle = (_a = context.commandToHTML('\\@subdisplaytitle', initiator)) !== null && _a !== void 0 ? _a : '??';
        if (isDuplicate) {
            context.warn('DUPLICATE_SUBPAGE', initiator, fullTitle);
        }
        else {
            context.subpages.push({
                title: fullTitle,
                displayTitle: displayTitle,
                level: level,
                number: (_b = context.get('subpage-number')) !== null && _b !== void 0 ? _b : '', // No resetting; subpage-number is used after this.
            });
        }
        return true;
    },
};
//# sourceMappingURL=SubpageInternal.js.map