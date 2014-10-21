define([], function () {

  var caches = {};

  function Cache(method, service) {
    this.method = method;
    this._store = {};
    this.service = service;
  }

  /** xml -> Promise<Result> **/
  Cache.prototype.submit = function submit (query) {
    var key, current;
    if (this.method === 'findById') {
      key = query.type + '@' + query.id;
    } else {
      key = query.toXML();
    }
    var current = this._store[key];
    if (current) {
      return current;
    } else if (this.method === 'findById') {
      return this._store[key] = this.service.findById(query.type, query.id);
    } else {
      return this._store[key] = query[this.method]();
    }
  };

  return {getCache: getCache};

  function getCache (method, service) {
    var key = method;
    if (service != null) {
      key += service.root;
    }
    return caches[key] || (caches[key] = new Cache(method, service));
  }

});
