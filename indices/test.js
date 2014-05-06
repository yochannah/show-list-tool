var chan = Channel.build({
  window: window.document.getElementById('child').contentWindow,
  origin: '*',
  scope: 'CurrentStep'
});

chan.call({
  method: 'init',
  params: {
    listName: 'PL FlyTF_putativeTFs',
    service: {
      root: "http://www.flymine.org/query"
    }
  },
  success: function () {
    console.log("Tool initialised");
  }
});

