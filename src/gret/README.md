Gret - General RegEx Tool

Stability: "Seems stable without any unit or significant testing."

the following is a summary of usage, an api document(s) will soon be aviable in the SAN/docs directory.

from Node: 
+ to load: Gret = require('SAN/dist/min/gret.js');

from browsers:
+ to load: &lt;script src="SAN/dist/browsified/gret.js">

constructor usages:
+ gre = new Gret(source, flags);
+ gre = new Gret(regex);
+ gre = new Gret(regex, flags);

instance attributes:
+ input: the text to be greted
+ start: where to start gretting
+ end: where to end gretting
+ native: the native RegExp being used, not this changes if you set flags (or source)
+ source: the source for the gret regex
+ flags: the flags for the gret regex
+ lastIndex: as above so below, where the last search ended, and (for g & y flags) where to start the next search
+ dirty: this causes the source and flags to be recompiled on next use.

instance method usages:
+ gre.exec(input, start?, end?): returns a matched array
+ gre.filter(input, replacement, start?, end?): returns the processed string (removes unmathed parts)
+ gre.match(input, start?, end?): returns a matched array or array of them
+ gre.replace(input, replacement, start?, end?): rturns the processed string
+ gre.search(input, start?, end?): returns the index of the matched
+ gre.split(input, start?, end?, limit?, delim): returns an array of split tokens
+ gre.test(input, start?, end?): returns a matched array
+ gre._exec(native?): returns a matched array
+ gre._filter(native?): returns the processed string (removes unmathed parts)
+ gre._replace(native?): rturns the processed string

class method usages:
* Gret.clean(type, source, start?, end?, options?: returns the cleaned string (see API docs for details)
* Gret.compileSource(source, flags): return a native regex compiled from source and flags
* Gret.compileReplacer(replacement): returns the replacer compiled from the replacerr

Supports JS, PREG, Net, and Ruby flavors of RegExp and common regex methods and features found in all of them.

Gret.clean examples:
+ Gret.clean('escape string', input);
+ Gret.clean('unescape string', input);
+ Gret.clean('escape regex', input);
+ Gret.clean('unescape regex', input);
+ Gret.clean('escape uri', input);
+ Gret.clean('unescape uri', input);
+ Gret.clean('escape html', input);
+ Gret.clean('unescape html', input);

Note: we like lowercase beginnings because we are local.
