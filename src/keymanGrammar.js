// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

// Generated from keymanLang.ne
// Command (pwd = /src/): nearleyc keymanLang.ne > keymanGrammar.js

// Defines a tokenizer for Keyman's keyboard definition language.
const lexer = moo.compile({
    comment:    /c[^\S\n]+.*?$/,
    using_keys: "using keys",
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
                        ANSI:           "ANSI",
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
                        Unicode:        "Unicode",
                        use:            "use"
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
    {"name": "SOURCEFILE", "symbols": ["free_line"], "postprocess": flatten},
    {"name": "SOURCEFILE", "symbols": ["match_statement"], "postprocess": flatten},
    {"name": "SOURCEFILE", "symbols": ["keys_group"], "postprocess": flatten},
    {"name": "SOURCEFILE", "symbols": ["context_group_statement"], "postprocess": flatten},
    {"name": "SOURCEFILE", "symbols": []},
    {"name": "free_line", "symbols": ["empty_line"], "postprocess": unwrap},
    {"name": "free_line", "symbols": ["store_decl"], "postprocess": unwrap},
    {"name": "free_line", "symbols": ["begin_statement"], "postprocess": unwrap},
    {"name": "empty_line", "symbols": ["_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": nil},
    {"name": "store_decl", "symbols": [(lexer.has("store") ? {type: "store"} : store), "ident_expr", "__", "store_def_list", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"storeDef", store:op[1], value:op[3] }; }},
    {"name": "store_def_list", "symbols": ["store_def_list", "__", "store_def_val"], "postprocess": function(op) { return flatten(filter(op)); }},
    {"name": "store_def_list", "symbols": ["store_def_val"], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "any_expr", "symbols": [(lexer.has("any") ? {type: "any"} : any), "ident_expr"], "postprocess": function(op) {return assignRole(op[1], "any");}},
    {"name": "index_expr", "symbols": [(lexer.has("index") ? {type: "index"} : index), "ident_num_expr"], "postprocess": function(op) {return assignRole(op[1], "index");}},
    {"name": "begin_statement", "symbols": [(lexer.has("begin") ? {type: "begin"} : begin), "_", "encoding", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"begin", group: op[7], encoding: op[2]};}},
    {"name": "match_statement", "symbols": [(lexer.has("match") ? {type: "match"} : match), "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"match",   group: op[5]}; }},
    {"name": "match_statement", "symbols": [(lexer.has("nomatch") ? {type: "nomatch"} : nomatch), "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"nomatch", group: op[5]}; }},
    {"name": "keys_group", "symbols": ["keys_group_statement", "keys_group_block"]},
    {"name": "keys_group_block", "symbols": ["keys_group_block", "keys_group_line"], "postprocess": flatten},
    {"name": "keys_group_block", "symbols": ["keys_group_line"], "postprocess": unwrap},
    {"name": "keys_group_line", "symbols": ["keystroke_rule"], "postprocess": unwrap},
    {"name": "keys_group_line", "symbols": ["free_line"], "postprocess": unwrap},
    {"name": "keys_group_line", "symbols": ["match_statement"], "postprocess": unwrap},
    {"name": "keys_group_statement", "symbols": [(lexer.has("group") ? {type: "group"} : group), "ident_expr", "_", (lexer.has("using_keys") ? {type: "using_keys"} : using_keys), "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"group", group: op[1], keys: true }; }},
    {"name": "context_group_statement", "symbols": [(lexer.has("group") ? {type: "group"} : group), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"group", group: op[1], keys: false }; }},
    {"name": "keystroke_rule", "symbols": ["keystroke_rule_input", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", "ruleOutput", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"rule", input: op[0], output: op[4] }; }},
    {"name": "keystroke_rule_input", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus), "_", "keystroke_rule_trigger"], "postprocess": function(op) { return { context: null, trigger: op[2] }; }},
    {"name": "keystroke_rule_trigger", "symbols": ["keystroke"], "postprocess": unwrap},
    {"name": "keystroke_rule_trigger", "symbols": ["any_expr"]},
    {"name": "ruleOutput", "symbols": ["basic_output"]},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "modifierSet", "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: op[2], key: op[4]}; }},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: null, key: op[2]}; }},
    {"name": "modifierSet", "symbols": ["modifierSet", "_", "modifier"], "postprocess": (op) => flatten(filter(op))},
    {"name": "modifierSet", "symbols": ["modifier"]},
    {"name": "modifier", "symbols": [(lexer.has("ident") ? {type: "ident"} : ident)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["deadkey"], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["index_expr"], "postprocess": unwrap},
    {"name": "deadkey", "symbols": [(lexer.has("deadkey") ? {type: "deadkey"} : deadkey), "ident_expr"], "postprocess": function(op) { return { nodeType:"deadkey", key: op[1] }; }},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("sysstore") ? {type: "sysstore"} : sysstore), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[2], "sysStore"); }},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[1], "store"); }},
    {"name": "ident_num_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return { store: op[2], index: op[6] }; }},
    {"name": "encoding", "symbols": [(lexer.has("ANSI") ? {type: "ANSI"} : ANSI)], "postprocess": unwrap},
    {"name": "encoding", "symbols": [(lexer.has("Unicode") ? {type: "Unicode"} : Unicode)], "postprocess": unwrap},
    {"name": "encoding", "symbols": [], "postprocess": function(op) { return { value:"ANSI" }; }},
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
