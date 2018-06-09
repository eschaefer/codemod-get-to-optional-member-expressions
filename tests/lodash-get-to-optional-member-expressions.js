const test = require('ava');
const jscodeshift = require('jscodeshift');
const testCodemod = require('jscodeshift-ava-tester');
const codemod = require('../lodash-get-to-optional-member-expressions');

const { testChanged, testUnchanged } = testCodemod(jscodeshift, test, codemod);

/* NOTE: Cannot test for undefined elements, like...

  testChanged("import get from 'lodash.get';", '');

*/

testChanged("const foo = get(data, 'user');", 'const foo = data?.user;');

testChanged(
  "const foo = get(data.entries.more, 'user.cart', false);",
  'const foo = data?.entries?.more?.user?.cart || false;'
);

testChanged(
  "const foo = get(data, 'user.cart.id.another');",
  'const foo = data?.user?.cart?.id?.another;'
);

testChanged(
  "const foo = get(data, 'user.cart.id.another', false);",
  'const foo = data?.user?.cart?.id?.another || false;'
);

testChanged(
  "const foo = get(data, 'user.cart.id.another', {});",
  'const foo = data?.user?.cart?.id?.another || {};'
);

testChanged(
  "const foo = get(data, 'user.cart.id.another', 'bar');",
  "const foo = data?.user?.cart?.id?.another || 'bar';"
);

testChanged(
  "import { get, reduce, merge } from 'lodash';",
  "import { reduce, merge } from 'lodash';"
);

testChanged(
  "import { reduce, get, merge } from 'lodash-es';",
  "import { reduce, merge } from 'lodash-es';"
);

// Test things that should stay as is
testUnchanged("import _ from 'lodash';");
testUnchanged("import lodash from 'lodash';");
testUnchanged('const item = thing.that.was.there;');
