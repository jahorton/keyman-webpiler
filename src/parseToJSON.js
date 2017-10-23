class ParseProcessor {
    constructor() {
        // Represents the final intermediate parse.
        this.processed = {
            stores: {}, 
            sysStores: {},
            groups: {},
            deadkeys: []
        };

        // Accumulates warnings and errors as they are detected for output at the end of processing.
        this.warnings = [];
        this.errors = [];

        // Contains all valid system store names, to assist system store detection.
        this.systemStores = [
            "baselayout", "bitmap", "capsalwaysoff", "capsononly", "copyright", "ethnologuecode", "hotkey", "includecodes",
            "keyboardversion", "kmw_embedcss", "kmw_embedjs", "kmw_helpfile", "kmw_helptext", "kmw_rtl", "language",
            "layer", "layoutfile", "message", "mnemoniclayout", "name", "oldcharposmatching", "platform", "shiftfreescaps",
            "targets", "version", "visualkeyboard", "windowslanguages"
        ];

        // Define Keyman Developer modifier bit-flags
        this.modifierFlags = {
            "LCTRL":0x0001,
            "RCTRL":0x0002,
            "LALT":0x0004,
            "RALT":0x0008,
            "SHIFT":0x0010,
            "CTRL":0x0020,
            "ALT":0x0040,
            "VIRTUAL_KEY":0x4000
        };

        this.stateFlags = {
            "CAPS":0x0100,
            "NO_CAPS":0x0200,
            "NUM_LOCK":0x0400,
            "NO_NUM_LOCK":0x0800,
            "SCROLL_LOCK":0x1000,
            "NO_SCROLL_LOCK":0x2000,
        };

        // Contains tracking data for various parsed components necessary to determine validity.
        // Ex:  out(store) and set(store) cannot use the same store.
        this.constraintChecks = {
            stores: {},
            rules: []
        };
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
    
    isStore(name) {
        return typeof(this.processed.stores[name]) != "undefined";
    }

    isSysStore(name) {
        return typeof(this.processed.sysStores[name]) != "undefined";
    }

    isGroup(name) {
        return typeof(this.processed.groups[name]) != "undefined";
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
                this.constraintChecks.stores[name] = [];
            }
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

    }

    processGroups(groupDefs) {
        for(var group in groupDefs) {
            var rules = [];
            var usingKeys = groupDefs[group].settings.keys;
            var ruleDefs = groupDefs[group].rules;
            var match = null;
            var nomatch = null;

            for(var i=0; i < ruleDefs.length; i++) {
                var rule = this.processRule(ruleDefs[i]);
                
                if(ruleDefs[i].nodeType == "rule") {
                    rules.push(rule);
                } else if (ruleDefs[i].nodeType == "match") {
                    if(match) {
                        this.error(ruleDefs[i].group, "Each group may only have one match rule.");
                    } else {
                        match = rule;
                    }
                } else if (ruleDefs[i].nodeType == "nomatch" ) {
                    if(nomatch) {
                        this.error(ruleDefs[i].group, "Each group may only have one nomatch rule.");
                    } else {
                        nomatch = rule;
                    }                   
                }
            }

            // TODO:  Properly sort the rules!

            this.processed.groups[group] = { rules: rules, using_keys: usingKeys };
            if(match) {
                this.processed.groups[group].match = match;
            }
            if(nomatch) {
                this.processed.groups[group].nomatch = nomatch;
            }
        }

        //console.log(this.processed.groups);
    }

    processElement(elementParse, contextSize) {
        var name, index;

        switch(elementParse.role) {
            case "deadkey":
                name = elementParse.value;

                if(this.isStore(name) || this.isSysStore(name)) {
                    this.error(elementParse, "Deadkeys may not share names with stores!");
                    return;
                } else {
                    if(this.processed.deadkeys.indexOf(name) == -1) {
                        this.processed.deadkeys.push(name);
                    }
                    return { op:elementParse.role, name:name };
                }
                break;
            case "any":
                name = elementParse.value;

                if(!this.isStore(name)) {
                    this.error(elementParse, "Use of the 'any' statement requires a valid store!");
                    return;
                } else {
                    return { op:elementParse.role, name:name };
                }
                break;
            case "index":
                name = elementParse.store.value;

                if(!this.isStore(name)) {
                    this.error(elementParse.store, "Use of the 'index' statement requires a valid store!");
                    return;
                } else {
                    return { op:elementParse.role, name:name, index:elementParse.index.value };
                }
                break;
            case "context":
                index = elementParse.value;

                if(index > contextSize) {
                    this.error(elementParse, "Context matching the specified index does not exist.");
                    return;
                } else {
                    return { op:elementParse.role, index:elementParse.value };
                }
        }

        return elementParse;
    }

    processRuleContext(contextDef) {
        var context = [];
        for(var i = 0; i < contextDef.length; i++) {
            var element = contextDef[i];
            if(element.type == "string") {
                context.push(element.value); // Should probably decompose the strings to simplify later calculations!
            } else {
                var analyzed = this.processElement(element, context.length);
                context.push(analyzed); // If it's an 'outs' statement, we'll need to calc the offset here as well!
            }
        }

        return context;
    }

    processRuleOutput(outputDef, contextLength) {
        var output = [];
        for(var i = 0; i < outputDef.length; i++) {
            var element = outputDef[i];
            if(element.type == "string") {
                output.push(element.value); // Should probably decompose the strings to simplify later calculations!
            } else {
                var analyzed = this.processElement(element, contextLength);
                output.push(analyzed);
            }
        }

        return output;
    }

    processTrigger(triggerDef) {
        var i, key, modifiers=0, states=0;
        var retObj;
        if(triggerDef.key) {
            // It's triggered by a keystroke!
            modifiers |= this.modifierFlags.VIRTUAL_KEY;

            if(triggerDef.modifiers) {
                for(i=0; i < triggerDef.modifiers.length; i++) {
                    var match = false;
                    if(this.modifierFlags[triggerDef.modifiers[i].value]) {
                        modifiers |= this.modifierFlags[triggerDef.modifiers[i].value];
                        match = true;
                    } else if(this.stateFlags[triggerDef.modifiers[i].value]) {
                        states |= this.stateFlags[triggerDef.modifiers[i].value];
                        match = true;
                    }

                    if(!match) {
                        this.error(triggerDef.modifiers[i], "Unrecognized modifier or state flag specified!");
                    }
                }
            }

            retObj = { name: triggerDef.key.value };

            if(modifiers != 0) {
                retObj.modifiers = modifiers;
            }

            if(states != 0) {
                retObj.states = states;
            }

            return retObj;
        } else {
            return triggerDef;
        }
    }

    processRule(ruleDef) { 
        var contextLength = 0;

        switch(ruleDef.nodeType) {
            case 'rule':
                var rule = {};
                if(ruleDef.input.context) {
                    rule.context = this.processRuleContext(ruleDef.input.context);
                    contextLength = rule.context.length; // TODO:  Is this the design we're going with?
                }
                if(ruleDef.input.trigger) {
                    rule.trigger = this.processTrigger(ruleDef.input.trigger);
                }
                rule.output = this.processRuleOutput(ruleDef.output, contextLength);

                return rule;
                break;
            case 'match':
            case 'nomatch':
                return { name:ruleDef.group.value, errorToken: ruleDef.group };
                break;
        }

        // TODO:  Actually implement.

        return ruleDef;
    }

    processBegin(beginDef) {
        this.processed.begin = beginDef.group.value;
        this.processed.encoding = beginDef.encoding.value;
        
        if(this.processed.encoding != "Unicode") {
            this.error(beginDef.encoding, "The web-based Keyman language compiler only accepts Unicode encodings.");
        }
    }

    /**
     * The main processing method.
     * @param {*} parseInfo The parse tree output by our nearley grammar's parser.
     */
    process(parseInfo) {
        this.processBegin(parseInfo.begin);
        this.processSystemStores(parseInfo.systemStores);
        this.processStores(parseInfo.stores);
        this.processGroups(parseInfo.groups);

        // TODO:  Verify all match rules here, as well as the begin statement's group.
        
        for(var name in this.processed.groups) {
            var group = this.processed.groups[name];

            if(group.match) {
                if(!this.isGroup(group.match.name)) {
                    this.error(group.match.errorToken, "The group '" + group.match.name + "' specified by this match statement does not exist!");
                } 
                
                group.match = group.match.name;
            }

            if(group.nomatch) {
                if(!this.isGroup(group.nomatch.name)) {
                    this.error(group.nomatch.errorToken, "The group '" + group.nomatch.name + "' specified by this nomatch statement does not exist!");
                } 
                
                group.nomatch = group.nomatch.name;
            }
        }


        if(this.errors.length > 0) {
            console.error(this.errors);
            if(this.warnings.length > 0) {
                console.warn(this.warnings);
            }
            return;
        } else {
            if(this.warnings.length > 0) {
                console.warn(this.warnings);
            }
            return this.processed;
        }
    }
}

