@{%
// Generated from keymanLang.ne
// Command (pwd = /src/): nearleyc keymanLang.ne > keymanGrammar.js

// Defines a tokenizer for Keyman's keyboard definition language.
const lexer = moo.compile({
    comment:    /c[^\S\n]+.*?$/,
    whitespace: [/[^\S\n]+/, /\\\r?\n/], // The latter allows 'long line' behavior for keyboard source file lines.
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

const ruleTuple = function(arr) {

}

// Remnant of file:  the auto-generated parser.
%}

@lexer lexer

# This should always be the first rule - it defines the grammar's root symbol.
SOURCEFILE -> rule {% flatten %}

# Basic keystroke rule.
rule -> ruleInput _ %prod _ ruleOutput _ %endl {% function(op) { return { nodeType:"rule", input: op[0], output: op[4] }; } %} 

ruleInput -> %plus _ ruleTrigger {% function(op) { return { context: null, trigger: op[2] }; } %}

ruleTrigger => keystroke {% unwrap %}

ruleOutput -> basic_output

keystroke -> %lbrace _ modifierSet _ %ident _ %rbrace {% function(op) { return { modifiers: op[2], key: op[4]}; } %}
           | %lbrace _ %ident _ %rbrace {% function(op) { return { modifiers: null, key: op[2]}; } %}

modifierSet -> modifierSet _ modifier {% (op) => flatten(filter(op)) %}  # Compositing two post-processing functs requires a lambda.
             | modifier

modifier -> %ident {% unwrap %}

basic_output -> %string {% unwrap %}
              | %unicode {% unwrap %}

# whitespace 
_ -> _ %comment {% nil %}
   | %whitespace {% nil %}
   | null


