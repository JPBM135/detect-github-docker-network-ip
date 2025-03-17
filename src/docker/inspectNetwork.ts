import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { DockerNetwork } from '../types.js';
import { safeJsonParse } from '../utils/safeJsonParse.js';

export async function inspectNetwork(network: string) {
  const inspect = await exec.getExecOutput('docker', ['network', 'inspect', network]);

  if (inspect.exitCode !== 0) {
    throw new Error(`Failed to inspect network ${network}: ${inspect.stderr}`);
  }

  const inspectJson = safeJsonParse<DockerNetwork[]>(inspect.stdout);

  if (!inspectJson) {
    throw new Error(`Failed to parse Docker network inspect JSON for network ${network}`);
  }

  if (inspectJson.length === 0) {
    core.debug(`Network inspect JSON for network ${network} is empty`);
    return null;
  }

  return inspectJson[0]!;
}
