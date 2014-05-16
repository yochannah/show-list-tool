define(['react'], function (React) {

  var d = React.DOM;

  return sorry;

  function sorry (msg) {
    return d.div(
      {className: 'alert alert-info'},
      d.p(
        {},
        d.strong(null, 'Sorry'), ' ', msg));
  }
});
