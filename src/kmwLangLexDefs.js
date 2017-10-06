keyman = typeof(keyman) == 'undefined' ? {} : keyman;
keyman.language = typeof(keyman.language) == 'undefined' ? {} : keyman.language;

keyman.language.initializeLexer = keyman.language["initializeLexer"] = function() {
    var lexer = new Lexer;

    var makeRule = function(regex, tokenType, text) {
        if(typeof(text) != "undefined") {
            lexer.addRule(regex, function (lexeme) {
                return { 
                    type:tokenType, 
                    text:text
                };
            });
        } else if(typeof(tokenType) != "undefined") {
            lexer.addRule(regex, function (lexeme) {
                return { 
                    type:tokenType, 
                    text:lexeme
                };
            });
        } else {
            lexer.addRule(regex, function (lexeme) {
            }); 
        }
    }

    makeRule(/any/i, "any");
    makeRule(/baselayout/i, "baselayout");
    makeRule(/beep/i, "beep");
    makeRule(/begin/i, "begin");
    makeRule(/call/i, "call");    
    makeRule(/context/i, "context");
    makeRule(/deadkey/i, "deadkey");
    makeRule(/dk/i, "deadkey", "deadkey");
    makeRule(/group/i, "group");
    makeRule(/if/i, "if");
    makeRule(/index/i, "index");
    makeRule(/layer/i, "layer");
    makeRule(/match/i, "match");
    makeRule(/nomatch/i, "nomatch");
    makeRule(/notany/i, "notany");
    makeRule(/nul/i, "nul");
    makeRule(/outs/i, "outs");
    makeRule(/platform/i, "platform");
    makeRule(/reset/i, "reset");
    makeRule(/return/i, "return");
    makeRule(/save/i, "save");
    makeRule(/set/i, "set");
    makeRule(/store/i, "store");
    makeRule(/use/i, "use");
    makeRule(/using keys/i, "using keys");
    
    makeRule(/\n/i, "\n");
    makeRule(/\+/i, "+")
    makeRule(/>/i, ">");
    makeRule(/\(/i, "(");
    makeRule(/\)/i, ")");
    makeRule(/=/i, "=");
    makeRule(/\[/i, "[");
    makeRule(/\]/i, "]");
    makeRule(/,/i, ",");

    makeRule(/0?x[a-fA-F\d]+/i, "HEX");
    makeRule(/U\+[a-fA-F\d]+/i, "UNICODE");
    makeRule(/"[^"]*?"/i, "STRING");
    makeRule(/'[^']*?'/i, "STRING");
    makeRule(/\d+/, "INTEGER");
    makeRule(/[^\S\n]+/i);
    makeRule(/c.*?\n/i); // Comment.

    makeRule(/[a-zA-Z_\d]*/i, "NAME");
    makeRule(/&[a-zA-Z_][a-zA-Z_\d]*/i, "SYSTEM_STORE");
    makeRule(/\$[a-zA-Z_][a-zA-Z_\d]*/i, "NAMED_CONST");

    return lexer;
}