"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInternal = void 0;
var Compiler_1 = require("../Compiler");
var Token_1 = require("../Token");
exports.GetInternal = {
    execute: function (code, context) {
        var _a;
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var key = Compiler_1.Compiler.readText(code, context, initiator);
        if (key === undefined)
            return false;
        var value = (_a = context.get(key)) !== null && _a !== void 0 ? _a : '';
        var format = context.getInteger('get-format', 0, true);
        if (!(format >= 0 && format <= 4))
            format = 0;
        if (format) {
            var number = parseInt(value);
            if (Number.isInteger(number)) {
                switch (format) {
                    case 1:
                        value = toAlph(number);
                        break;
                    case 2:
                        value = toAlph(number).toUpperCase();
                        break;
                    case 3:
                        value = toRoman(number);
                        break;
                    case 4:
                        value = toRoman(number).toUpperCase();
                        break;
                }
            }
            else {
                value = '??';
            }
        }
        if (value)
            code.spliceFrom(start, Token_1.Token.fromParent(value, Token_1.TokenType.Text, initiator));
        else
            code.spliceFrom(start);
        return true;
    },
};
var romanThousands = ['', 'm', 'mm', 'mmm'];
var romanHundreds = ['', 'c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm'];
var romanTens = ['', 'x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc'];
var romanOnes = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'];
function toRoman(n) {
    if (n === 0)
        return '0';
    if (n < 0)
        return '-' + toRoman(-n);
    if (n > 1e9)
        return '??';
    n = Math.floor(n);
    if (n >= 4000) {
        var thousands = Math.floor(n / 1000);
        n %= 1000;
        return '(' + toRoman(thousands) + ')' + (n === 0 ? '' : toRoman(n));
    }
    var result = '';
    var i = Math.floor(n / 1000);
    result += romanThousands[i];
    n %= 1000;
    i = Math.floor(n / 100);
    result += romanHundreds[i];
    n %= 100;
    i = Math.floor(n / 10);
    result += romanTens[i];
    n %= 10;
    result += romanOnes[n];
    return result;
}
function toAlph(n) {
    if (n === 0)
        return '0';
    if (n < 0)
        return '-' + toRoman(-n);
    if (n > 1e9)
        return '??';
    n = Math.floor(n);
    var result = '';
    var power = 1;
    while (power <= n) {
        n -= power;
        power *= 26;
    }
    while (power > 1) {
        power /= 26;
        result += String.fromCodePoint(97 + Math.floor(n / power));
        n %= power;
    }
    return result;
}
//# sourceMappingURL=GetInternal.js.map