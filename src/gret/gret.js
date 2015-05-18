/* 
 * The MIT License
 *
 * Copyright 2015 Erich.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* TODOS:
 * add: non-native n, s, x and u
 */
var FLAG_PROP_MAP = {
      "g": { flag:"g", native: false, name: "global", force: true },
      "i": { flag:"i", native: true , name: "ignoreCase"},
      "m": { flag:"m", native: true , name: "multiline"},
      "n": { flag:"n", native: false, name: "nameOnly" },
      "s": { flag:"s", native: false, name: "dotAll" },
      "x": { flag:"x", native: false, name: "extended" },
      "y": { flag:"y", native: false, name: "sticky" },
      "u": { flag:"u", native: false, name: "unicode" }
    },
    REGEX_FLAGS   = new RegExp(["\\/(\w*)$"].join('')),
//    PREP_REGEXP   = /\\(?!k).|\((\?<(\w+)>|\?P<(\w+)>|(?!\?[:!=]))|\\k<(\w+)>|\\k'(\w+)'/g,
    PREP_REGEXP   = /\\(?!k).|\((?:\?<(\w+)>|\?P<(\w+)>|\?P=(\w+)\)|(?!\?[:!=]))|\\k<(\w+)>|\\k'(\w+)'/g,
    //                        backref 0-99             backref   named    named          named
    PREP_REPLACER = /[\$\\](?:((?:0|[1-9]\d?)(?!\d))|\{(\d+)\}|k<(\w+)>|k'(\w+)')|\(\?P=?(\w+)\)/g,
    CONF_LIB = 'conf/',
    CLEAN_EXT = '.clean.json',
    REPLACER_EXT = '.replacer.json',
    Slice = Array.prototype.slice,
    Max = Math.max,
    Min = Math.min;

function _checkFlags (flags, unsupported) {
  unsupported || (unsupported = []);
  if ( flags ) {
    flags.split('').forEach(function(k){
      if ( ! (k in FLAG_PROP_MAP) )
        unsupported.push(k);
    });
    if ( unsupported.length )
      throw new Error(['flags "', unsupported.join(['']), '" are not settable or unsupported'].join(''));
  }
}

function _getNativeFlags (flags) {
  var native = [],
      d, k;
  for ( k in FLAG_PROP_MAP )
    if ( (d = FLAG_PROP_MAP[k]).force || (d.native && flags.indexOf(k) >= 0) )
      native.push(k);
  return native.join('');
}

function _method_prep ( input, startIndex, endIndex ) {
  var regex;
  regex = this.native;
  if ( typeof input === 'string' && this.input !== input )
    this.input = input;
  if ( startIndex != null )
    this.startIndex = startIndex;
  if ( endIndex != null )
    this.endIndex = endIndex;
  regex.lastIndex = this.global && this.index >= 0 ? this.lastIndex : this.startIndex;
  return regex
//  console.log( '_method_prep', regex,  regex.lastIndex, this.input, this.startIndex, this.endIndex, this.lastIndex );
}

function _getNamedCaptures ( matched, namedIndexes ) {
  var named = {},
      i, k;
  if ( matched && namedIndexes ) {
    for (k in namedIndexes)
      if ( matched[i = namedIndexes[k]] !== undefined )
        named[k] = matched[i];
  }
  return named;
}

function __exec__ ( native ) {
  var startIndex = this.startIndex,
      endIndex = this.endIndex,
      matched;
  if ( (matched = native.exec(this.input))
      && matched.index >= startIndex
      && matched.index < endIndex
      && ( ! this.sticky || matched.pop() === undefined) ) {
    matched.named = _getNamedCaptures( matched, native.namedIndexes );
    this.lastIndex = native.lastIndex;
    this.index = matched.index;
  } else {
//    console.log(matched);
    matched = null;
    this.lastIndex = this.startIndex;
    this.index = -1;
  }
//  this.lastIndex = Max(this.startIndex, native.lastIndex);
  return matched;
}

/**
 * match array
 */
function _exec ( input, startIndex, endIndex ) {
  return __exec__.call(this, _method_prep.call(this, input, startIndex, endIndex));
}

/**
 * true or false
 */
function _test ( input, startIndex, endIndex ) {
  return !! __exec__.call(this, _method_prep.call(this, input, startIndex, endIndex));
}

/**
 * index or -1
 */
function _search ( input, startIndex, endIndex ) {
  var matched = __exec__.call(this, _method_prep.call(this, input, startIndex, endIndex));
  return matched ? matched.index : -1;
}

/**
 * match, an Array of all matches('g' flag) or null - when using the 'g' flag it
 * returns an array of all matches, fe:
 *  [ ["the whole string", "the", index: 0, lastIndex: 3],
 *    ["the whole string", "whole", index: 4, lastIndex: 9],
 *    ["the whole string", "string", index: 10, lastIndex: 16] ]
 */
