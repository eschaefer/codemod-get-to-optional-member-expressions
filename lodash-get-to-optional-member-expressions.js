module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const removeLodashDefaultImports = () =>
    root
      .find(j.ImportDeclaration)
      .filter(path => path.node.source.value === 'lodash.get')
      .forEach(path => j(path).remove());

  const removeLodashNamedImports = () =>
    root
      .find(j.ImportDeclaration)
      .filter(
        path =>
          path.node.source.value === 'lodash' ||
          path.node.source.value === 'lodash-es'
      )
      .forEach(path => {
        if (path.node.specifiers.some(s => s.imported)) {
          const filteredSpecs = path.node.specifiers.filter(
            s => s.imported.name !== 'get'
          );
          let newPath = { node: path.node };
          newPath.node.specifiers = filteredSpecs;

          j(path).replaceWith(newPath.node);
        }
      });

  let membersVisited = 0;
  const memberBuilder = expressions => {
    memExs = [];

    membersVisited++;

    if (membersVisited <= expressions.length) {
      const name = expressions[membersVisited - 1];

      // Find deeper properties
      if (membersVisited !== expressions.length - 1) {
        return j.optionalMemberExpression(
          memberBuilder(expressions),
          j.identifier(name)
        );
      }

      // Last member expression
      membersVisited = 0;
      return j.optionalMemberExpression(
        j.identifier(expressions[expressions.length - 1]),
        j.identifier(name)
      );
    }

    return;
  };

  let memExs = [];
  const getAllMemberExpressions = expression => {
    if (expression.object) {
      memExs.push(expression.property.name);
      getAllMemberExpressions(expression.object);
    } else {
      memExs.push(expression.name);
    }

    return memExs.reverse();
  };

  const handleExpression = path => {
    const ex = path.value.arguments[0];
    let base = {};

    if (ex.type === 'MemberExpression') {
      base = getAllMemberExpressions(ex);
    } else {
      base = [path.value.arguments[0].name];
    }

    const pathParts = path.value.arguments[1].value.split('.');
    const defaultValue = path.value.arguments[2] || undefined;
    const fullExpressionPath = [...base].concat(pathParts).reverse();
    const node = memberBuilder(fullExpressionPath);

    let newPath = {};

    if (defaultValue !== undefined) {
      const operator = '||';
      const left = node;
      const right = defaultValue;
      const logicalExpression = j.logicalExpression(operator, left, right);

      newPath = {
        ...path,
        node: logicalExpression,
      };
    } else {
      newPath = { ...path, node };
    }

    j(path).replaceWith(newPath.node);
  };

  const transformGetExpressions = () =>
    root
      .find(j.CallExpression)
      .filter(e => e.value.callee.name === 'get')
      .forEach(handleExpression);

  removeLodashNamedImports();
  removeLodashDefaultImports();
  transformGetExpressions();

  return root.toSource();
};
