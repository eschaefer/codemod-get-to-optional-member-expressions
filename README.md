## codemod-get-to-optional-member-expressions

This repository contains a codemod script for use with
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Overview

The codemod replaces calls to Lodash's [get](https://lodash.com/docs#get) method with the native [optional chaining proposal](https://claudepache.github.io/es-optional-chaining/) for ECMAScript. This is a novel new way to reliably access deeply nested object properties, and can be used now with [@babel/plugin-proposal-optional-chaining](https://new.babeljs.io/docs/en/next/babel-plugin-proposal-optional-chaining.html).

```javascript
const foo = get(data, 'crate.box.present.wrapping.color');
const bar = get(data, 'crate.box.present.wrapping.color', 'green');

// 👇 Becomes 👇

const foo = data?.crate?.box?.present?.wrapping?.color;
const bar = data?.crate?.box?.present?.wrapping?.color || 'green';
```

### Setup & Run

```sh
npm install -g jscodeshift
git clone https://github.com/eschaefer/codemod-get-to-optional-member-expressions.git
cd codemod-get-to-optional-member-expressions/
jscodeshift -t ./lodash-get-to-optional-member-expressions.js <file(s)>
```

Use the `-d` option for a dry-run and use `-p` to print the output for
comparison.

Run tests for this codemod

```sh
npm run test
```

### TODO

- Add support for `require`;
- Add support for string literal member expressions
- Add support for array paths
