import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePayfastSignature } from './payfast.js';

describe('generatePayfastSignature', () => {
  it('uses PayFast form encoding for special characters and spaces', () => {
    const data = {
      merchant_id: '10000100',
      merchant_key: '46f0cd694581a',
      item_name: "Maths! 'Basics' (R100)*~",
    };

    assert.equal(
      generatePayfastSignature(data, 'demo pass!'),
      '5b8bcb12071199efad2e97241e9a9679',
    );
  });

  it('preserves parameter order and omits blank values', () => {
    const signature = generatePayfastSignature({ first: 'one', blank: '', second: 'two' }, null);

    assert.equal(signature, generatePayfastSignature({ first: 'one', second: 'two' }, null));
    assert.notEqual(signature, generatePayfastSignature({ second: 'two', first: 'one' }, null));
  });
});
