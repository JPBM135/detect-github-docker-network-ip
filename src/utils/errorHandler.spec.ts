import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as core from '@actions/core';
import { handleError } from './errorHandler.js';

vi.mock('@actions/core');

const mockSetFailed = core.setFailed as Mock;
const mockDebug = core.debug as Mock;

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log the error and set the action as failed with the error message', () => {
    const error = new Error('test error');

    handleError(error);

    expect(mockDebug).toHaveBeenCalledWith(String(error));
    expect(mockSetFailed).toHaveBeenCalledWith('test error');
  });

  it('should set the action as failed with a generic message if the error has no message', () => {
    const error = {};

    handleError(error);

    expect(mockDebug).toHaveBeenCalledWith(String(error));
    expect(mockSetFailed).toHaveBeenCalledWith(
      'An unexpected error occurred. Please contact the package maintainer if the problem persists.',
    );
  });
});
