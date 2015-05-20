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

/*
The TEMPLATE is a sequence of characters that give the order and type of values, as follows:
  a  A string with arbitrary binary data, will be null padded.
  A  A text (ASCII) string, will be space padded.
  Z  A null-terminated (ASCIZ) string, will be null padded.
  b  A bit string (ascending bit order inside each byte,
     like vec()).
  B  A bit string (descending bit order inside each byte).
  h  A hex string (low nybble first).
  H  A hex string (high nybble first).
  c  A signed char (8-bit) value.
  C  An unsigned char (octet) value.
  W  An unsigned char value (can be greater than 255).
  s  A signed short (16-bit) value.
      S  An unsigned short value.
      l  A signed long (32-bit) value.
  L  An unsigned long value.
  q  A signed quad (64-bit) value.
      Q  An unsigned quad value.
       (Quads are available only if your system supports 64-bit
        integer values _and_ if Perl has been compiled to support
        those.  Raises an exception otherwise.)
  i  A signed integer value.
  I  A unsigned integer value.
       (This 'integer' is _at_least_ 32 bits wide.  Its exact
        size depends on what a local C compiler calls 'int'.)
  n  An unsigned short (16-bit) in "network" (big-endian) order.
  N  An unsigned long (32-bit) in "network" (big-endian) order.
  v  An unsigned short (16-bit) in "VAX" (little-endian) order.
  V  An unsigned long (32-bit) in "VAX" (little-endian) order.
  j  A Perl internal signed integer value (IV).
  J  A Perl internal unsigned integer value (UV).
  f  A single-precision float in native format.
  d  A double-precision float in native format.
  F  A Perl internal floating-point value (NV) in native format
  D  A float of long-double precision in native format.
       (Long doubles are available only if your system supports
        long double values _and_ if Perl has been compiled to
        support those.  Raises an exception otherwise.)
  p  A pointer to a null-terminated string.
  P  A pointer to a structure (fixed-length string).
  u  A uuencoded string.
  U  A Unicode character number.  Encodes to a character in char-
     acter mode and UTF-8 (or UTF-EBCDIC in EBCDIC platforms) in
     byte mode.
  w  A BER compressed integer (not an ASN.1 BER, see perlpacktut
     for details).  Its bytes represent an unsigned integer in
     base 128, most significant digit first, with as few digits
     as possible.  Bit eight (the high bit) is set on each byte
     except the last.
  x  A null byte (a.k.a ASCII NUL, "\000", chr(0))
  X  Back up a byte.
  @  Null-fill or truncate to absolute position, counted from the
     start of the innermost ()-group.
  .  Null-fill or truncate to absolute position specified by
     the value.
  (  Start of a ()-group.
One or more modifiers below may optionally follow certain letters in the TEMPLATE (the second column lists letters for which the modifier is valid):
  !   sSlLiI     Forces native (short, long, int) sizes instead
                 of fixed (16-/32-bit) sizes.
      !   xX         Make x and X act as alignment commands.
      !   nNvV       Treat integers as signed instead of unsigned.
      !   @.         Specify position as byte offset in the internal
                                    representation of the packed string.  Efficient
                                    but dangerous.
      >   sSiIlLqQ   Force big-endian byte-order on the type.
              jJfFdDpP   (The "big end" touches the construct.)
      <   sSiIlLqQ   Force little-endian byte-order on the type.
              jJfFdDpP   (The "little end" touches the construct.)
The > and < modifiers can also be used on () groups to force a particular byte-order on all components in that group, including all its subgroups.
The following rules apply:
Each letter may optionally be followed by a number indicating the repeat count. A numeric repeat count may optionally be enclosed in brackets, as in pack("C[80]", @arr) . The repeat count gobbles that many values from the LIST when used with all format types other than a , A , Z , b , B , h , H , @ , ., x , X , and P , where it means something else, described below. Supplying a * for the repeat count instead of a number means to use however many items are left, except for:
@ , x , and X , where it is equivalent to 0 .
<.>, where it means relative to the start of the string.
u , where it is equivalent to 1 (or 45, which here is equivalent).
One can replace a numeric repeat count with a template letter enclosed in brackets to use the packed byte length of the bracketed template for the repeat count.
For example, the template x[L] skips as many bytes as in a packed long, and the template "$t X[$t] $t" unpacks twice whatever $t (when variable-expanded) unpacks. If the template in brackets contains alignment commands (such as x![d] ), its packed length is calculated as if the start of the template had the maximal possible alignment.
When used with Z , a * as the repeat count is guaranteed to add a trailing null byte, so the resulting string is always one byte longer than the byte length of the item itself.
When used with @ , the repeat count represents an offset from the start of the innermost () group.
When used with ., the repeat count determines the starting position to calculate the value offset as follows:
If the repeat count is 0 , it's relative to the current position.
If the repeat count is * , the offset is relative to the start of the packed string.
And if it's an integer n, the offset is relative to the start of the nth innermost ( ) group, or to the start of the string if n is bigger then the group level.
The repeat count for u is interpreted as the maximal number of bytes to encode per line of output, with 0, 1 and 2 replaced by 45. The repeat count should not be more than 65.
The a , A , and Z types gobble just one value, but pack it as a string of length count, padding with nulls or spaces as needed. When unpacking, A strips trailing whitespace and nulls, Z strips everything after the first null, and a returns data with no stripping at all.
If the value to pack is too long, the result is truncated. If it's too long and an explicit count is provided, Z packs only $count-1 bytes, followed by a null byte. Thus Z always packs a trailing null, except when the count is 0.
Likewise, the b and B formats pack a string that's that many bits long. Each such format generates 1 bit of the result. These are typically followed by a repeat count like B8 or B64 .
Each result bit is based on the least-significant bit of the corresponding input character, i.e., on ord($char)%2. In particular, characters "0" and "1" generate bits 0 and 1, as do characters "\000" and "\001" .
Starting from the beginning of the input string, each 8-tuple of characters is converted to 1 character of output. With format b , the first character of the 8-tuple determines the least-significant bit of a character; with format B , it determines the most-significant bit of a character.
If the length of the input string is not evenly divisible by 8, the remainder is packed as if the input string were padded by null characters at the end. Similarly during unpacking, "extra" bits are ignored.
If the input string is longer than needed, remaining characters are ignored.
A * for the repeat count uses all characters of the input field. On unpacking, bits are converted to a string of 0 s and 1 s.
The h and H formats pack a string that many nybbles (4-bit groups, representable as hexadecimal digits, "0".."9" "a".."f" ) long.
For each such format, pack() generates 4 bits of result. With non-alphabetical characters, the result is based on the 4 least-significant bits of the input character, i.e., on ord($char)%16. In particular, characters "0" and "1" generate nybbles 0 and 1, as do bytes "\000" and "\001" . For characters "a".."f" and "A".."F" , the result is compatible with the usual hexadecimal digits, so that "a" and "A" both generate the nybble 0xA==10 . Use only these specific hex characters with this format.
Starting from the beginning of the template to pack(), each pair of characters is converted to 1 character of output. With format h , the first character of the pair determines the least-significant nybble of the output character; with format H , it determines the most-significant nybble.
If the length of the input string is not even, it behaves as if padded by a null character at the end. Similarly, "extra" nybbles are ignored during unpacking.
If the input string is longer than needed, extra characters are ignored.
A * for the repeat count uses all characters of the input field. For unpack(), nybbles are converted to a string of hexadecimal digits.
The p format packs a pointer to a null-terminated string. You are responsible for ensuring that the string is not a temporary value, as that could potentially get deallocated before you got around to using the packed result. The P format packs a pointer to a structure of the size indicated by the length. A null pointer is created if the corresponding value for p or P is undef; similarly with unpack(), where a null pointer unpacks into undef.
If your system has a strange pointer size--meaning a pointer is neither as big as an int nor as big as a long--it may not be possible to pack or unpack pointers in big- or little-endian byte order. Attempting to do so raises an exception.
The / template character allows packing and unpacking of a sequence of items where the packed structure contains a packed item count followed by the packed items themselves. This is useful when the structure you're unpacking has encoded the sizes or repeat counts for some of its fields within the structure itself as separate fields.
For pack, you write length-item/sequence-item, and the length-item describes how the length value is packed. Formats likely to be of most use are integer-packing ones like n for Java strings, w for ASN.1 or SNMP, and N for Sun XDR.
For pack, sequence-item may have a repeat count, in which case the minimum of that and the number of available items is used as the argument for length-item. If it has no repeat count or uses a '*', the number of available items is used.
For unpack, an internal stack of integer arguments unpacked so far is used. You write /sequence-item and the repeat count is obtained by popping off the last element from the stack. The sequence-item must not have a repeat count.
If sequence-item refers to a string type ("A" , "a" , or "Z" ), the length-item is the string length, not the number of strings. With an explicit repeat count for pack, the packed string is adjusted to that length. For example:
*/

