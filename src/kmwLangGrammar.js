keyman = typeof(keyman) == 'undefined' ? {} : keyman;
keyman.language = typeof(keyman.language) == 'undefined' ? {} : keyman.language;

keyman.language.Terminal = function(id) {
    this.objType = "Terminal";
    this.id = id;
}

keyman.language.Terminal.prototype.matches = function(lexerToken) {
    if(this.id == lexerToken.type) {
        return lexerToken;
    } else {
        return null;
    }
}

keyman.language.Terminal.prototype.toString = function() {
    return this.id;
}

keyman.language.Terminal.prototype.clone = function () {
    var newInst = new keyman.language.Terminal(this.id);
    newInst.objType = this.objType;

    return newInst;
}

keyman.language.Nonterminal = function(id) {
    /**
     * The field 'tuples' holds a collection of valid tuples, each of which is a sequence of grammar tokens that must be matched
     * to be valid.
     */
    this.objType = "Nonterminal";
    this.id = id;
}

keyman.language.Nonterminal.prototype.addTuple = function(tuple) {
    var i;

    if(typeof(this.tuples) == 'undefined') {
        this.tuples = [];
    }

    if(Array.isArray(tuple)) {
        for(i=0; i < tuple.length; i++) {
            if(typeof(tuple) != "object") {
                return false;
            }
        }

        this.tuples.push(tuple);
        return true;
    } else {
        return false;
    }
}

// keyman.language.Nonterminal.prototype.referenceClone = function() {
//     var i, j;
    
//     var newInst = new keyman.language.Nonterminal(this.id);
//     newInst.objType = this.objType;
// }

keyman.language.Nonterminal.prototype.clone = function() {
    var i, j;

    var newInst = new keyman.language.Nonterminal(this.id);
    newInst.objType = this.objType;

    newInst.tuples = [];
    for(i=0; i < this.tuples.length; i++) {
        newInst.tuples.push(this.tuples[i]);

        // for(j=0; j < this.tuples[i].length; j++) {
        //     newInst.tuples[i].push(this.tuples[i][j]);
        // }
    }
}

keyman.language.Nonterminal.prototype.matches = function() {
    
}

keyman.language.Grammar = function() {
    this.terminals = {};
    this.nonterminals = {};
}