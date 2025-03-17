import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { DockerContainer } from '../types.js';
import { safeJsonParse } from '../utils/safeJsonParse.js';

export async function inspectContainer(containerId: string) {
  const inspect = await exec.getExecOutput('docker', ['inspect', containerId]);

  if (inspect.exitCode !== 0) {
    throw new Error(`Failed to inspect container ${containerId}: ${inspect.stderr}`);
  }

  const containerJson = safeJsonParse<DockerContainer[]>(inspect.stdout);

  if (!containerJson) {
    throw new Error(`Failed to parse Docker container inspect JSON for container ${containerId}`);
  }

  if (containerJson.length === 0) {
    core.debug(`Container inspect JSON for container ${containerId} is empty`);
    return null;
  }

  return containerJson[0]!;
}
