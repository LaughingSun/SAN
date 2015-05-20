# SAN
String Army Knife is a Javascript string excessory set of tools for cross browser, node, and other js platforms

The SAN library contains the various commonly needed string utilities, namely:
* Gret          - an extended RegEx class with some very useful methods that were an obvious oversite in the ECMA specs and also "cleaners" which are a loadable library of functions like "encode", "escape", "pack", "sprintf" and their compliments.
* jsonreplacercb- obvious replacer callbacks for JSON.stringify
* jsonrevivercb - obvious reviver callbacks for JSON.parse

In progress with stubs
* AnsiPain      - why? because we had nothing better to do, but it's the best thing yet for ansi ui.  not uploaded until I finalize the design and structure.
* Builder       - a string builder following Java's StringBuilder class
* Chain         - basically an array of strings and placeholders, a code side non-template system if you will
* pack          - an implementation of perl pack using an array instead of argument list and with options to use #(inserts length of current item) or simulattion of length prefixed or zero terminated string simulation. allows plugins.

Soon to come:
* unpack        - an implementation of perl unpack returning an array(s,e) with options to simulate of length prefixed or zero terminated string simulation. allows plugins.
* sprintf       - you know what it does, but uses an array(s,e) instead of argument instead of argument list. allow plugins.
* sscanf        - you know what it does, returns an array. allows plugins.
