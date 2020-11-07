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
  '\\@@add': AddInternal,
  '\\@@bmk': BookmarkInternal,
  '\\@@char': CharacterInternal,
  '\\@@cmd': CommandInternal,
  '\\@@def': DefineInternal,
  '\\@@enter': EnterInternal,
  '\\@@event': EventInternal,
  '\\@@exit': ExitInternal,
  '\\@@get': GetInternal,
  '\\@@if': IfInternal,
  '\\@@ifdef': IfDefinedInternal,
  '\\@@label': LabelInternal,
  '\\@@let': LetInternal,
  '\\@@set': SetInternal,
  '\\@@text': TextInternal,
  '\\@@throw': ThrowInternal,
};
