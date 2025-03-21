import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { PortMapping } from '../types.js';
import { createIpTableRule } from './createIpTableMappings.js';

vi.mock('@actions/exec');
vi.mock('@actions/core');
const mockExec = exec.exec as Mock;
const mockCoreDebug = core.debug as Mock;

const mockPortMapping: PortMapping = {
  host: {
    ip: 'localhost',
    port: 9_090,
  },
  container: {
    ip: '192.168.1.1',
    port: 8_080,
  },
};

describe('createIpTableRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an iptables rule successfully', async () => {
    mockExec.mockResolvedValue(0);
    await createIpTableRule(mockPortMapping);
    expect(mockExec).toHaveBeenCalledWith('sudo', [
      'iptables',
      '-t',
      'nat',
      '-A',
      'OUTPUT',
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
