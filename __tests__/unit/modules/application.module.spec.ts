import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

describe('first unit tests ', () => {
  beforeEach(() => {
    console.info('unit tests are in development');
  });
  it(`check the voxengine-ci is awesome!`, async () => {
    const expectedResult = 'voxengine-ci is awesome!';
    expect(expectedResult).to.equal('voxengine-ci is awesome!');
  });
});
