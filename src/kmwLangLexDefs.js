keyman = typeof(keyman) == 'undefined' ? {} : keyman;
keyman.language = typeof(keyman.language) == 'undefined' ? {} : keyman.language;

keyman.language.initializeLexer = keyman.language["initializeLexer"] = function() {
    // moo - the default location of moo's main lexer object, which produces lexers.
    var lexer = moo.compile({
        comment:    /c[^\S\n]+.*?$/,
        whitespace: /[^\S\n]+/,
        unicode:    /U\+[a-fA-F\d]+/,
        hex:        /x[a-fA-F\d]+/,
        //number:     /\d+/,
        ident:      { // TODO:  Needs a better regex that allows Unicode characters! /w doesn't work!!!
                        match: /[a-zA-Z_\d]+/u, // That 'u' says "Be unicode aware." [a-zA-Z_]
                        keywords: { 
                            keyword:
                            ["any", "baselayout", "beep", "begin", "call", "deadkey", "dk", "group", "if", "index", "layer",
                            "match", "nomatch", "notany", "nul", "outs", "platform", "reset", "return", "save", "set", "store",
                            "use", "using keys"]
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
        newline:    { match: /\n/, lineBreaks: true },
        "(":        "(",
        ")":        ")",
        "[":        "[",
        "]":        "]",
        "+":        '+',
        ">":        ">",
        "=":        "=",
        ",":        ",",
        string:     [ { match: /"[^"]*?"/, value: x => x.slice(1, -1)},
                      { match: /'[^']*?'/, value: x => x.slice(1, -1)}],
        "$":        "$",
        "&":        "&"
    });

    return lexer;
}