function _match ( input, startIndex, endIndex ) {
  var native = _method_prep.call(this, input, startIndex, endIndex),
      matched = [],
      g = this.global,
      m;
  do {
    if ( (m = __exec__.call(this, native)) )
      matched.push( m );
  } while( g && m );
  if ( matched.length )
    return g ? matched : matched[0];
  return null;
}

var _replacerCache = {};
function _compileReplacer (replacer) {
  var chain, ci,
      m, t;
  if ( replacer in _replacerCache )
    return _replacerCache[replacer];
  chain = [];
  props = {};
  PREP_REPLACER.lastIndex = ci = 0;
  while ( (m = PREP_REPLACER.exec(replacer)) ) {
    (ci < m.index) && chain.push(JSON.stringify(replacer.slice(ci, m.index)));
    ci = PREP_REPLACER.lastIndex;
    //         backref 0-99      backref   named    named          named
    //(?:[\$\\](\d{1,2}(?!\d))|\{(\d+)\}|k<(\w+)>|k'(\w+)')|\(\?P=?(\w+)\)/g,
    if ( (t = m[1] || m[2]) )       // backref(numeric)
      chain.push(['matched[',t,']'].join(''));
    else if ( (t = m[3] || m[4] || [5]) )  // named
      chain.push(['named[',JSON.stringify(t),']'].join(''));
    else
      throw new Error(['could nto compile ', JSON.stringify(m[0]), ' at ', m.index, ' in ', JSON.stringify(replacer), ', this shoudl never happen'].join(''));
  }
  (ci < replacer.length) && chain.push(JSON.stringify(replacer.slice(ci)));
  return _replacerCache[replacer] = new Function('matched, named', ['return [', chain.join(), '].join(\'\')'].join(''))
}

/**
 * string
 */
function _replace ( input, replacer, startIndex, endIndex ) {
  var native = _method_prep.call(this, input, startIndex, endIndex),
      result = [],
      g = this.global,
      ci = 0,
      m;
  (replacer instanceof Function) || (replacer = _compileReplacer(replacer))
  do {
    if ( (m = __exec__.call(this, native)) ) {
      result.push( input.slice(ci, m.index));
      result.push( replacer( m, m.named ) );
      ci = native.lastIndex;
    }
  } while( g && m );
  result.push( input.slice(ci, this.endIndex));
  return result.join('');
}

/**
 * filter
 * 
 * identical to replace() except only the matches are return
 */
function _filter ( input, replacer, startIndex, endIndex ) {
  var native = _method_prep.call(this, input, startIndex, endIndex),
      result = [],
      g = this.global,
      m;
  (replacer instanceof Function) || (replacer = _compileReplacer(replacer))
  do {
    if ( (m = __exec__.call(this, native)) ) {
      result.push( replacer( m, m.named ) );
    }
  } while( g && m );
  return result.join('');
}

/*
 * split
 * 
 * Split the given string by a regular expression.
 * 
 * @param {string}  input - The input string.
 * @param {int}     start - start position.
 * @param {int}     end   - end position
 * @param {int}     limit - only substrings up to limit are captureed
 * @param {boolean} delim - parenthesized expression in the delimiter pattern will be captured and returned as well
 * @returns {Array} 
 */
function _split ( input, startIndex, endIndex, limit, delimCapture ) {
  var native = _method_prep.call(this, input, startIndex, endIndex),
      result = [],
      ci = this.startIndex,
      i = 0,
      m;
  do {
    if ( (m = __exec__.call(this, native)) && m.index < this.endIndex ) {
      result.push( input.slice(ci, m.index));
      if ( delimCapture )
        result.push( m[0] );
      ci = native.lastIndex;
    } else {
      m = null;
      this.lastIndex = this.startIndex;
      this.index = -1;
    }
  } while( m && (limit == null || ++i < limit) );
  result.push( input.slice(ci, this.endIndex));
  return result;
}

/** this is a class method, not an instance method
 * string (this does a predefined replace with options
 */
var _cleanConfCache = {};
function _loadCleaner ( name, options ) {
  var conf, gret, replacer;
  if ( name in _cleanConfCache )
    gret = _cleanConfCache[name];
  else {
    conf = require([CONF_LIB, name, CLEAN_EXT].join(''));
    gret = new Gret(conf.source, conf.flags);
    gret.replacer = replacer = conf.replacer_file
        ? require([CONF_LIB, name, REPLACER_EXT].join(''))
        : conf.replacer;
    _cleanConfCache[name] = gret;
    if ( replacer.configure instanceof Function )
      replace.configure( conf, options );
    return function(input, index, endIndex){
      return gret.replace.call(gret, input, replacer, index, endIndex);
    };
  }
}

/**
 * parse source (RegExp.source) with named captures / references, returns a new source and a named index map
 * 
 * @function _compileSource
 * @argument {string}   source - either a RegExp instance or a RegExp.source value
 * @argument {Object?}  namedIndexes - a namedIndexes indexes map
 * @returns {RegExp} a native RegExp.source, and sets namedIndexes indexes
 */
