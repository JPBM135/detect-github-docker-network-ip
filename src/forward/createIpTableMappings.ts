import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { PortMapping } from '../types.js';

export async function createIpTableRule(portMapping: PortMapping) {
  const { host, container } = portMapping;

  const code = await exec.exec('nft', [
    'add',
    'rule',
    'ip',
    'nat', // Add the rule to the NAT table
    'PREROUTING', // Add the rule to the PREROUTING chain (packets are processed before a routing decision)
    'tcp',
    'daddr',
    host.ip, // With a destination address of the host IP
    'dport',
    String(host.port), // And a destination port of the host port
    'dnat',
    'to',
    `${container.ip}:${container.port}`, // Redirect the packet to the container IP and port
  ]);

  if (code !== 0) {
    throw new Error(`Failed to create nftables rule: ${host.ip}:${host.port} -> ${container.ip}:${container.port}`);
  }

  core.debug(`Created nftables rule: ${host.ip}:${host.port} -> ${container.ip}:${container.port}`);
}
