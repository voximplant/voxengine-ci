import { FileSystemContext } from '../../../../lib/domains/contexts/file-system.context';
import { expect } from 'chai';
import { describe } from 'mocha';

describe('', () => {
  describe('transform data', () => {
    it('should return transformed data', () => {
      const fileSystemContext = new FileSystemContext('', '');
      const data = fileSystemContext['transformData'](
        '[rules]\nstring="value"',
        'toml',
      );
      expect(data).to.equal('{"string":"value"}');
    });
  });
});
