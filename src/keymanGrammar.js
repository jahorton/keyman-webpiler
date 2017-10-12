// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

// Generated from keymanLang.ne
// Command (pwd = /src/): nearleyc keymanLang.ne > keymanGrammar.js

// Defines a tokenizer for Keyman's keyboard definition language.
const lexer = moo.compile({
    comment:    /c[^\S\n]+.*?$/,
    whitespace: [ 
                    { match:/[^\S\n]+/ }, 
                    { match:/\\\r?\n/, lineBreaks:true } // This allows 'long line' behavior for keyboard source file lines.
                ], 
    unicode:    /U\+[a-fA-F\d]+/,
    hex:        /x[a-fA-F\d]+/,
    //number:     /\d+/,
    ident:      { // TODO:  Needs a better regex that allows Unicode characters! /w doesn't work!!!
                    match: /[a-zA-Z_\d]+/u, // That 'u' says "Be unicode aware." [a-zA-Z_]
                    keywords: { 
                        any:            "any",
                        baselayout:     "baselayout",
                        beep:           "beep",
                        begin:          "begin",
                        call:           "call",
                        deadkey:        ["deadkey", "dk"],
                        group:          "group",
                        if:             "if",
                        index:          "index",
                        layer:          "layer",
                        match:          "match",
                        nomatch:        "nomatch",
                        notany:         "notany",
                        nul:            "nul",
                        outs:           "outs",
                        platform:       "platform",
                        reset:          "reset",
                        return:         "return",
                        save:           "save",
                        set:            "set",
                        store:          "store",
                        use:            "use",
                        using_keys:     "using keys"
                    },
                    getType: function(x) {
                        var result = /\d+/.exec(x);
                        if(result && result[0] == x) {
                            return 'number';
                        } else {
                            return 'ident';
                        }
                    }
                },
    number:     /\d+/,
    endl:    { match: /\n/, lineBreaks: true },
    lparen:     "(",
    rparen:     ")",
    lbrace:     "[",
    rbrace:     "]",
    plus:       "+",
    prod:       ">",
    "=":        "=",
    comma:      ",",
    string:     [ { match: /"[^"]*?"/, value: x => x.slice(1, -1)},
                    { match: /'[^']*?'/, value: x => x.slice(1, -1)}],
    conststore: "$",
    sysstore:   "&"
});

// Rule post-processing functions
const filter = function(arg) {

    var i;
    for(i=0; i < arg.length; i++) {
        if(arg[i] == '') {
            arg = arg.slice(0, i).concat(arg.slice(i+1));
            i--;
        }
    }

    if(arg.length > 0) {
        return arg;
    } else {
        return '';
    }
}

const flatten = function(arg) {
    var i, arr = [];
    for(i=0; i < arg.length; i++) {
        if(Array.isArray(arg[i])) {
            arr = arr.concat(arg[i]);
        } else {
            arr.push(arg[i]);
        }
    }

    return arr;
}

const nil = function() {
    return '';
}

const unwrap = function(arr) {
    return arr[0];
}

const assignRole = function(obj, role) {
    obj.role = role;
    return obj;
}

// Remnant of file:  the auto-generated parser.
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "SOURCEFILE", "symbols": ["rule"], "postprocess": flatten},
    {"name": "SOURCEFILE", "symbols": ["store_decl"], "postprocess": flatten},
    {"name": "store_decl", "symbols": [(lexer.has("store") ? {type: "store"} : store), "ident_expr", "__", "store_def_list", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"storeDef", store:op[1], value:op[3] }; }},
    {"name": "store_def_list", "symbols": ["store_def_list", "__", "store_def_val"], "postprocess": function(op) { return flatten(filter(op)); }},
    {"name": "store_def_list", "symbols": ["store_def_val"], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "any_expr", "symbols": [(lexer.has("any") ? {type: "any"} : any), "ident_expr"], "postprocess": function(op) {return assignRole(op[1], "any");}},
    {"name": "index_expr", "symbols": [(lexer.has("index") ? {type: "index"} : index), "ident_num_expr"], "postprocess": function(op) {return assignRole(op[1], "index");}},
    {"name": "rule", "symbols": ["ruleInput", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", "ruleOutput", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"rule", input: op[0], output: op[4] }; }},
    {"name": "ruleInput", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus), "_", "ruleTrigger"], "postprocess": function(op) { return { context: null, trigger: op[2] }; }},
    {"name": "ruleTrigger", "symbols": ["keystroke"], "postprocess": unwrap},
    {"name": "ruleTrigger", "symbols": ["any_expr"]},
    {"name": "ruleOutput", "symbols": ["basic_output"]},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "modifierSet", "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: op[2], key: op[4]}; }},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: null, key: op[2]}; }},
    {"name": "modifierSet", "symbols": ["modifierSet", "_", "modifier"], "postprocess": (op) => flatten(filter(op))},
    {"name": "modifierSet", "symbols": ["modifier"]},
    {"name": "modifier", "symbols": [(lexer.has("ident") ? {type: "ident"} : ident)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["index_expr"], "postprocess": unwrap},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("sysstore") ? {type: "sysstore"} : sysstore), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[2], "sysStore"); }},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[1], "store"); }},
    {"name": "ident_num_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return { store: op[2], index: op[6] }; }},
    {"name": "_", "symbols": ["_", (lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": nil},
    {"name": "_", "symbols": ["_", (lexer.has("whitespace") ? {type: "whitespace"} : whitespace)], "postprocess": nil},
    {"name": "_", "symbols": []},
    {"name": "__", "symbols": [(lexer.has("whitespace") ? {type: "whitespace"} : whitespace), "_"], "postprocess": nil}
]
  , ParserStart: "SOURCEFILE"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
