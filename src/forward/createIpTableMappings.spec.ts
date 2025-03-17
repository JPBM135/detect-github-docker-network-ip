import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { createIpTableRule } from './createIpTableMappings.js';
import type { PortMapping } from '../types.js';

vi.mock('@actions/exec');
vi.mock('@actions/core');
const mockExec = exec.exec as Mock;
const mockCoreDebug = core.debug as Mock;

const mockPortMapping: PortMapping = {
  host: {
    ip: 'localhost',
    port: 9090,
  },
  container: {
    ip: '192.168.1.1',
    port: 8080,
  },
};

describe('createIpTableRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an iptables rule successfully', async () => {
    mockExec.mockResolvedValue(0);
    await createIpTableRule(mockPortMapping);
    expect(mockExec).toHaveBeenCalledWith('iptables', [
      '-t',
      'nat',
      '-A',
      'PREROUTING',
      '-p',
      'tcp',
      '-d',
      mockPortMapping.host.ip,
      '--dport',
      String(mockPortMapping.host.port),
      '-j',
      'DNAT',
      '--to-destination',
      `${mockPortMapping.container.ip}:${mockPortMapping.container.port}`,
    ]);
    expect(mockCoreDebug).toHaveBeenCalledWith(
      `Created iptables rule: ${mockPortMapping.host.ip}:${mockPortMapping.host.port} -> ${mockPortMapping.container.ip}:${mockPortMapping.container.port}`,
    );
  });

  it('should throw an error if the iptables command fails', async () => {
    mockExec.mockResolvedValue(1);
    await expect(createIpTableRule(mockPortMapping)).rejects.toThrow(
      `Failed to create iptables rule: ${mockPortMapping.host.ip}:${mockPortMapping.host.port} -> ${mockPortMapping.container.ip}:${mockPortMapping.container.port}`,
    );
  });
});
