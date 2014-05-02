define([], function () {

  var ComputableState = {
    componentWillMount: onPropChange,
    componentWillReceiveProps: onPropChange
  };

  return {ComputableState: ComputableState};

  function onPropChange (props) {
    props = (props || this.props);
    this.computeState(props);
  }
});
