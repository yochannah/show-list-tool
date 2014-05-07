define([], function () {

  'use strict';

  var Strings = {
    longestCommonPrefix: longestCommonPrefix
  }

  return Strings;

  function longestCommonPrefix (strings) {
    var strings = strings.slice(0).sort()
      , word1 = strings[0]
      , word2 = strings[strings.length - 1]
      , l = word1.length
      , i = 0;

    while(i < l && word1.charAt(i)=== word2.charAt(i)) i++;

    return word1.substring(0, i);
  }
});
