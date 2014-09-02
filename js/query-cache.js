define([], function () {

  var caches = {};

  function Cache(method) {
    this.method = method;
    this._store = {};
  }

  /** xml -> Promise<Result> **/
  Cache.prototype.submit = function submit (query) {
    var xml = query.toXML();
    var current = this._store[xml];
    if (current) {
      return current;
    } else {
      return this._store[xml] = query[this.method]();
    }
  };

  return {getCache: getCache};

  function getCache (method) {
    return caches[method] || (caches[method] = new Cache(method));
  }

});
