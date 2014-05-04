define(['react', './mixins', './table-heading', './table-body', './pager'],
    function (React, mixins, TableHeading, TableBody, Pager) {

  var TableTab = React.createClass({

    displayName: 'TableTab',

    getInitialState: function () {
      return {
        offset: 0,
        size: 25,
        total: 0,
        query: {select: []}
      };
    },

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    computeState: function (props) {
      var that = this
        , type = props.list.type
        , query = {from: type, where: [{path: type, op: 'IN', value: props.list.name}]};

      props.service.fetchSummaryFields().then(function (sfs) {
        query.select = sfs[type];
        that.setState({query: query});
      });

    },
    
    render: function () {
      return React.DOM.div(
          null,
          Pager({
            offset: this.state.offset,
            size: this.state.size,
            length: this.state.total,
            back: this._goBack,
            next: this._goNext
          }),
          React.DOM.table(
            {className: 'table table-striped'},
            TableHeading({
              service: this.props.service,
              view: this.state.query.select
            }),
            TableBody({
              offset: this.state.offset,
              size: this.state.size,
              service:    this.props.service,
              filterTerm: this.props.filterTerm,
              query:      this.state.query,
              onCount:    this.setStateProperty.bind(this, 'total')
            })));
    },

    _goBack: function () {
      this.setStateProperty('offset', Math.max(0, this.state.offset - this.state.size));
    },

    _goNext: function () {
      var next = this.state.offset + this.state.size;
      if (next < this.state.total) {
        this.setStateProperty('offset', next);
      }
    }

  });

  return TableTab;
});

