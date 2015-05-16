Gret = require('../src/gret/gret.js');

function stringify ( val, indent ) {
  return JSON.stringify(val, function (err, obj){
    if ( obj instanceof RegExp && ! (obj instanceof Gret) )
      return obj.toString();
    return obj;
  }, indent);
}

function test ( source, flags, input, startIndex, endIndex ) {
  var regex = new Gret(source, flags),
      g = regex.global;
  console.log('regex = new Gret(', stringify(source), ', ', stringify(flags), ')');
  console.log('Is regex an instance of Gret? ' + (regex instanceof Gret)); // true
  console.log('Is regex an instance of RegExp? ' + (regex instanceof RegExp)); // true
  console.log('regex? ' + stringify(regex, 2));
  if ( input ) {
    console.log('input? ' + input);
    console.log('startIndex? ' + startIndex);
    console.log('endIndex? ' + endIndex);
    do {
      console.log(['regex.exec(', input, ', ', startIndex, ', ', endIndex, ')'].join(''), m = regex.exec( input, startIndex, endIndex ));
    } while( g && m );
  }
}

var s = '(?<word>\\w+)',
    t = "every day I write the book.",
    start = 5,
    end = t.length - start;
//console.log(Gret);
//console.log('Gret.SUPPORTEDFLAGS', Gret.SUPPORTEDFLAGS);
//console.log('Gret.getNativeFlags(', Gret.SUPPORTEDFLAGS, ')', Gret.nativeFlags(Gret.SUPPORTEDFLAGS));

test( s, undefined, t, start, end );
test( s, '', t, start, end );
test( s, 'g', t, start, end );
test( s, 'y', t, start, end );
test( s, Gret.nativeFlags(Gret.SUPPORTEDFLAGS), t, start, end );
test( s, Gret.SUPPORTEDFLAGS, t, start, end );

//e = '(?<word>\\w+)';
//t = "every day I write the book.";
//i = 10;
//
//r = new Gret(e);
//console.log( 'r', JSON.stringify(r, null, 2) );
//do {
//  console.log( 'v = r.exec("' + t + '",', i, ')', v = r.exec(t, i) );
//} while (v && r.global);
//
//r = new Gret(e, 'g');
//console.log( 'r', JSON.stringify(r, null, 2) );
//t = "every day I write the book.";
//i = 10;
//do {
//  console.log( 'v = r.exec("' + t + '",', i, ')', v = r.exec(t, i) );
//} while (v && r.global);
//
//r = new Gret(e, 'y');
//console.log( 'r', JSON.stringify(r, null, 2) );
//t = "every day I write the book.";
//i = 10;
//do {
//  console.log( 'v = r.exec("' + t + '",', i, ')', v = r.exec(t, i) );
//} while (v && r.global);
//
//r = new Gret(e, Gret.SUPPORTEDFLAGS);
//console.log( 'r', JSON.stringify(r, null, 2) );
//t = "every day I write the book.";
//i = 10;
//do {
//  console.log( 'v = r.exec("' + t + '",', i, ')', v = r.exec(t, i) );
//} while (v && r.global);
