/* Zero b29: the prototype's settings, so every coach style, part and state can be seen. Saved in this browser only. */
window.CFG = (function () {
  'use strict';
  var d = { entry: 'push', ring: true, stake: true, why: true, good: true, coin: true, notes: 'skip', coach: 'auto', xp: 470, sim: 0, lines: 'asks', stats: null, simTab: 'rank', rankView: 'big' };
  try { var s = JSON.parse(localStorage.getItem('zl-cfg-b37') || '{}'); for (var k in s) if (k in d) d[k] = s[k]; } catch (e) {}
  d.save = function () { try { var o = {}; for (var k in d) if (typeof d[k] !== 'function') o[k] = d[k]; localStorage.setItem('zl-cfg-b37', JSON.stringify(o)); } catch (e) {} };
  return d;
})();
