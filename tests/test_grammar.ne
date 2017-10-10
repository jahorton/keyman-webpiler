@{%
const lexer = moo.compile({
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  word: /[a-z]+/,
  times:  /\*|x/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Use %token to match any token of that type instead of "token":
multiplication -> multiplication ws %times ws operand {% ([first, , , , second]) => [first, '*', second] %}
                | operand {% ([op]) => op %}

ws -> %ws 
    | null

operand -> %number {% ([op]) => op %}
         | %word {% ([op]) => op %}