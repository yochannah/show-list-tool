define([], function () {
  
  var IS_BLANK = /^\s*$/;

  return {
    isEditable: isEditable,
    isAssignableTo: isAssignableTo,
    eq: eq,
    isBlank: IS_BLANK.test.bind(IS_BLANK)
  };

  function isEditable (c) {
    return c.editable;
  }

  function eq (prop, value) {
    return function (thing) {
      return thing && thing[prop] === value;
    };
  }

  function isAssignableTo (model, pathType, className) {
    var clazz = model.makePath(className);

    return clazz.isa(pathType);
  }

});
