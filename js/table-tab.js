define(['react', './mixins', './table-heading', './table-body', './pager', './edit-controls'],
    function (React, mixins, TableHeading, TableBody, Pager, EditControls) {

  var TableTab = React.createClass({

    displayName: 'TableTab',

    getInitialState: function () {
      return {
        offset: 0,
        size: 25,
        total: 0,
        selected: {},
        query: {select: []}
      };
    },

    mixins: [mixins.SetStateProperty, mixins.ComputableState],

    computeState: function (props) {
      var that = this
        , type = props.list.type
        , query = {from: type, where: [{path: type, op: 'IN', value: props.list.name}]};

      props.service.fetchSummaryFields().then(function (sfs) {
        query.select = ['id'].concat(sfs[type]);
        that.setStateProperty('query', query);
      });

    },

    render: function () {
      return React.DOM.div(
          null,
          React.createElement(EditControls,{
            selected: this.state.selected
          }),
          React.createElement(Pager,{
            offset: this.state.offset,
            size: this.state.size,
            length: this.state.total,
            selected: this.state.selected,
            onAllSelected: this._onAllSelected,
            back: this._goBack,
            next: this._goNext
          }),
          React.DOM.table(
            {className: 'table table-striped'},
            React.createElement(TableHeading,{
              service: this.props.service,
              view: this.state.query.select,
              allSelected: this.state.selected.all,
              onChangeAll: this._onAllSelected
            }),
            React.createElement(TableBody,{
              offset: this.state.offset,
              size: this.state.size,
              service:    this.props.service,
              filterTerm: this.props.filterTerm,
              query:      this.state.query,
              selected:   this.state.selected,
              onItemSelected: this._selectItem,
              onCount:    this.setStateProperty.bind(this, 'total')
            })));
    },

    _selectItem: function (id, isSelected) {
      var state = this.state;
      state.selected[id] = isSelected;
      this.setState(state);
    },

    _onAllSelected: function (isSelected) {
      this._selectItem('all', isSelected);
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
