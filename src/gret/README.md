Gret - General RegEx Tool

from Node: 
+ to install: npm install gret, to load: Gret = require('SAN/dist/min/gret.js');

from browsers:
+ to load: &lt;script src="SAN/dist/browsified/gret.js">

constructor usages:
+ gret = new Gret(source, flags);
+ gret = new Gret(regex);
+ gret = new Gret(regex, flags);

method usages:
+ gret.exec(input, start?, end?): returns a matched array
+ gret.filter(input, replacement, start?, end?): returns the processed string (removes unmathed parts)
+ gret.match(input, start?, end?): returns a matched array or array of them
+ gret.search(input, start?, end?): returns the index of the matched
+ gret.split(input, start?, end?, limit?, delim): returns an array of split tokens
+ gret.exec(input, start?, end?): returns a matched array
+ gret.replace(input, replacement, start?, end?): rturns the processed string
* gret.compileSource(source, flags): return a native regex compiled from source and flags
* gret.compileReplacer(replacement): returns the replacer compiled from the replacerr



Supports JS, PREG, Net, and Ruby flavors of RegExp and common regex methods and features found in all of them.

