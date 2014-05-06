define([], function () {
  'use strict';

  if (supports_html5_storage()) {
    return window.localStorage;
  } else {
    return {};
  }

  function supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }
});
