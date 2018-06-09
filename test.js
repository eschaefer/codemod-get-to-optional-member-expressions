import { get, reduce, merge } from 'lodash';

const data = {
  user: {
    cart: {
      id: 'hi',
    },
  },
};

function test(a) {
  return a;
}

const extractedFirst = get(data, 'user.cart.id.another', false);
const extractedSecond = get(data, 'user.cart.another');
const extractedThird = get(data, 'user.cart.id', false);

const another = () => '';
const thing = test('hi');

const simple = data.user.cart.id;
//const complex = data?.user?.cart?.id;
