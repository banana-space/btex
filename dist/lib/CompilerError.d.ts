import { Token } from './Token';
export declare type CompilerErrorType = 'ARGUMENT_EXPECTED' | 'COMMAND_ALREADY_DEFINED' | 'COMMAND_EXPECTED' | 'DUPLICATE_LABEL' | 'DUPLICATE_SUBPAGE' | 'ENVIRONMENT_ALREADY_DEFINED' | 'EQUATION_TAG_INLINE_MODE' | 'INVALID_COMMAND_NAME' | 'INVALID_CONTAINER_NAME' | 'MAX_EXPANSIONS_EXCEEDED' | 'MAX_NESTING_EXCEEDED' | 'MAX_TOKENS_EXCEEDED' | 'MATH_MODE_REQUIRED' | 'NO_MATCHING_DEFINITIONS' | 'NO_PARAGRAPHS_IN_INLINE_MODE' | 'NO_PARAGRAPHS_IN_TABLES' | 'PLAIN_TEXT_EXPECTED' | 'TABLE_IN_MATH_MODE' | 'TIKZ_IN_INLINE_MODE' | 'TOKEN_EXPECTED' | 'UNCLOSED_CONTAINER' | 'UNDEFINED_COMMAND' | 'UNDEFINED_ENVIRONMENT' | 'UNEXPECTED_TOKEN' | 'UNKNOWN_EVENT' | 'UNMATCHED_ENVIRONMENT' | 'UNMATCHED_EXIT_CONTAINER' | 'UNMATCHED_LEFT_BRACKET' | 'UNMATCHED_RIGHT_BRACKET' | 'UNMATCHED_SEMISIMPLE' | 'UNKNOWN_THEOREM_STYLE' | 'UNKNOWN';
export declare class CompilerError {
    type: CompilerErrorType;
    initiator: Token;
    args: string[];
    constructor(type: CompilerErrorType, initiator: Token, ...args: string[]);
    getMessage(lang?: string): string;
}
//# sourceMappingURL=CompilerError.d.ts.map