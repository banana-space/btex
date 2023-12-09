import { Token } from './Token';

const errorMessages: { [lang: string]: { [type: string]: string } } = {
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
    UNDEFINED_COUNTER: "计数器没有定义。",
    UNDEFINED_COUNTER_1: "计数器 '$1' 没有定义",
    UNDEFINED_ENVIRONMENT: '环境没有定义。',
    UNDEFINED_ENVIRONMENT_1: "环境 '$1' 没有定义。",
    UNEXPECTED_TOKEN_1: "'$1' 不该出现在这里。",
    UNKNOWN_EVENT: '事件没有定义。',
    UNMATCHED_ENVIRONMENT: '环境没有配对',
    UNMATCHED_ENVIRONMENT_1: "环境 '$1' 没有配对",
    UNMATCHED_EXIT_CONTAINER: "容器 '$1' 没有配对。",
    UNMATCHED_LEFT_BRACKET: "括号 '{' 没有配对。",
    UNMATCHED_RIGHT_BRACKET: "括号 '}' 没有配对。",
    UNMATCHED_SEMISIMPLE: '半单括号没有配对。',
    UNKNOWN_THEOREM_STYLE: '不支持的定理风格。',
    UNKNOWN: '发生编译器内部错误。',
  },
};

export type CompilerErrorType =
  | 'ARGUMENT_EXPECTED'
  | 'COMMAND_ALREADY_DEFINED'
  | 'COMMAND_EXPECTED'
  | 'DUPLICATE_LABEL'
  | 'DUPLICATE_SUBPAGE'
  | 'ENVIRONMENT_ALREADY_DEFINED'
  | 'EQUATION_TAG_INLINE_MODE'
  | 'INVALID_COMMAND_NAME'
  | 'INVALID_CONTAINER_NAME'
  | 'MAX_EXPANSIONS_EXCEEDED'
  | 'MAX_NESTING_EXCEEDED'
  | 'MAX_TOKENS_EXCEEDED'
  | 'MATH_MODE_REQUIRED'
  | 'NO_MATCHING_DEFINITIONS'
  | 'NO_PARAGRAPHS_IN_INLINE_MODE'
  | 'NO_PARAGRAPHS_IN_TABLES'
  | 'PLAIN_TEXT_EXPECTED'
  | 'TABLE_IN_MATH_MODE'
  | 'TIKZ_IN_INLINE_MODE'
  | 'TOKEN_EXPECTED'
  | 'UNCLOSED_CONTAINER'
  | 'UNDEFINED_COMMAND'
  | 'UNDEFINED_ENVIRONMENT'
  | 'UNEXPECTED_TOKEN'
  | 'UNKNOWN_EVENT'
  | 'UNMATCHED_ENVIRONMENT'
  | 'UNMATCHED_EXIT_CONTAINER'
  | 'UNMATCHED_LEFT_BRACKET'
  | 'UNMATCHED_RIGHT_BRACKET'
  | 'UNMATCHED_SEMISIMPLE'
  | 'UNKNOWN_THEOREM_STYLE'
  | 'UNKNOWN';

export class CompilerError {
  type: CompilerErrorType;
  initiator: Token;
  args: string[];

  constructor(type: CompilerErrorType, initiator: Token, ...args: string[]) {
    this.type = type;
    this.initiator = initiator.source;
    this.args = args;
  }

  getMessage(lang?: string): string {
    let message: string = this.type;
    if (lang && errorMessages[lang]) {
      message =
        errorMessages[lang][this.type + '_' + this.args.length] ??
        errorMessages[lang][this.type] ??
        this.type;

      for (let i = 0; i < 9 && i < this.args.length; i++) {
        message = message.replace('$' + (i + 1), this.args[i]);
      }
    }

    return `${this.initiator.start?.file ?? ''}:${(this.initiator.start?.line ?? -1) + 1}:${
      (this.initiator.start?.col ?? -1) + 1
    } ${message}`;
  }
}
