define([], function () {

  function Cache(method) {
    this.method = method;
    this._store = {};
  }

  Cache.prototype.submit = function submit (query) {
    var xml = query.toXML();
    var current = this._store[xml];
    if (current) {
      return current;
    } else {
      return this._store[xml] = query[this.method]();
    }
  };

  var caches = {};

  function getCache (method) {
    return caches[method] || (caches[method] = new Cache(method));
  }

  return {getCache: getCache};

});