var _regexCache = {};
function _compileSource(source, flags) {
  var key,
      regex, sticky, chain, namedIndexes,
      ci, pi, m, t;
  if ( source instanceof RegExp ) {
    if ( flags == null )
      flags = REGEX_FLAGS.exec(source.toString())[1];
    source = source.flags;
  } else if ( ! flags )
    flags = '';
  this.dirty = false;
  if ( (key = ['/', source, '/', flags].join('')) in _regexCache )
    return this.native = _regexCache[key];
  
  chain = (sticky = (flags.indexOf('y') >= 0)) ? ['(?:'] : [];
  namedIndexes = {};
  ci = 1;
  PREP_REGEXP.lastIndex = pi = 0;
  while ( (m = PREP_REGEXP.exec(source)) ) {
    chain.push(source.slice(pi,m.index));  // add preceeding part
    pi = PREP_REGEXP.lastIndex;
    // PREP_REGEXP   = /\\(?!k).|\((?:\?<(\w+)>|\?P<(\w+)>|\?P=(\w+)\)|(?!\?[:!=]))|\\k<(\w+)>|\\k'(\w+)'/g,
    if ( (t = m[1] || m[2]) ) {         // namedIndexes capture
      namedIndexes[t] = ci;
      chain.push('(');
      ci++;
    } else if ( (t = m[3] || m[4] || m[5]) ) {  // namedIndexes backreference
      if ( ! namedIndexes[t] )
        throw new Error(['no such namedIndexes back reference "', t, '"'].join(''));
      chain.push('\\', namedIndexes[t]);
    } else {
      chain.push(m[0]);
    }
  }
  sticky    // add trailing part
      ? chain.push(source.slice(pi), ')|([^])')
      : chain.push(source.slice(pi) );
  (regex = new RegExp(chain.join(''), _getNativeFlags(flags).replace('g','') + 'g')).namedIndexes = namedIndexes;
  return (this.native = _regexCache[key] = regex);
}

function Gret (source, flags) {
  var _source,
      _flags,
      _native,
      _input,
      i, k;
  if ( ! (this instanceof Gret) )
    throw new Error('constructor called as function');
//  _defineSettablePropFlag.call(this);
  _flags = Array(Object.keys(FLAG_PROP_MAP).length);
  Object.defineProperties(this, {
    source: {
      get: function () {
        return _source
      },
      set: function ( source ) {
        _source = source instanceof RegExp ? source.source : source;
        this.dirty = true;
      },
      enumerable: true
    },
    flags: {
      get: function () {
        return _flags.join('');
      },
      set: function (flags) {
        var i = -1,
            k, s;
        flags || (flags = '');
        for (k in FLAG_PROP_MAP) {
          if ( (s = (flags.indexOf(k) >= 0) ? k : undefined) !== _flags[++i] ) {
            _flags[i] = s;
           this.dirty = true;
          }
        }
        _checkFlags(flags);
      },
      enumerable: true
    },
    native: {
      get: function () {
        if ( this.dirty )
          _native = this.compile( this.source, this.flags );
        return _native;
      },
      set: function ( regex ) {
        _native = regex;
        this.dirty = false;
      },
      enumerable: true
    },
    input: {
      get: function () {
        return _input
      },
      set: function ( text ) {
        this.startIndex = 0;
        this.endIndex = (_input = text).length;
        this.index = -1;
      },
      enumerable: true
    },
    compile: {
      value: _compileSource,
      enumerable: true
    }
  });
  i = -1;
  for (k in FLAG_PROP_MAP) {
    // add property
    (function ( flag, name, index ) {
      Object.defineProperty(this, name, {
        get: function () {
          return !! _flags[index];
        },
        set: function (state) {
          _flags[index] = state ? flag : undefined;
          this.dirty = true;
        },
        enumerable: true
      });
    }).call(this, k, FLAG_PROP_MAP[k].name, ++i);
  }
  
  this.flags    = (typeof flags === 'string')
    ? flags
    : ((source instanceof RegExp && REGEX_FLAGS.exec(source.toString())[1]) || '');
  this.source   = source;
  this.input    = '';
  this.lastIndex= 0;
}

Gret.prototype = Object.create(RegExp.prototype, {
  toString: { value: function () {
      return ['/', this.source, '/' , this.flags].join('');
  } },
  test:   { value: _test },     // true or false
  search: { value: _search },   // index or -1
  match:  { value: _match },    // match[0] or null
  exec:   { value: _exec },     // match array
  replace:{ value: _replace },  // replace matched
  filter: { value: _filter },   // remove non-matched and replace matched
  split:  { value: _split }     // split
});
Gret.prototype.constructor = Gret;
Object.defineProperties(Gret, {
  SUPPORTEDFLAGS: { value: (function(){
      var flags = [],
          k;
      for ( k in FLAG_PROP_MAP )
        flags.push(k);
      return flags.join('');
  })() },
  loadCleaner:      { value: _loadCleaner },     // string (this does a predefined replace with options
  nativeFlags:      { value: _getNativeFlags },
  validateFlags:    { value: _checkFlags },
  getNamedCaptures: { value: _getNamedCaptures }
});


module.exports = Gret;
