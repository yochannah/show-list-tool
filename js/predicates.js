define([], function () {

  return {
    isEditable: isEditable,
    isAssignableTo: isAssignableTo
  };

  function isEditable (c) {
    return c.editable;
  }

  function isAssignableTo (model, pathType, className) {
    var clazz = model.makePath(className);

    return clazz.isa(pathType);
  }

});
