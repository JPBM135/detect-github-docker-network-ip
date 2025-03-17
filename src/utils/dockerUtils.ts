import * as exec from '@actions/exec';
import { safeJsonParse } from './safeJsonParse.js';
import type { DockerNetwork } from '../types.js';

export async function queryDockerNetworks() {
  const allDockerNetworks = await exec.getExecOutput('docker', ['network', 'ls', '--format', '{{.Name}}']);

  if (allDockerNetworks.exitCode !== 0) {
    throw new Error(`Failed to list all Docker networks: ${allDockerNetworks.stderr}`);
  }

  return allDockerNetworks.stdout.split('\n').filter(Boolean);
}

export async function inspectNetwork(network: string) {
  const inspect = await exec.getExecOutput('docker', ['network', 'inspect', network]);

  if (inspect.exitCode !== 0) {
    throw new Error(`Failed to inspect network ${network}: ${inspect.stderr}`);
  }

  const inspectJson = safeJsonParse<DockerNetwork[]>(inspect.stdout);

  if (!inspectJson) {
    throw new Error(`Failed to parse Docker network inspect JSON for network ${network}`);
  }

  return inspectJson;
}
