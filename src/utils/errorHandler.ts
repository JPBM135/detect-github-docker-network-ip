import * as core from '@actions/core';

export function handleError(error: unknown) {
  core.debug(String(error));

  if ((error as Error).message) {
    core.setFailed((error as Error).message);
  } else {
    core.setFailed('An unexpected error occurred. Please contact the package maintainer if the problem persists.');
  }
}
