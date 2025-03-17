import process from 'node:process';
import * as core from '@actions/core';
import { handleError } from './utils/errorHandler.js';
import { queryDockerNetworks } from './docker/queryNetworks.js';
import { inspectNetwork } from './docker/inspectNetwork.js';
import { discoverPorts } from './forward/discoverPorts.js';
import type { DockerNetwork } from './types.js';
import { createIpTableRule } from './forward/createIpTableMappings.js';

export async function main() {
  const STRICT = core.getBooleanInput('strict', { required: false, trimWhitespace: true });
  const HOST = core.getInput('host', { required: false, trimWhitespace: true }) || '127.0.0.1';
  const FORWARD_PORTS = core.getBooleanInput('forward-ports', { required: false, trimWhitespace: true });

  try {
    core.debug(`Inputs: ${JSON.stringify({ STRICT, HOST, FORWARD_PORTS }, null, 2)}`);

    core.debug('Querying Docker networks...');

    const networksList = await queryDockerNetworks();

    core.info('All Docker networks: \n' + networksList.join('\n'));

    let githubNetwork: DockerNetwork | null = null;
    let githubNetworkIp: string | null = null;

    for (const network of networksList) {
      if (!network.startsWith('github')) {
        core.debug(`Skipping network ${network}`);
        continue;
      }

      const inspectJson = await inspectNetwork(network);

      core.debug(`Network ${network} inspect: ${JSON.stringify(inspectJson, null, 2)}`);

      if (inspectJson?.Name?.startsWith('github')) {
        githubNetworkIp = inspectJson?.IPAM?.Config?.[0]?.Gateway ?? null;
        githubNetwork = inspectJson;

        if (!githubNetworkIp) {
          core.debug(`Failed to get GitHub Actions network IP for network ${network}`);
          throw new Error(`Failed to get GitHub Actions network IP for network ${network}`);
        }

        core.info(`Found GitHub Actions network: ${network} with IP: ${githubNetworkIp}`);
        break;
      }
    }

    if (!githubNetworkIp && STRICT) {
      core.error('Strict mode: GitHub Actions network not found');
      throw new Error('GitHub Actions network not found');
    } else if (!githubNetworkIp) {
      core.warning('GitHub Actions network not found');
      return;
    }

    core.setOutput('github-network-ip', githubNetworkIp);

    core.info('GitHub Actions network IP set to "github-network-ip"');

    if (!FORWARD_PORTS) {
      core.debug('Forwarding ports is disabled, skipping...');
      return;
    }

    if (!githubNetwork) {
      core.error('GitHub Actions network not found');
      throw new Error('GitHub Actions network not found, cannot forward ports');
    }

    core.debug('Forwarding ports is enabled, setting up port forwarding...');

    const discoveredPorts = await discoverPorts(HOST, githubNetwork);

    if (discoveredPorts.length === 0) {
      core.warning('No ports to forward');
      return;
    }

    core.info('Discovered port mappings: \n' + discoveredPorts.map((port) => JSON.stringify(port)).join('\n'));

    core.setOutput('port-mappings', JSON.stringify(discoveredPorts));

    core.info('Port mappings set to "port-mappings"');

    core.info('Creating iptables rules for port forwarding...');

    for (const port of discoveredPorts) {
      core.debug(`Forwarding port: ${port.host.ip}:${port.host.port} -> ${port.container.ip}:${port.container.port}`);
      await createIpTableRule(port);
    }

    core.info('Port forwarding rules created');
  } catch (error) {
    handleError(error);
  }
}

if (process.env.NODE_ENV !== 'test') {
  await main();
}
