Gret = require('../src/gret/gret.js');

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
