const { setValueByPath } = require("./functional-utils");

module.exports.contextSetter = function contextSetter(command, context, data) {
  if (!command?.contextPath) {
    return;
  }

  setValueByPath(
    command.contextPath,
    command.globalContext ? context : context[command.name],
    data
  );
};
