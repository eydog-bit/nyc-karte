// node oh.test.js
const assert = require('assert');
require('./oh.js');
const { status } = globalThis.OH;
const at = (d, hhmm) => ({ d, m: +hhmm.slice(0, 2) * 60 + +hhmm.slice(3) });

const bar = 'Mo-Th 17:00-01:00; Fr,Sa 17:00-02:00; Su 12:00-01:00';
assert.deepStrictEqual(status(bar, at(0, '18:00')), { open: true, until: 60, left: 7 * 60 });
assert.strictEqual(status(bar, at(1, '00:30')).open, true);              // Montagnacht über Mitternacht
assert.strictEqual(status(bar, at(0, '00:30')).open, true);              // Sonntagnacht reicht in den Montag
assert.deepStrictEqual(status(bar, at(1, '03:00')), { open: false, next: { d: 1, m: 17 * 60 } });

const cfa = 'Mo-Sa 06:30-22:00; Su off';
assert.deepStrictEqual(status(cfa, at(6, '12:00')), { open: false, next: { d: 0, m: 390 } });
assert.strictEqual(status('Mo-Su 10:00-24:00', at(3, '23:59')).open, true);
assert.strictEqual(status('24/7', at(2, '04:00')).always, true);
assert.strictEqual(status('Mo-Su 09:00-17:00; We off', at(2, '12:00')).open, false);
assert.strictEqual(status('Fr-Mo 10:00-12:00', at(6, '11:00')).open, true); // Bereich über das Wochenende
assert.strictEqual(status(undefined, at(0, '12:00')), null);
assert.throws(() => status('Montag 10-12', at(0, '11:00')));
console.log('oh.js ok');
