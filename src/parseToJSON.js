class ParseProcessor {
    constructor(initialGroup) {
        this.processed = {
            stores: {}, 
            sysStores: {},
            groups: {},
            begin: initialGroup
        };

        this.warnings = [];
        this.errors = [];

        this.systemStores = [
            "baselayout", "bitmap", "capsalwaysoff", "capsononly", "copyright", "ethnologuecode", "hotkey", "includecodes",
            "keyboardversion", "kmw_embedcss", "kmw_embedjs", "kmw_helpfile", "kmw_helptext", "kmw_rtl", "language",
            "layer", "layoutfile", "message", "mnemoniclayout", "name", "oldcharposmatching", "platform", "shiftfreescaps",
            "targets", "version", "visualkeyboard", "windowslanguages"
        ];
    }

    basicErrorHeader(token) {
        return "Error at line " + token.line + ", column " + token.col + " with token " + token.text + ": ";
    }

    error(token, text) {
        if(typeof(text) == 'undefined') {
            this.errors.push(this.basicErrorHeader(token) + ".");
        } else {
            this.errors.push(this.basicErrorHeader(token) + "\n" + text);
        }
    } 

    isValidStoreIdentifier(identifier) {
        if(this.isValidSystemStore(identifier)) {
            return false;
        }

        // Add any other checks here.

        return true;
    }

    isValidSystemStore(identifier) {
        return this.systemStores.indexOf(identifier.toLowerCase()) != -1;
    }

    compileStoreValue(valueArray) {
        var str = "";
        
        for(var i = 0; i < valueArray.length; i++) {
            var token = valueArray[i];

            switch(token.type) {
                case 'unicode':
                    try {
                        str += String.fromCodePoint(parseInt("0x"+ token.value.substring(2, 6)));
                    } catch (e) {
                        this.error(token, e);
                        return;
                    }
                    break;
                case 'string':
                    str += token.value;
                    break;
                case 'ident':
                    if(typeof(this.processed.stores[token.value]) == "undefined") {
                        this.error(token, "The store '" + token.value + "' is not yet defined!");
                        return;
                    }
                    str += this.processed.stores[token.value];
                    break;
            }
        }

        return str;
    }

    processStores(storeDefs) {
        for(var i in storeDefs) {
            var def = storeDefs[i];
            var name = def.store.value.toLowerCase();

            if(!this.isValidStoreIdentifier(name)) {
                //TODO:  Need a standard error-formatting utility.
                this.error(def.store, "'" + name + "' is not a valid system store.");
                continue;
            }

            var value = this.compileStoreValue(def.value);
            if(value) {
                this.processed.stores[name] = value;
            }
        }

        // TODO:  Move the error output to the end of all processing.
        if(this.errors.length > 0) {
            console.error(this.errors);
        }
    }

    validateSystemStoreValue(store, value) {
        switch(store) {
            // TODO:  Fill this in.
            default:
                return true;
        }
    }

    processSystemStores(storeDefs) {
        for(var i in storeDefs) {
            var def = storeDefs[i];
            var name = def.store.value.toLowerCase();

            if(!this.isValidSystemStore(name)) {
                //TODO:  Need a standard error-formatting utility.
                this.error(def.store, "'" + name + "' is an invalid name for a standard store.");
                continue;
            }

            var value = def.value.value;
            if(value && this.validateSystemStoreValue(name, value)) {
                this.processed.sysStores[name] = value;
            }
        }

        // TODO:  Move the error output to the end of all processing.
        if(this.errors.length > 0) {
            console.error(this.errors);
        }
    }
}

