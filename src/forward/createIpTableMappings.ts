import * as core from '@actions/core';
import * as exec from '@actions/exec';
import type { PortMapping } from '../types.js';

export async function createIpTableRule(portMapping: PortMapping) {
  const { host, container } = portMapping;

  const code = await exec.exec('sudo', [
    'iptables',
    '-t',
    'nat', // Create a rule in the NAT table
    '-A',
    'PREROUTING', // Append the rule to the PREROUTING chain
    '-p',
    'tcp', // Match TCP packets
    '-d',
    host.ip, // Destination IP address
    '--dport',
    String(host.port), // Destination port
    '-j',
    'DNAT', // Destination NAT
    '--to-destination',
    `${container.ip}:${container.port}`, // New destination IP and port
  ]);

  if (code !== 0) {
    throw new Error(`Failed to create iptables rule: ${host.ip}:${host.port} -> ${container.ip}:${container.port}`);
  }

  core.debug(`Created iptables rule: ${host.ip}:${host.port} -> ${container.ip}:${container.port}`);
}
