import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const GetInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let key = Compiler.readText(code, context, initiator);
    if (key === undefined) return false;

    let value = context.get(key) ?? '';

    let format = context.getInteger('get-format', 0, true);
    if (!(format >= 0 && format <= 4)) format = 0;

    if (format) {
      let number = parseInt(value);
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
      } else {
        value = '??';
      }
    }

    if (value) code.spliceFrom(start, Token.fromParent(value, TokenType.Text, initiator));
    else code.spliceFrom(start);
    return true;
  },
};

const romanThousands: string[] = ['', 'm', 'mm', 'mmm'];
const romanHundreds: string[] = ['', 'c', 'cc', 'ccc', 'cd', 'd', 'dc', 'dcc', 'dccc', 'cm'];
const romanTens: string[] = ['', 'x', 'xx', 'xxx', 'xl', 'l', 'lx', 'lxx', 'lxxx', 'xc'];
const romanOnes: string[] = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'];

function toRoman(n: number): string {
  if (n === 0) return '0';
  if (n < 0) return '-' + toRoman(-n);
  if (n > 1e9) return '??';
  n = Math.floor(n);

  if (n >= 4000) {
    let thousands = Math.floor(n / 1000);
    n %= 1000;
    return '(' + toRoman(thousands) + ')' + (n === 0 ? '' : toRoman(n));
  }

  let result = '';

  let i = Math.floor(n / 1000);
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

function toAlph(n: number): string {
  if (n === 0) return '0';
  if (n < 0) return '-' + toRoman(-n);
  if (n > 1e9) return '??';
  n = Math.floor(n);

  let result = '';

  let power = 1;
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
