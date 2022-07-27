module.exports.logErrorContext = function (name, context, error) {
  if (!name) {
    throw new Error("Context name is required");
  }

  console.groupCollapsed(`Error context`);

  console.log("Name: ", name);

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }

  error && console.error(error);
  console.groupEnd();
};

module.exports.pipeLine = function pipeLine(...args) {
  return args.reduce((acc, arg) => {
    if (typeof arg !== "function") {
      return arg;
    }

    return arg(acc);
  }, undefined);
};

module.exports.setValueByPath = function setValueByPath(path, obj, value) {
  const pathParts = path.split(".");

  let currentContext = obj;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const pathPart = pathParts[i];

    if (!currentContext[pathPart]) {
      currentContext[pathPart] = {};
    }

    currentContext = currentContext[pathPart];
  }

  currentContext[pathParts[pathParts.length - 1]] = value;
};
