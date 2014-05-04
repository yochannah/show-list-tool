define([], function () {
  'use strict';

  return {formatNumber: formatNumber};

  function formatNumber (n) {
    var i, chunk;
    var chars = String(n).split('');
    var chunks = [];
    while (chars.length) {
      chunk = [];
      for (i = 0; chars.length && i < 3; i++) {
        chunk.push(chars.pop());
      }
      chunks.push(chunk.reverse().join(''));
    }
    return chunks.reverse().join(',');
  }
});
