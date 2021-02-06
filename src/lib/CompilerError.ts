import { Token } from './Token';

const errorMessages: { [type: string]: { [lang: string]: string } } = {
  UNMATCHED_LEFT_BRACKET: {
    en: "Unmatched '{'.",
    zh: "括号 '{' 没有配对。",
  },
  // TODO: add more
};

export type CompilerErrorType =
  | 'ARGUMENT_EXPECTED'
  | 'COMMAND_EXPECTED'
  | 'DUPLICATE_SUBPAGE'
  | 'INVALID_COMMAND_NAME'
  | 'INVALID_CONTAINER_NAME'
  | 'MAX_EXPANSIONS_EXCEEDED'
  | 'MAX_NESTING_EXCEEDED'
  | 'MAX_TOKENS_EXCEEDED'
  | 'NO_MATCHING_DEFINITIONS'
  | 'NO_PARAGRAPHS_IN_INLINE_MODE'
  | 'PLAIN_TEXT_EXPECTED'
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
    let message = errorMessages[this.type]
      ? (lang && errorMessages[this.type][lang]) ?? errorMessages[this.type]['en']
      : undefined;
    return `Ln ${(this.initiator.start?.line ?? -1) + 1}, Col ${
      (this.initiator.start?.col ?? -1) + 1
    }: ${message ?? this.type} ${this.args.join(', ')}`;
  }
}
