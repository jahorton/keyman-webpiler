/**
 * This is a file for independently testing the tokenization scheme used by the parser.  The
 * master version of this should be within the keymanLang.ne file.
 */

keyman = typeof(keyman) == 'undefined' ? {} : keyman;
keyman.language = typeof(keyman.language) == 'undefined' ? {} : keyman.language;

keyman.language.initializeLexer = keyman.language["initializeLexer"] = function() {
    // moo - the default location of moo's main lexer object, which produces lexers.
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
        "(":        "(",
        ")":        ")",
        lbrace:     "[",
        rbrace:     "]",
        plus:       "+",
        prod:       ">",
        "=":        "=",
        ",":        ",",
        string:     [ { match: /"[^"]*?"/, value: x => x.slice(1, -1)},
                        { match: /'[^']*?'/, value: x => x.slice(1, -1)}],
        "$":        "$",
        "&":        "&"
    });

    return lexer;
}