// NOTE: Unfinished, just a placeholder representing how it can work

var FORMATLIB = {
      // hacky shit for dealing with the fact that javascripts length value is
      // not represented in a string
      "#": function ( arg, argp, wide, mods, code ) {
        _args.splice(_argc, 0, arg.toString().length);
        return '';
      },
      "a": function ( arg, argp, wide, mods, code ) {
        var ret;
        if (wide < 0)
          wide = arg.length - argp;
        ret = pad(arg.slice(argp, argp += wide), wide, '\0');
        return ret;
      },
      "A": function ( arg, argp, wide, mods, code ) {
        var ret;
        if (wide < 0)
          wide = arg.length - argp;
        ret = pad(arg.slice(argp, argp += wide), wide, ' ');
        return ret;
      }
    },
    _padCache = {};

function pad (text, width, char) {
  var l = text.length,
      pad;
  if ( l >= width )
    return text;
  if ( ! ((char || (char = ' ')) in _padCache) )
    pad = _padCache[char] = Array(width + 1).join(char);
  else while ( (pad = _padCache[char]).length < width )
    _padCache[char] += pad
  pad = pad.slice(0, width);
  return text + pad.slice(-width+l);
}

var formatCache = {},
    _args, _argi, _argc, _argp;

function compileFormat ( format ) {
  if ( format in formatCache )
    return formatCache[format];
  
}

function setargs( args ) {
  _argc = (_args = args).length;
  _argi = -1;
}

function replacer ( matched, named ) {
  var code = named.code,
      ret = null,
      call, ch;
  if ( ! named.cont ) {
    ++_argi;
    _argp = 0;
  }
  if ( 0 <= _argi && _argi < _argc && (call = FORMATLIB[code]) instanceof Function ) {
    ret = call(_args[_argi], _argp, (ch = named.repeat1 || named.repeat2) ? parseInt(ch) : -1, named.modifier, code);
  }
  return ret;
}

replacer.configure = setargs;

module.exports = replacer;
