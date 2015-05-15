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

var FLAG_PROP_MAP = {
      "g": { flag:"g", index: 0, native: false, name: "global", settable: true, force: true },
      "i": { flag:"i", index: 1, native: true , name: "ignoreCase"},
      "m": { flag:"m", index: 2, native: true , name: "multi"},
      "n": { flag:"n", index: 3, native: false, name: "nameOnly", settable: true },
      "s": { flag:"s", index: 4, native: false, name: "stupid" },
      "x": { flag:"x", index: 5, native: false, name: "extended" },
      "y": { flag:"y", index: 6, native: false, name: "sticky", settable: true },
      "u": { flag:"u", index: 7, native: false, name: "unicode" }
    },
    REGEX_FLAGS   = new RegExp(["\\/([", Object.keys(FLAG_PROP_MAP).join(''), "]*)$"].join('')),
    PREPREGEXP  = /\\(?!k).|\((\?<(\w+)>|\?P<(\w+)>|(?!\?[:!=]))|\\k<(\w+)>|\\k'(\w+)'/g;

function _checkFlags (flags, unsupported) {
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

function _defineSettablePropFlag(flags) {
  var _flags = [],
      unsupported = [],
      d, k;
  // add flags property
  Object.defineProperty(this, 'flags', {
    get: function () {
      return _flags.join('');
    },
    set: function (flags) {
      var unsupported = [],
          d, k, s;
      for (k in FLAG_PROP_MAP) {
        s = flags.indexOf(k) >= 0;
        if ( (d = FLAG_PROP_MAP[f]).settable || s === _flags[k] )
          _flags[d.index] = s ? k : undefined;
        else
          unsupported.push(k);
      }
      _checkFlags(flags, unsupported);
    },
    enumerable: true
  });
  for (k in FLAG_PROP_MAP) {
    // initialize property value
    _flags[(d = FLAG_PROP_MAP[k]).index] = (flags.indexOf(k) >= 0) ? k : undefined;
    // add property
    if ( d.settable )
      (function ( flag, name, index ) {
        Object.defineProperty(this, name, {
          get: function () {
            return !! _flags[index];
          },
          set: function (state) {
            _flags[index] = state ? flag : undefined;
          },
          enumerable: true
        });
      }).call(this, k, d.name, d.index);
    else
      Object.defineProperty(this, d.name, {
        value: !! _flags[d.index],
        enumerable: true
      });
  }
  _checkFlags(flags, unsupported);
}

/**
 * parse source (RegExp.source) with named captures / references, returns a new source and a named index map
 * 
 * @function _createRegexExecNamedSupport
 * @argument {string}   source - either a RegExp instance or a RegExp.source value
 * @argument {Object?}  namedIndexes - a namedIndexes indexes map
 * @returns {RegExp} a native RegExp.source, and sets namedIndexes indexes
 */
var _sourceCache = {},
    _namedIndexesCache = {};
function _compileSource(source, flags, namedIndexes) {
  var sk = ['/', source, '/', flags].join(''),
      chain,
      ci, pi, m, t;
  if ( sk in _sourceCache ) {
    m = _namedIndexesCache[sk];
    for (t in m)
      namedIndexes[t] = m[t];
    return _sourceCache[sk];
  }
  chain = [];
  ci = 1;
  PREPREGEXP.lastIndex = pi = 0;
  while ( (m = PREPREGEXP.exec(source)) ) {
//    console.log( source, pi, m );
    chain.push(source.slice(pi,m.index));  // add preceeding part
    pi = PREPREGEXP.lastIndex;
    if ( (t = m[2]) ) {         // namedIndexes capture
      namedIndexes[t] = ci;
      chain.push('(');
      ci++;
    } else if ( (t = m[4] || m[5] || m[6]) ) {  // namedIndexes backreference
      if ( ! namedIndexes[t] )
        throw new Error(['no such namedIndexes back reference "', t, '"'].join(''));
      chain.push('\\', namedIndexes[t]);
    } else {
      chain.push(m[0]);
    }
  }
  chain.push(source.slice(pi));  // add trailing part
  m = {};
  for (t in namedIndexes)
    m[t] = namedIndexes[t];
  _namedIndexesCache[sk] = m;
  return _sourceCache[sk] = chain.join('');
}

function _method_prep ( input, index, endIndex ) {
  if ( typeof input === 'string' )
    this.input = input;
  if ( index === true || this.global )
    this.index = this.lastIndex;
  else
    this.index = index || 0;
  if ( endIndex == null )
    this.endIndex = input.length;
  return this.input.slice(this.index, this.endIndex);
}

/**
 * true or false
 */
function _test ( input, index, endIndex ) {
  var part = _method_prep.call(this, input, index, endIndex), 
      matched = this.native.test(true ? input : part);
  return matched;
}

/**
 * index or -1
 */
function _search ( input, index, endIndex ) {
  throw new Error('not yet supported, but it will be within days, check back soon')
}

/**
 * match[0] or null
 */
function _match ( input, index, endIndex ) {
  throw new Error('not yet supported, but it will be within days, check back soon')
}

/**
 * match array
 */
function _exec ( input, index, endIndex ) {
  var part = _method_prep.call(this, input, index, endIndex), 
      matched = this.native.exec(true ? input : part);
  if ( matched )
    this.named = matched
  return matched;
}

/**
 * string
 */
function _replace ( input, replace, index, endIndex ) {
  throw new Error('not yet supported, but it will be within days, check back soon')
}

/**
 * string (this does a predefined replace with options
 */
function _clean ( input, type, options, index, endIndex ) {
  throw new Error('not yet supported, but it will be within days, check back soon')
}


function Gret (source, flags) {
  var _source,
      _named,
      _namedIndexes,
      _regex,
      _input;
  if ( ! (this instanceof Gret) )
    throw new Error('constructor called as function');
  if ( _source instanceof RegExp ) {
    source = source.source;
    (flags == null) && (flags = REGEX_FLAGS.exec(source.toString()));
  }
  _defineSettablePropFlag.call(this, flags || '');
//  console.log('flags' , flags, this.flags);
//  console.log('_getNativeFlags(this.flags)' , _getNativeFlags(this.flags));
  _source = _compileSource(source, this.flags, _namedIndexes = {});
  _regex = new RegExp(_source, _getNativeFlags(this.flags));
  Object.defineProperties(this, {
    native: { value: _regex },
    source: { value: source, enumerable: true },
    input: {
      get: function () {
        return _input
      },
      set: function ( text ) {
        this.lastIndex = this.index = 0;
        this.endIndex = (_input = text).length;
      },
      enumerable: true
    },
    named: {
      get: function () {
        return _named;
      },
      set: function (matches) {
        _named = {};
        for (k in _namedIndexes)
          if ( matches[i = _namedIndexes[k]] !== undefined )
            _named[k] = matches[i];
        matches.named = _named;
      },
      enumerable: true
    }
  });
  this.input = '';
}

Gret.prototype = Object.create(RegExp.prototype, {
  toString: { value: function () {
      return ['/', this.source, '/' , this.flags].join('');
  } },
  test:   { value: _test },     // true or false
  search: { value: _search },   // index or -1
  match:  { value: _match },    // match[0] or null
  exec:   { value: _exec },     // match array
  replace:{ value: _replace },  // string
  clean:  { value: _clean }     // string (this does a predefined replace with options
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
  SETTABLEFLAGS: { value: (function(){
      var flags = [],
          k;
      for ( k in FLAG_PROP_MAP )
        if ( FLAG_PROP_MAP[k].settable )
          flags.push(k);
      return flags.join('');
  })() }
});



function test ( g ) {
  console.log(g);
  console.log('Is g an instance of Gret? ' + (g instanceof Gret)); // true
  console.log('Is g an instance of RegExp? ' + (g instanceof RegExp)); // true
  console.log('g.source? '+g.source);
  console.log('g.flags? '+g.flags);
  console.log('g.native? '+g.native);
  console.log('g.input? '+g.input);
  console.log('g.index? '+g.index);
  console.log('g.endIndex? '+g.endIndex);
  console.log('g.lastIndex? '+g.lastIndex);
  console.log('g.toString()? '+g.toString());
  console.log('g.test(r.toString())? '+g.test(g.toString()));
}

var r = /^\/((?:[^\\\/]+|\\.)*)\/(\w*)$/,
    v;
console.log(Gret);
console.log('Gret.SETTABLEFLAGS', Gret.SETTABLEFLAGS);
console.log('Gret.SUPPORTEDFLAGS', Gret.SUPPORTEDFLAGS);

test( r );
test( new Gret(r.source) );
test( new Gret(r.source, 'y') );
test( new Gret(r.source, 'g') );
test( new Gret(r.source, Gret.SETTABLEFLAGS) );
test( new Gret(r.source, Gret.SUPPORTEDFLAGS) );
test( r = new Gret('(?<word>\\w+)', Gret.SUPPORTEDFLAGS) );
do {
  console.log( 'v = r.exec("Every day I write the book.")', v = r.exec("Every day I write the book.") );
} while (v);
