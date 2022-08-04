"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Internals = void 0;
var AddInternal_1 = require("./internals/AddInternal");
var BookmarkInternal_1 = require("./internals/BookmarkInternal");
var CharacterInternal_1 = require("./internals/CharacterInternal");
var CodeInternal_1 = require("./internals/CodeInternal");
var CommandInternal_1 = require("./internals/CommandInternal");
var DataInternal_1 = require("./internals/DataInternal");
var DefineInternal_1 = require("./internals/DefineInternal");
var EnterInternal_1 = require("./internals/EnterInternal");
var EventInternal_1 = require("./internals/EventInternal");
var ExitInternal_1 = require("./internals/ExitInternal");
var FunctionInternal_1 = require("./internals/FunctionInternal");
var GetInternal_1 = require("./internals/GetInternal");
var IfDefinedInternal_1 = require("./internals/IfDefinedInternal");
var IfInternal_1 = require("./internals/IfInternal");
var LabelInternal_1 = require("./internals/LabelInternal");
var LetInternal_1 = require("./internals/LetInternal");
var SetInternal_1 = require("./internals/SetInternal");
var SubpageInternal_1 = require("./internals/SubpageInternal");
var TextInternal_1 = require("./internals/TextInternal");
var ThrowInternal_1 = require("./internals/ThrowInternal");
exports.Internals = {
    '\\@@add': AddInternal_1.AddInternal,
    '\\@@bmk': BookmarkInternal_1.BookmarkInternal,
    '\\@@char': CharacterInternal_1.CharacterInternal,
    '\\@@code': CodeInternal_1.CodeInternal,
    '\\@@cmd': CommandInternal_1.CommandInternal,
    '\\@@data': DataInternal_1.DataInternal,
    '\\@@def': DefineInternal_1.DefineInternal,
    '\\@@enter': EnterInternal_1.EnterInternal,
    '\\@@event': EventInternal_1.EventInternal,
    '\\@@exit': ExitInternal_1.ExitInternal,
    '\\@@fun': FunctionInternal_1.FunctionInternal,
    '\\@@get': GetInternal_1.GetInternal,
    '\\@@if': IfInternal_1.IfInternal,
    '\\@@ifdef': IfDefinedInternal_1.IfDefinedInternal,
    '\\@@label': LabelInternal_1.LabelInternal,
    '\\@@let': LetInternal_1.LetInternal,
    '\\@@set': SetInternal_1.SetInternal,
    '\\@@subpage': SubpageInternal_1.SubpageInternal,
    '\\@@text': TextInternal_1.TextInternal,
    '\\@@throw': ThrowInternal_1.ThrowInternal,
};
//# sourceMappingURL=Internal.js.map