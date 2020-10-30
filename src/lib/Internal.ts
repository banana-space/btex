import { Code } from './Code';
import { Context } from './Context';
import { AddInternal } from './internals/AddInternal';
import { BookmarkInternal } from './internals/BookmarkInternal';
import { CharacterInternal } from './internals/CharacterInternal';
import { CommandInternal } from './internals/CommandInternal';
import { DefineInternal } from './internals/DefineInternal';
import { EnterInternal } from './internals/EnterInternal';
import { EventInternal } from './internals/EventInternal';
import { ExitInternal } from './internals/ExitInternal';
import { GetInternal } from './internals/GetInternal';
import { IfDefinedInternal } from './internals/IfDefinedInternal';
import { IfInternal } from './internals/IfInternal';
import { LabelInternal } from './internals/LabelInternal';
import { LetInternal } from './internals/LetInternal';
import { SetInternal } from './internals/SetInternal';
import { TextInternal } from './internals/TextInternal';
import { ThrowInternal } from './internals/ThrowInternal';

export interface Internal {
  execute(code: Code, context: Context): boolean;
}

export const Internals: { [key: string]: Internal } = {
  '\\@@add': AddInternal.prototype,
  '\\@@bmk': BookmarkInternal.prototype,
  '\\@@char': CharacterInternal.prototype,
  '\\@@cmd': CommandInternal.prototype,
  '\\@@def': DefineInternal.prototype,
  '\\@@enter': EnterInternal.prototype,
  '\\@@event': EventInternal.prototype,
  '\\@@exit': ExitInternal.prototype,
  '\\@@get': GetInternal.prototype,
  '\\@@if': IfInternal.prototype,
  '\\@@ifdef': IfDefinedInternal.prototype,
  '\\@@label': LabelInternal.prototype,
  '\\@@let': LetInternal.prototype,
  '\\@@set': SetInternal.prototype,
  '\\@@text': TextInternal.prototype,
  '\\@@throw': ThrowInternal.prototype,
};
