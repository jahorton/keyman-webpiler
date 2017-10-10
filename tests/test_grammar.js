// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

const lexer = moo.compile({
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  word: /[a-z]+/,
  times:  /\*|x/
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "multiplication", "symbols": ["multiplication", "ws", (lexer.has("times") ? {type: "times"} : times), "ws", "operand"], "postprocess": ([first, , , , second]) => [first, '*', second]},
    {"name": "multiplication", "symbols": ["operand"], "postprocess": ([op]) => op},
    {"name": "ws", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "ws", "symbols": []},
    {"name": "operand", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": ([op]) => op},
    {"name": "operand", "symbols": [(lexer.has("word") ? {type: "word"} : word)], "postprocess": ([op]) => op}
]
  , ParserStart: "multiplication"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
