@{%
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
%}

@lexer lexer

# This should always be the first rule - it defines the grammar's root symbol.
SOURCEFILE -> keystroke_rule {% flatten %}
            | store_decl {% flatten %}
            | match_statement {% flatten %}
            | begin_statement {% flatten %}
            | null

empty_line -> _ %endl {% nil %}

# Store declarations.
store_decl -> %store ident_expr __ store_def_list _ %endl {% function(op) { return { nodeType:"storeDef", store:op[1], value:op[3] }; } %}

store_def_list -> store_def_list __ store_def_val {% function(op) { return flatten(filter(op)); } %}
                | store_def_val {% unwrap %}

store_def_val -> %string {% unwrap %}
               | %unicode {% unwrap %}

# Other expressions using stores.

any_expr -> %any ident_expr {% function(op) {return assignRole(op[1], "any");} %} 

index_expr -> %index ident_num_expr {% function(op) {return assignRole(op[1], "index");} %} 

# begin statement

begin_statement -> %begin _ encoding _ %prod _ %use ident_expr %endl {% function(op) { return {nodeType:"begin", group: op[7], encoding: op[2]};} %}

# match/nomatch

match_statement -> %match   _ %prod _ %use ident_expr _ %endl {% function(op) { return { nodeType:"match",   group: op[5]}; } %}
                 | %nomatch _ %prod _ %use ident_expr _ %endl {% function(op) { return { nodeType:"nomatch", group: op[5]}; } %}

# Basic keystroke rule.
keystroke_rule -> keystroke_rule_input _ %prod _ ruleOutput _ %endl {% function(op) { return { nodeType:"rule", input: op[0], output: op[4] }; } %} 

keystroke_rule_input -> %plus _ keystroke_rule_trigger {% function(op) { return { context: null, trigger: op[2] }; } %}

keystroke_rule_trigger -> keystroke {% unwrap %}
                        | any_expr

ruleOutput -> basic_output

keystroke -> %lbrace _ modifierSet _ %ident _ %rbrace {% function(op) { return { modifiers: op[2], key: op[4]}; } %}
           | %lbrace _ %ident _ %rbrace {% function(op) { return { modifiers: null, key: op[2]}; } %}

modifierSet -> modifierSet _ modifier {% (op) => flatten(filter(op)) %}  # Compositing two post-processing functs requires a lambda.
             | modifier

modifier -> %ident {% unwrap %}

basic_output -> %string {% unwrap %}
              | %unicode {% unwrap %}
              | index_expr {% unwrap %}

ident_expr -> %lparen %sysstore %ident %rparen {% function(op) { return assignRole(op[2], "sysStore"); } %}
            | %lparen %ident %rparen {% function(op) { return assignRole(op[1], "store"); } %}

ident_num_expr -> %lparen _ %ident _ %comma _ %number _ %rparen {% function(op) { return { store: op[2], index: op[6] }; } %}

encoding -> %ANSI {% unwrap %}
          | %Unicode {% unwrap %}
          | null {% function(op) { return { value:"ANSI" }; }%}

# whitespace 
_ -> _ %comment {% nil %}
   | _ %whitespace {% nil %}
   | null

## required whitespace
__ -> %whitespace _ {% nil %}


