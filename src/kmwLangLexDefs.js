keyman = typeof(keyman) == 'undefined' ? {} : keyman;
keyman.language = typeof(keyman.language) == 'undefined' ? {} : keyman.language;

keyman.language.initializeLexer = keyman.language["initializeLexer"] = function() {
    var lexer = new Lexer;

    lexer.addRule(/0x[a-f\d]+/i, function (lexeme) {
        return { 
            type:"HEX", 
            text:lexeme
        };
    });

    lexer.addRule(/"[^"]*?"/i, function (lexeme) {
        return {
            type:"STRING",
            text:lexeme
        };
    })

    lexer.addRule(/'[^']*?'/i, function (lexeme) {
        return {
            type:"STRING",
            text:lexeme
        };
    })

    lexer.addRule(/[a-zA-Z_\d]+/i, function (lexeme) {
        return {
            type:"VAR",
            text:lexeme
        };
    })
    
    lexer.addRule(/\s+/i, function (lexeme) {
        // Absorb all whitespace.
        // return {
        //     type:"WHITESPACE",
        //     text:lexeme
        // };
    })

    return lexer;
}