import { Code } from './Code';
import { Context } from './Context';
import { AddInternal } from './internals/AddInternal';
import { BookmarkInternal } from './internals/BookmarkInternal';
import { CharacterInternal } from './internals/CharacterInternal';
import { CodeInternal } from './internals/CodeInternal';
import { CommandInternal } from './internals/CommandInternal';
import { DataInternal } from './internals/DataInternal';
import { DefineInternal } from './internals/DefineInternal';
import { EnterInternal } from './internals/EnterInternal';
import { EventInternal } from './internals/EventInternal';
import { ExitInternal } from './internals/ExitInternal';
import { FunctionInternal } from './internals/FunctionInternal';
import { GetInternal } from './internals/GetInternal';
import { IfDefinedInternal } from './internals/IfDefinedInternal';
import { IfInternal } from './internals/IfInternal';
import { LabelInternal } from './internals/LabelInternal';
import { LetInternal } from './internals/LetInternal';
import { SetInternal } from './internals/SetInternal';
import { SubpageInternal } from './internals/SubpageInternal';
import { TextInternal } from './internals/TextInternal';
import { ThrowInternal } from './internals/ThrowInternal';

export interface Internal {
  execute(code: Code, context: Context): boolean;
}

export const Internals: { [key: string]: Internal } = {
  '\\@@add': AddInternal,
  '\\@@bmk': BookmarkInternal,
  '\\@@char': CharacterInternal,
  '\\@@code': CodeInternal,
  '\\@@cmd': CommandInternal,
  '\\@@data': DataInternal,
  '\\@@def': DefineInternal,
  '\\@@enter': EnterInternal,
  '\\@@event': EventInternal,
  '\\@@exit': ExitInternal,
  '\\@@fun': FunctionInternal,
  '\\@@get': GetInternal,
  '\\@@if': IfInternal,
  '\\@@ifdef': IfDefinedInternal,
  '\\@@label': LabelInternal,
  '\\@@let': LetInternal,
  '\\@@set': SetInternal,
  '\\@@subpage': SubpageInternal,
  '\\@@text': TextInternal,
  '\\@@throw': ThrowInternal,
};
