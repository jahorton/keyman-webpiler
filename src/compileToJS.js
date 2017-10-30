class JSCompiler {
    constructor(debug) {
        if(typeof(debug) == "undefined") {
            debug = false;
        }
        this.settings = {
            autoFillIn: 'false',         // If 'true', automatically inserts default values for unspecified system stores.
            debug: debug,
            endl: debug ? "\n" : "",
            indent: debug ? "  " : ""
        };
    };

    /**
     * Analyzes processing results for relevant keyboard metadata to be included in the compiled JS script for the keyboard.
     * @param {*} processedResults 
     */
    processSystemStores(processedResults) {
        this.cache.properties["KH"] = "";
        for(var sysStore in processedResults.sysStores) {
            switch(sysStore) {
                case "name":
                    var keyboardName = processedResults.sysStores[sysStore];
                    this.cache.properties["KN"] = keyboardName;

                    keyboardName = keyboardName.replace(' ', '_');

                    this.cache.properties["KI"] = "Keyboard_" + keyboardName; // TODO:
                    break;
                case "kmw_helptext":
                    this.cache.properties["KH"] = processedResults.sysStores[sysStore];
                    break;
            }
        }
    }

    minifyIdentifiers(processedResults) {
        var index = 10;

        for(var store in processedResults.stores) {
            this.cache.storeMap[store] = "s" + String(index++);
        }

        index = 0;

        for(var group in processedResults.groups) {
            this.cache.groupMap[group] = "g" + String(index++);
        }
    }

    writeStores(processedResults) {
        var endl = this.settings.endl, indent = this.settings.indent;
        var script = "";

        for(var store in processedResults.stores) {
            script += indent + "this." + this.cache.storeMap[store] + "=\"" + processedResults.stores[store] + "\";" + endl;
        }

        return script;
    }

    writeBegin(processedResults) {
        var endl = this.settings.endl, indent = this.settings.indent;
        var script = "";

        script += indent + "this.gs = function(t, e) {" + endl;
        script += indent + indent + "return this." + this.cache.groupMap[processedResults.begin] + "(t, e);" + endl;
        script += indent + "};" + endl;

        return script;
    }

    writeRule(ruleSpec) {
        var endl = this.settings.endl, indent = this.settings.indent;
        var indent2 = indent + indent, indent3 = indent + indent + indent;
        
        // TODO:  Write condition

        var script = "if(" + "/*condition compilation is not yet implemented*/ false" + ") {" + endl;
        script += indent3 + "r=m=1;" + endl;
        // TODO:  Write output
        script += indent3 + "/*output is not yet implemented*/;" + endl;
        script += indent2 + "}";

        return script;
    }

    writeGroups(processedResults) {
        var endl = this.settings.endl, indent = this.settings.indent;
        var indent2 = indent + indent, indent3 = indent + indent + indent;
        var script = "";

        for(var group in processedResults.groups) {
            var groupSpec = processedResults.groups[group];

            script += indent + "this." + this.cache.groupMap[group] + " = function(t, e) {" + endl;
            script += indent2 + "var k=KeymanWeb,r=0,m=0;" + endl;

            for(var i=0; i < groupSpec.rules.length; i++) {
                if(i == 0) {
                    script += indent2 + this.writeRule(groupSpec.rules[i]);
                } else {
                    script += " else " + this.writeRule(groupSpec.rules[i]);
                }
            }

            script += endl;

            if(groupSpec.match) {
                script += indent2 + "if(m) {" + endl;
                script += indent3 + "r=this." + this.cache.groupMap[groupSpec.match] + "(t,e);" + endl;
                script += indent2 + "}" + endl;
            }

            if(groupSpec.nomatch) {
                script += indent2 + "if(!m && k.KIK(e)) {" + endl;
                script += indent3 + "r=this." + this.cache.groupMap[groupSpec.nomatch] + "(t,e);" + endl;
                script += indent2 + "}" + endl;
            }

            script += indent + "};" + endl;
        }

        return script;
    }

    writeFile(processedResults) {
        var endl = this.settings.endl, indent = this.settings.indent;
        var script = "";

        script += "KeymanWeb.KR(new " + this.cache.properties["KI"] + "());" + endl;
        script += "function " + this.cache.properties["KI"] + "() {" + endl;
        script += indent + "this.KI=\"" + this.cache.properties["KI"] + "\";" + endl;
        script += indent + "this.KN=\"" + this.cache.properties["KN"] + "\";" + endl;
        script += indent + "this.KH=\"" + this.cache.properties["KH"] + "\";" + endl;
        script += indent + "this.KM=" + 0 + ";" + endl;

        script += this.writeStores(processedResults);

        if(endl != "") {
            script += endl;
        }

        script += this.writeBegin(processedResults);
        script += this.writeGroups(processedResults);

        script += "}" + endl;

        return script;
    }

    execute(processedResults) {
        this.cache = { 
            properties: {},
            storeMap: {},
            groupMap: {}
        };

        this.processSystemStores(processedResults);
        this.minifyIdentifiers(processedResults);

        var script = this.writeFile(processedResults);

        delete this.cache;

        return script;
    }
}