// Öffnungszeiten im Format "Mo-Fr 07:00-21:00; Sa,Su 08:00-22:00", "Su off" oder "24/7".
// Spätere Regeln überschreiben frühere für dieselben Tage. Ende vor Beginn heißt: nach Mitternacht.
(function (g) {
  const D = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const W = 7 * 1440;
  const min = s => { const [h, m = 0] = s.split(':').map(Number); return h * 60 + m; };

  function parse(oh) {
    if (!oh) return null;
    if (oh.trim() === '24/7') return '24/7';
    const week = [[], [], [], [], [], [], []];
    for (const rule of oh.split(';').map(s => s.trim()).filter(Boolean)) {
      const m = rule.match(/^([A-Za-z,-]+)\s+(.+)$/);
      if (!m) throw new Error('oh: ' + rule);
      const spans = m[2].trim() === 'off' ? [] : m[2].split(',').map(t => {
        const [a, b] = t.trim().split('-').map(min);
        return [a, b <= a ? b + 1440 : b];
      });
      for (const part of m[1].split(',')) {
        const [a, b = a] = part.split('-').map(d => D.indexOf(d));
        if (a < 0 || b < 0) throw new Error('oh: ' + rule);
        for (let d = a; ; d = (d + 1) % 7) { week[d] = spans; if (d === b) break; }
      }
    }
    return week;
  }

  // now: { d: 0 = Montag … 6 = Sonntag, m: Minuten seit Mitternacht }
  function status(oh, now) {
    const w = parse(oh);
    if (!w) return null;
    if (w === '24/7') return { open: true, always: true };
    const t = now.d * 1440 + now.m;
    let next = null;
    for (let d = 0; d < 7; d++) for (const [s, e] of w[d]) for (const k of [-W, 0, W]) {
      const a = d * 1440 + s + k, b = d * 1440 + e + k;
      if (t >= a && t < b) return { open: true, until: b % 1440, left: b - t };
      if (a > t && (next === null || a < next)) next = a;
    }
    return { open: false, next: next === null ? null : { d: Math.floor(next / 1440) % 7, m: next % 1440 } };
  }

  g.OH = { parse, status };
})(typeof window !== 'undefined' ? window : globalThis);
