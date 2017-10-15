@{%
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
#TESTBLOCK  -> keystroke_rule {% flatten %}
#            | free_line {% flatten %}
#            | free_section {% flatten %}
#            | match_statement {% flatten %}
#            | keys_group_statement {% flatten %}
#            | keys_group {% flatten %}
#            | context_group_statement {% flatten %}
#            | context_group {% flatten %}
#            | context_rule {% flatten %}
#            | null

# This should always be the first rule - it defines the grammar's root symbol.
SOURCEFILE -> free_section file_section {% (op) => flatten(filter(op)) %}

file_section -> file_section keys_group {% (op) => flatten(filter(op)) %}
              | file_section context_group {% (op) => flatten(filter(op)) %}
              | null

free_section -> free_section free_line {% flatten %}
              | null

# "Free line" - a line that disregards 'group' scope and may exist outside of groups.
free_line -> empty_line {% unwrap %}
           | store_decl {% unwrap %}
           | begin_statement {% unwrap %}

empty_line -> _ %endl {% nil %}

# Store declarations.
store_decl -> %store ident_expr __ store_def_list _ %endl {% function(op) { return { nodeType:"storeDef", store:op[1], value:op[3] }; } %}

store_def_list -> store_def_list __ store_def_val {% function(op) { return flatten(filter(op)); } %}
                | store_def_val {% unwrap %}

store_def_val -> %string {% unwrap %}
               | %unicode {% unwrap %}

# Other expressions using stores.

any_expr -> %any ident_expr {% function(op) {return assignRole(op[1], "any");} %}

notany_expr -> %notany ident_expr  {% function(op) {return assignRole(op[1], "notany");} %}

index_expr -> %index ident_num_expr {% function(op) {return assignRole(op[1], "index");} %} 

outs_expr -> %outs ident_expr {% function(op) {return assignRole(op[1], "outs");} %}
           | outs_char_expr {% unwrap %}

outs_char_expr -> %conststore %ident {% function(op) {return assignRole(op[1], "outs");} %}  # TODO:  Filter based on store size!

# begin statement

begin_statement -> %begin _ encoding _ %prod _ %use ident_expr %endl {% function(op) { return {nodeType:"begin", group: op[7], encoding: op[2]};} %}

# match/nomatch

match_statement -> %match   _ %prod _ %use ident_expr _ %endl {% function(op) { return { nodeType:"match",   group: op[5]}; } %}
                 | %nomatch _ %prod _ %use ident_expr _ %endl {% function(op) { return { nodeType:"nomatch", group: op[5]}; } %}

# Group blocks

   keys_group -> keys_group_statement    keys_group_block
context_group -> context_group_statement context_group_block

   keys_group_block -> keys_group_block    keys_group_line    {% flatten %}
                     | keys_group_line    {% unwrap %}

context_group_block -> context_group_block context_group_line {% flatten %}
                     | context_group_line {% unwrap %}

   keys_group_line -> keystroke_rule {% unwrap %}
                    | free_line {% unwrap %}
                    | match_statement {% unwrap %}

context_group_line -> context_rule {% unwrap %}
                    | free_line {% unwrap %}
                    | match_statement {% unwrap %}

   keys_group_statement -> %group ident_expr _ %using_keys _ %endl {% function(op) { return {nodeType:"group", group: op[1], keys: true }; } %}
context_group_statement -> %group ident_expr _ %endl {% function(op) { return {nodeType:"group", group: op[1], keys: false }; } %}


# Basic keystroke rule.
keystroke_rule -> %plus _ keystroke_rule_head_trigger _ %prod _ ruleOutput _ %endl {% function(op) { return { nodeType:"rule", input: { context: null, trigger: op[2] }, output: op[6] }; } %} 
                | context_rule_input _ %plus _ keystroke_rule_trigger _ %prod _ ruleOutput _ %endl {% function(op) { return { nodeType:"rule", input: { context: op[0], trigger: op[4] }, output: op[8] }; } %} 

keystroke_rule_head_trigger -> keystroke {% unwrap %}
                             | trigger_head_expr {% unwrap %}

keystroke_rule_trigger -> keystroke {% unwrap %}
                        | trigger_expr {% unwrap %}

# Basic context rules
context_rule -> context_rule_input _ %prod _ ruleOutput _ %endl {% function(op) { return { nodeType:"rule", input: op[0], output: op[4] }; } %}

context_rule_input -> char_val_head_expr _ context_rule_input_tail {% (op) => flatten(filter(op)) %}
                    | char_val_head_expr {% unwrap %}

context_rule_input_tail -> context_rule_input_tail _ char_val_expr {% (op) => flatten(filter(op)) %}
                         | context_rule_input_tail _ string_val_expr {% (op) => flatten(filter(op)) %}
                         | char_val_expr {% unwrap %}
                         | string_val_expr {% unwrap %}

# Optional input context:  (wrapper term to produce either the overall context term or a null)

ruleOutput -> basic_output

keystroke -> %lbrace _ modifierSet _ %ident _ %rbrace {% function(op) { return { modifiers: op[2], key: op[4]}; } %}
           | %lbrace _ %ident _ %rbrace {% function(op) { return { modifiers: null, key: op[2]}; } %}

modifierSet -> modifierSet _ modifier {% (op) => flatten(filter(op)) %}  # Compositing two post-processing functs requires a lambda.
             | modifier

modifier -> %ident {% unwrap %}

basic_output -> %string {% unwrap %}
              | %unicode {% unwrap %}
              | deadkey_expr {% unwrap %}
              | index_expr {% unwrap %}
              | context_expr {% unwrap %}

# A context output statement.

context_expr -> %context ident_expr {% function(op) { return { nodeType:"context", key: op[1] }; } %}

# char_val_expr - expressions that may resolve to a single character and can appear in many spots.

char_val_expr -> char_val_head_expr {% unwrap %}
               | index_expr {% unwrap %}

# These are the char-valued symbols that may be output in the initial context slot.
char_val_head_expr -> deadkey_expr {% unwrap %}
                    | trigger_head_expr {% unwrap %}

trigger_expr -> trigger_head_expr {% unwrap %}
              | index_expr {% unwrap %}

trigger_head_expr -> any_expr {% unwrap %}
                   | char_string {% unwrap %}
                   | outs_char_expr {% unwrap %}

string_val_expr -> %string {% unwrap %}
                 | outs_expr {% unwrap %}

deadkey_expr -> %deadkey ident_expr {% function(op) { return { nodeType:"deadkey", key: op[1] }; } %}

ident_expr -> %lparen %sysstore %ident %rparen {% function(op) { return assignRole(op[2], "sysStore"); } %}
            | %lparen %ident %rparen {% function(op) { return assignRole(op[1], "store"); } %}

ident_num_expr -> %lparen _ %ident _ %comma _ %number _ %rparen {% function(op) { return { store: op[2], index: op[6] }; } %}

encoding -> %ANSI {% unwrap %}
          | %Unicode {% unwrap %}
          | null {% function(op) { return { value:"ANSI" }; }%}

char_string -> %string {% unwrap /* TODO:  Throw errors if a string doesn't resolve to a single char. */ %}

# whitespace 
_ -> _ %comment {% nil %}
   | _ %whitespace {% nil %}
   | null

# required whitespace
__ -> %whitespace _ {% nil %}