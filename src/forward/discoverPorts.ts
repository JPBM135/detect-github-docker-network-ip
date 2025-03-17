import * as core from '@actions/core';
import { inspectContainer } from '../docker/inspectContainer.js';
import type { DockerNetwork, PortMapping } from '../types.js';

export async function discoverPorts(host: string, network: DockerNetwork): Promise<PortMapping[]> {
  const ports: PortMapping[] = [];

  for (const containerId of Object.keys(network.containers)) {
    const inspectedContainer = await inspectContainer(containerId);

    if (!inspectedContainer) {
      continue;
    }

    for (const [containerPort, hostPort] of Object.entries(inspectedContainer.NetworkSettings.Ports)) {
      const containerIp = network.IPAM.Config[0]!.Gateway;
      // The container port is in the format "8080/tcp", so we need to split it to get the actual port number
      const containerPortNumber = Number(containerPort.split('/')[0]);

      if (Number.isNaN(containerPortNumber)) {
        core.warning(`Failed to parse container port number from ${containerPort} (Container ID: ${containerId})`);
        continue;
      }

      for (const port of hostPort) {
        core.debug(`Discovered port mapping: ${host}:${port.HostPort} -> ${containerIp}:${containerPortNumber}`);

        console.log(inspectedContainer.NetworkSettings.Ports);
        ports.push({
          host: {
            ip: host,
            port: Number(port.HostPort),
          },
          container: {
            ip: containerIp,
            port: containerPortNumber,
          },
        });
      }
    }
  }

  return ports;
}
