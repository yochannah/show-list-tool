define(function (module, exports, require) {

  var _ = require('underscore');
  var Q = require('q');
  var Caches = require('../query-cache');

  var repos = {};

  //---- Get a repository that will fetch objects.
  exports.getRepository = function (service) {
    var key = service.root;
    if (repos[key]) {
      return repos[key];
    }
    return (repos[key] = new Repository(service));
  };

  //---- Private

  //-- Constructor
  function Repository (service) {
    this._service = service;
    this._pending = [];
  }

  // Fetch all the objects in as few queries as possible,
  // and resolve all the promises.
  // This function is debounced by 250ms so that objects will be fetched in batches.
  Repository.prototype._fetchPending = _.debounce(function () {
    var service = this._service;
    var byType = _.indexBy(this._pending, 'type');
    var cache = Caches.getCache('records');
    byType.forEach(function (group, type) {
      var query = {
        from: type,
        select: ['*'],
        where: [{path: type, op: 'IN', ids: group.map(getId)}]
      };
      service.query(query)
             .then(cache.submit.bind(cache))
             .then(function (records) {
               var foundById = _.indexBy(records, 'objectId');
               var getFound = function (pending) { return foundById[getId(pending)]; };
               group.forEach(respondToPending.bind(null, getFound));
             });
    this.pending = [];

    });
  }, 250);

  // Schedule an object for fetching, and arrange for the fetch
  // to happen. Return a promise for the fetched object.
  Repository.prototype.fetchObject = function (obj, filter) {
    var deferred = Q.defer();
    this._pending.push({
      object: obj,
      filter: filter,
      deferred: deferred
    });
    this._fetchPending();
    return deferred.promise;
  };

  function getId (pending) {
    return pending.object.id;
  }

  function respondToPending (get, pending) {
    var found = get(pending);
    if (found) {
      if (!pending.filter || pending.filter(found)) {
        return pending.deferred.resolve(found);
      } else {
        return pending.deferred.reject(new Error(found.objectId + ': Found but rejected by filter'));
      }
    } else {
      return pending.deferred.reject(new Error(pending.object.id + ': not found'));
    }
  }

});
