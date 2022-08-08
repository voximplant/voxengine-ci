import { describe } from 'mocha';
import { expect } from 'chai';
import { FileSystemContext } from '../../../lib/domains/contexts/filesystem.context';
const rewire = require('rewire');

describe('FileSystemContext', () => {
  const module = rewire('../../../lib/domains/contexts/filesystem.context.ts');
  const FileSystemContextRewired = module.__get__('FileSystemContext');
  describe('transform data', () => {
    it('should return transformed data', () => {
      const fileSystemContext = new FileSystemContextRewired('', '');
      const data = fileSystemContext.transformData(
        '[rules]\nstring="value"',
        'toml',
      );
      expect(data).to.equal('{"string":"value"}');
    });
  });
});
