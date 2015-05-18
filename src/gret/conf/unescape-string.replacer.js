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

var ESC_CHARS = {
      "0": "\0",
      "b": "\b",
      "f": "\f",
      "n": "\n",
      "r": "\r",
      "t": "\t"
    },
    padding = '00000000',
    _quotes;

function padnum(text, width) {
  l = text.length;
  return l < width ? text : padding.slice(-width+l) + text;
}

function setQuotes( quotes ) {
  _quotes = (typeof quotes == "string") ? quotes : "'\"";
}

function replacer ( matched, named ) {
  var ch;
  if ( (ch = matched[1]) )
    return ESC_CHARS[ch];
  else if ( (ch = matched[2] || matched[3]) )
    return String.fromCharCode(parseInt(ch, 16));
  if ( (ch = matched[4]) )
    return ch;
  return matched[0];
}

replacer.configure = setQuotes;

module.exports = replacer;
