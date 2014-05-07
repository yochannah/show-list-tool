define(['react', 'underscore', './strings'],
    function (React, _, strings) {
  'use strict';

  var d = React.DOM;

  var formatters = {};

  formatters.Location = React.createClass({

    displayName: 'LocationFormatter',

    render: function () {
      var data = mapPathsToValues(this.props);
      return d.div(null, d.code(null, data['locatedOn.primaryIdentifier'], ':', data.start, '..', data.end));
    }
  });

  formatters.DataSet = React.createClass({

    displayName: 'DataSetFormatter',

    render: function () {
      var data = mapPathsToValues(this.props);

      return d.div(
        null,
        d.h5(
          null,
          d.strong(
            null,
            data.name)),
        d.p(
          null,
          d.a(
            {href: data.url},
            data.url)));
    }

  });
  
  // Share the same fields. Get the same formatter.
  formatters.DataSource = formatters.DataSet;

  formatters.GOAnnotation = React.createClass({

    displayName: 'GOAnnotationFormatter',

    render: function () {
      
      var data = mapPathsToValues(this.props);

      return d.div(
        null,
        d.span(null, (data['subject.name'] || data['subject.symbol'] || data['subject.secondaryIdentifier'])),
        d.div(
          {title: 'annotated with'},
          d.i({className: 'fa fa-arrows-h'})),
        d.span(null, data['ontologyTerm.identifier'], ' (', data['ontologyTerm.name'], ')'));
    }

  });

  formatters.OntologyTerm = React.createClass({

    displayName: 'OntologyTermFormatter',

    render: function () {
      
      var data = mapPathsToValues(this.props);
      var charLimit = 200;

      var desc = data.description.length > charLimit ? data.description.slice(0, charLimit - 3) + '...' : data.description;

      return d.div(
        null,
        d.h5(
          null,
          d.strong(
            null,
            data.identifier, ' ', data.name)),
        d.p(null, desc));
    }
  });

  formatters.Publication = React.createClass({

    displayName: 'PublicationFormatter',

    render: function () {
      var data = mapPathsToValues(this.props);
      return d.div(
        null,
        d.h5(null, d.strong(null, data.firstAuthor + ' (' + data.year + ')')),
        d.p(
          null,
          d.em(
            null,
            data.title)),
        d.p(
          null,
          data.journal + ' ' + data.volume + ' ' + data.pages),
        d.p(
          null,
          d.a(
            {href: "http://www.ncbi.nlm.nih.gov/pubmed/" + data.pubMedId},
            "View at PubMed")));
    }
  });

  return formatters;

  function mapPathsToValues (props) {
    var ret = {};
    var prefix = strings.longestCommonPrefix(props.view);
    var columns = props.view.map(function (view) {
      return view.slice(prefix.length);
    });
    return _.object(columns, props.item);
  }
});
