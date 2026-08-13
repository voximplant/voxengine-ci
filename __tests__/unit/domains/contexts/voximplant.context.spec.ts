import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
  isCredentialsFileParseError,
  VoximplantContext,
} from '../../../../lib/domains/contexts/voximplant.context';

describe('VoximplantContext', () => {
  describe('isCredentialsFileParseError', () => {
    it('should return true for invalid JSON syntax errors', () => {
      expect(
        isCredentialsFileParseError(
          new SyntaxError('Unexpected token in JSON input at position 0'),
        ),
      ).to.be.true;
      expect(
        isCredentialsFileParseError(new SyntaxError('is not valid JSON')),
      ).to.be.true;
    });

    it('should return false for other errors', () => {
      expect(isCredentialsFileParseError(new Error('ENOENT'))).to.be.false;
    });
  });

  it('should be constructible with credentials and host', () => {
    const context = new VoximplantContext(
      'vox_ci_credentials.json',
      'custom.api.example',
    );

    expect(context).to.be.instanceOf(VoximplantContext);
  });
});
