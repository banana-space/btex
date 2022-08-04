import { TextPosition, Token } from '../Token';
export declare class TextNode {
    text: string;
    position?: TextPosition;
    constructor(text: string, source?: Token);
    render(): Text;
}
//# sourceMappingURL=TextNode.d.ts.map