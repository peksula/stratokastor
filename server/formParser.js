
exports.formToResLocals = function (formFields, resLocals) {
    for (field in formFields) {
      if (formFields.hasOwnProperty(field)) {
        resLocals[field] = formFields[field];
      }
}};
