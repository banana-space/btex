export declare enum TokenType {
    Whitespace = 0,
    Text = 1,
    BeginGroup = 2,
    EndGroup = 3,
    Special = 4,
    Command = 5,
    Argument = 6
}
export interface TextPosition {
    file?: string;
    line: number;
    col: number;
}
export declare class Token {
    text: string;
    type: TokenType;
    start?: TextPosition;
    end?: TextPosition;
    source: Token;
    noExpand?: boolean;
    specialCommand?: string;
    private constructor();
    static fromCode(text: string, type: TokenType, start: TextPosition, end: TextPosition): Token;
    static fromParent(text: string, type: TokenType, parent: Token): Token;
    static cloneAsChildOf(token: Token, parent: Token): Token;
    static equals(left: {
        type: TokenType;
        text: string;
    }, right: {
        type: TokenType;
        text: string;
    }): boolean;
}
//# sourceMappingURL=Token.d.ts.map