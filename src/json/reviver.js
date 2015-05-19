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

var _Library = {
      Date: { regex: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\w{1,3})$/ }
    };

function reviver (options) {
  var handlers = options || _Library;
  return function (key, val) {
    var name, match;
    if ( ! key ) {
      if ( val instanceof Object ) {
        if ( 'constructorName' in val && 'constructorArguments' in val
            && (name = val.constructorName) in root ) {
          return root[name].apply(null, val.constructorArguments);
        }
      } else if ( typeof val === 'string' ) {
        for ( name in handlers ) {
          if ( name in root && (match = val.match(handlers[name].regex)) ) {
            match.shift();
            return root[name].apply(null, match);
          }
        }
      }
    }
    return val;
  }
}

Object.defineProperties(reviver, {
  library: { value: _Library },
});

module.exports = reviver;

