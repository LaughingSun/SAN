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

function RegExpReplacer (key, obj) {
  var s = obj.toString(),
      p = s.lastIndexOf('/');
  return {
    constructorName: Object.getPrototypeOf(obj).constructor.name,
    constructorArguments: [ obj.source, s.slice(++p) ]
  };
}

var _Library = {
      RegExp: RegExpReplacer
    };

function replacer (options) {
  var handers = options || _Library;
  return function (key, val) {
    var name;
    if ( val instanceof Object ) {
      if ( (name = Object.getPrototypeOf(val).constructor.name) in handers ) {
        return handers[name](key, val);
      }
    }
    return val;
  }
}

Object.defineProperties(replacer, {
  library: { value: _Library },
  RegExpReplacer: { value: RegExpReplacer }
});

module.exports = replacer;

