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
                        context:        "context",
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
                    },
                    value: function(x) {
                        var result = /\d+/.exec(x);
                        if(result && result[0] == x) {
                            return parseInt(x);
                        } else {
                            return x;
                        }
                    }
                },
    number:     { match: /\d+/, value: x => parseInt(x) },  // Redundant, but necessary to prevent 'moo' errors.
    endl:       { match: /\n/, lineBreaks: true },
    lparen:     "(",
    rparen:     ")",
    lbrace:     "[",
    rbrace:     "]",
    plus:       "+",
    prod:       ">",
    "=":        "=",
    comma:      ",",
    string:     [ 
                    { match: /"[^"]*?"/, value: x => x.slice(1, -1)},
                    { match: /'[^']*?'/, value: x => x.slice(1, -1)}
                ],
    conststore: "$",
    sysstore:   "&"
});

// Rule post-processing functions
const filter = function(arg) {

    var i;
    for(i=0; i < arg.length; i++) {
        if(arg[i] == '' || arg[i] == null) {
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

// Definition of our output parse structure.
class ParseInfo {
    constructor() {
        this.stores = [];
        this.groups = {};
        this.systemStores = [];
        this.activeGroup = "";
    }

    /* Analyzes each store rule's resulting object to determine whether or not it corresponds to a system store.
     */
    addStore(store) {
        if(store.store.role == "sysStore") {
            this.systemStores.push(store);
        } else {
            this.stores.push(store);
        }
    }

    /* Despite the fact that each rule actually resolves fully before any group is complete, the 'earley' algorithm triggers
     * group pre-processing first, since those rules appear viable to complete before a single rule is seen.  The corresponding
     * group object for the rule will thus exist at this time.
     */
    addRule(rule) {
        this.groups[this.activeGroup].rules.push(rule);
    }

    /* Interestingly, this function is called upon each potential completion of a group's rule, regardless of if it should 
     * be extended due to rule recursion/extension.  Must be part of how the underlying 'earley' algorithm works.
     * 
     * At any rate, the group settings are received before any of the group's rules; thus, we ensure the group object is
     * preserved so that it may accumulate rules.
     */
    createGroup(group) {
        this.activeGroup = group.group.value;
        this.groups[this.activeGroup] = this.groups[this.activeGroup] || {settings: group, rules: []};
    }

    /* Tracks the begin statement and assures that it is unique within a keyboard's source.
     */
    addBegin(begin) {
        if(typeof(this.begin) == 'undefined') {
            this.begin = begin;
        } else {
            throw "Error - a keyboard's source code may only include a single begin statement.";
        }
    }
}

var postProc = null;

// Remnant of file:  the auto-generated parser.
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "SOURCEFILE", "symbols": ["init", "free_section", "file_section"], "postprocess": function(op) { return postProc; }},
    {"name": "init", "symbols": [], "postprocess": function(op) { postProc = new ParseInfo(); }},
    {"name": "file_section", "symbols": ["file_section", "keys_group"], "postprocess": function(op) { postProc.createGroup(op[1]); }},
    {"name": "file_section", "symbols": ["file_section", "context_group"], "postprocess": function(op) { postProc.createGroup(op[1]); }},
    {"name": "file_section", "symbols": []},
    {"name": "free_section", "symbols": ["free_section", "free_line"], "postprocess": flatten},
    {"name": "free_section", "symbols": []},
    {"name": "free_line", "symbols": ["empty_line"], "postprocess": unwrap},
    {"name": "free_line", "symbols": ["store_decl"], "postprocess": unwrap},
    {"name": "free_line", "symbols": ["begin_statement"], "postprocess": function(op) { postProc.addBegin(op[0]); }},
    {"name": "empty_line", "symbols": ["_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": nil},
    {"name": "store_decl", "symbols": [(lexer.has("store") ? {type: "store"} : store), "ident_expr", "__", "store_def_list", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { postProc.addStore({ nodeType:"storeDef", store:op[1], value:op[3] }); return null; }},
    {"name": "store_def_list", "symbols": ["store_def_list", "__", "store_def_val"], "postprocess": function(op) { return flatten(filter(op)); }},
    {"name": "store_def_list", "symbols": ["store_def_val"], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "store_def_val", "symbols": ["outs_expr"], "postprocess": unwrap},
    {"name": "any_expr", "symbols": [(lexer.has("any") ? {type: "any"} : any), "ident_expr"], "postprocess": function(op) {return assignRole(op[1], "any");}},
    {"name": "notany_expr", "symbols": [(lexer.has("notany") ? {type: "notany"} : notany), "ident_expr"], "postprocess": function(op) {return assignRole(op[1], "notany");}},
    {"name": "index_expr", "symbols": [(lexer.has("index") ? {type: "index"} : index), "ident_num_expr"], "postprocess": function(op) {return assignRole(op[1], "index");}},
    {"name": "outs_expr", "symbols": [(lexer.has("outs") ? {type: "outs"} : outs), "ident_expr"], "postprocess": function(op) {return assignRole(op[1], "outs");}},
    {"name": "outs_expr", "symbols": ["outs_char_expr"], "postprocess": unwrap},
    {"name": "outs_char_expr", "symbols": [(lexer.has("conststore") ? {type: "conststore"} : conststore), (lexer.has("ident") ? {type: "ident"} : ident)], "postprocess": function(op) {return assignRole(op[1], "outs");}},
    {"name": "begin_statement", "symbols": [(lexer.has("begin") ? {type: "begin"} : begin), "_", "encoding", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"begin", group: op[7], encoding: op[2]};}},
    {"name": "match_statement", "symbols": [(lexer.has("match") ? {type: "match"} : match), "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"match",   group: op[5]}; }},
    {"name": "match_statement", "symbols": [(lexer.has("nomatch") ? {type: "nomatch"} : nomatch), "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", (lexer.has("use") ? {type: "use"} : use), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"nomatch", group: op[5]}; }},
    {"name": "keys_group", "symbols": ["keys_group_statement", "keys_group_block"], "postprocess": (op) => op[0]},
    {"name": "context_group", "symbols": ["context_group_statement", "context_group_block"], "postprocess": (op) => op[0]},
    {"name": "keys_group_block$ebnf$1", "symbols": ["keys_group_line"]},
    {"name": "keys_group_block$ebnf$1", "symbols": ["keys_group_block$ebnf$1", "keys_group_line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "keys_group_block", "symbols": ["keys_group_block$ebnf$1"], "postprocess": flatten},
    {"name": "context_group_block$ebnf$1", "symbols": ["context_group_line"]},
    {"name": "context_group_block$ebnf$1", "symbols": ["context_group_block$ebnf$1", "context_group_line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "context_group_block", "symbols": ["context_group_block$ebnf$1"], "postprocess": flatten},
    {"name": "keys_group_line", "symbols": ["keystroke_rule"], "postprocess": function(op) { postProc.addRule(op[0]); }},
    {"name": "keys_group_line", "symbols": ["free_line"], "postprocess": unwrap},
    {"name": "keys_group_line", "symbols": ["match_statement"], "postprocess": function(op) { postProc.addRule(op[0]); }},
    {"name": "context_group_line", "symbols": ["context_rule"], "postprocess": function(op) { postProc.addRule(op[0]); }},
    {"name": "context_group_line", "symbols": ["free_line"], "postprocess": unwrap},
    {"name": "context_group_line", "symbols": ["match_statement"], "postprocess": function(op) { postProc.addRule(op[0]); }},
    {"name": "keys_group_statement", "symbols": [(lexer.has("group") ? {type: "group"} : group), "ident_expr", "_", (lexer.has("using_keys") ? {type: "using_keys"} : using_keys), "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"group", group: op[1], keys: true }; }},
    {"name": "context_group_statement", "symbols": [(lexer.has("group") ? {type: "group"} : group), "ident_expr", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return {nodeType:"group", group: op[1], keys: false }; }},
    {"name": "keystroke_rule", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus), "_", "keystroke_rule_head_trigger", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", "ruleOutput", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"rule", input: { context: null, trigger: op[2] }, output: op[6] }; }},
    {"name": "keystroke_rule", "symbols": ["context_rule_input", "_", (lexer.has("plus") ? {type: "plus"} : plus), "_", "keystroke_rule_trigger", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", "ruleOutput", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"rule", input: { context: op[0], trigger: op[4] }, output: op[8] }; }},
    {"name": "keystroke_rule_head_trigger", "symbols": ["keystroke"], "postprocess": unwrap},
    {"name": "keystroke_rule_head_trigger", "symbols": ["trigger_head_expr"], "postprocess": unwrap},
    {"name": "keystroke_rule_trigger", "symbols": ["keystroke"], "postprocess": unwrap},
    {"name": "keystroke_rule_trigger", "symbols": ["trigger_expr"], "postprocess": unwrap},
    {"name": "context_rule", "symbols": ["context_rule_input", "_", (lexer.has("prod") ? {type: "prod"} : prod), "_", "ruleOutput", "_", (lexer.has("endl") ? {type: "endl"} : endl)], "postprocess": function(op) { return { nodeType:"rule", input: { context: op[0], trigger: null}, output: op[4] }; }},
    {"name": "context_rule_input", "symbols": ["char_val_head_expr", "_", "context_rule_input_tail"], "postprocess": (op) => flatten(filter(op))},
    {"name": "context_rule_input", "symbols": ["char_val_head_expr"], "postprocess": unwrap},
    {"name": "context_rule_input_tail", "symbols": ["context_rule_input_tail", "_", "char_val_expr"], "postprocess": (op) => flatten(filter(op))},
    {"name": "context_rule_input_tail", "symbols": ["context_rule_input_tail", "_", "string_val_expr"], "postprocess": (op) => flatten(filter(op))},
    {"name": "context_rule_input_tail", "symbols": ["char_val_expr"], "postprocess": unwrap},
    {"name": "context_rule_input_tail", "symbols": ["string_val_expr"], "postprocess": unwrap},
    {"name": "ruleOutput", "symbols": ["basic_output"]},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "modifierSet", "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: op[2], key: op[4]}; }},
    {"name": "keystroke", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": function(op) { return { modifiers: null, key: op[2]}; }},
    {"name": "modifierSet", "symbols": ["modifierSet", "_", "modifier"], "postprocess": (op) => flatten(filter(op))},
    {"name": "modifierSet", "symbols": ["modifier"]},
    {"name": "modifier", "symbols": [(lexer.has("ident") ? {type: "ident"} : ident)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["string_val_expr"], "postprocess": unwrap},
    {"name": "basic_output", "symbols": [(lexer.has("unicode") ? {type: "unicode"} : unicode)], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["deadkey_expr"], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["index_expr"], "postprocess": unwrap},
    {"name": "basic_output", "symbols": ["context_expr"], "postprocess": unwrap},
    {"name": "context_expr", "symbols": [(lexer.has("context") ? {type: "context"} : context), "num_expr"], "postprocess": function(op) { return assignRole(op[1], "context"); }},
    {"name": "char_val_expr", "symbols": ["char_val_head_expr"], "postprocess": unwrap},
    {"name": "char_val_expr", "symbols": ["index_expr"], "postprocess": unwrap},
    {"name": "char_val_head_expr", "symbols": ["deadkey_expr"], "postprocess": unwrap},
    {"name": "char_val_head_expr", "symbols": ["trigger_head_expr"], "postprocess": unwrap},
    {"name": "trigger_expr", "symbols": ["trigger_head_expr"], "postprocess": unwrap},
    {"name": "trigger_expr", "symbols": ["index_expr"], "postprocess": unwrap},
    {"name": "trigger_head_expr", "symbols": ["any_expr"], "postprocess": unwrap},
    {"name": "trigger_head_expr", "symbols": ["char_string"], "postprocess": unwrap},
    {"name": "trigger_head_expr", "symbols": ["outs_char_expr"], "postprocess": unwrap},
    {"name": "string_val_expr", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap},
    {"name": "string_val_expr", "symbols": ["outs_expr"], "postprocess": unwrap},
    {"name": "string_val_expr", "symbols": ["outs_char_expr"], "postprocess": unwrap},
    {"name": "deadkey_expr", "symbols": [(lexer.has("deadkey") ? {type: "deadkey"} : deadkey), "ident_expr"], "postprocess": function(op) { op[1].role = "deadkey"; return op[1]; }},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("sysstore") ? {type: "sysstore"} : sysstore), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[2], "sysStore"); }},
    {"name": "ident_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("ident") ? {type: "ident"} : ident), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return assignRole(op[1], "store"); }},
    {"name": "ident_num_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("ident") ? {type: "ident"} : ident), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return { store: op[2], index: op[6] }; }},
    {"name": "num_expr", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), (lexer.has("number") ? {type: "number"} : number), (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function(op) { return op[1]; }},
    {"name": "encoding", "symbols": [(lexer.has("ANSI") ? {type: "ANSI"} : ANSI)], "postprocess": unwrap},
    {"name": "encoding", "symbols": [(lexer.has("Unicode") ? {type: "Unicode"} : Unicode)], "postprocess": unwrap},
    {"name": "encoding", "symbols": [], "postprocess": function(op) { return { value:"ANSI" }; }},
    {"name": "char_string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": unwrap /* TODO:  Throw errors if a string doesn't resolve to a single char. */},
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
