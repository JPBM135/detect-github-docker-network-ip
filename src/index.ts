import process from 'node:process';
import * as core from '@actions/core';
import { queryDockerNetworks, inspectNetwork } from './utils/dockerUtils.js';
import { handleError } from './utils/errorHandler.js';

export async function main() {
  const STRICT = core.getBooleanInput('strict', { required: false, trimWhitespace: true });

  try {
    core.debug(`Inputs: ${JSON.stringify({ STRICT }, null, 2)}`);

    core.debug('Querying Docker networks...');

    const networksList = await queryDockerNetworks();

    core.info('All Docker networks: \n' + networksList.join('\n'));

    let githubNetworkIp = null;

    for (const network of networksList) {
      if (!network.startsWith('github')) {
        core.debug(`Skipping network ${network}`);
        continue;
      }

      const inspectJson = await inspectNetwork(network);

      core.debug(`Network ${network} inspect: ${JSON.stringify(inspectJson, null, 2)}`);

      if (inspectJson[0]?.Name?.startsWith('github')) {
        githubNetworkIp = inspectJson[0]?.IPAM?.Config?.[0]?.Gateway;

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
  } catch (error) {
    handleError(error);
  }
}

if (process.env.NODE_ENV !== 'test') {
  await main();
}
