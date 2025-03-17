import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as exec from '@actions/exec';
import { queryDockerNetworks, inspectNetwork } from './dockerUtils.js';
import { safeJsonParse } from './safeJsonParse.js';
import type { DockerNetwork } from '../types.js';

vi.mock('@actions/exec');

const mockExec = exec.getExecOutput as Mock;

const mockNetworks = ['network1', 'network2'];
const mockInspectOutput = JSON.stringify([
  {
    Name: 'github_network',
    IPAM: {
      Config: [
        {
          Gateway: '192.168.1.1',
        },
      ],
    },
  },
]);

const mockDockerNetwork: DockerNetwork[] = safeJsonParse<DockerNetwork[]>(mockInspectOutput) || [];

describe('queryDockerNetworks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a list of Docker networks', async () => {
    mockExec.mockResolvedValue({
      exitCode: 0,
      stdout: mockNetworks.join('\n'),
      stderr: '',
    });

    const result = await queryDockerNetworks();
    expect(result).toEqual(mockNetworks);
  });

  it('should throw an error if the command fails', async () => {
    mockExec.mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'error',
    });

    await expect(queryDockerNetworks()).rejects.toThrow('Failed to list all Docker networks: error');
  });
});

describe('inspectNetwork', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the inspect JSON of a Docker network', async () => {
    mockExec.mockResolvedValue({
      exitCode: 0,
      stdout: mockInspectOutput,
      stderr: '',
    });

    const result = await inspectNetwork('github_network');
    expect(result).toEqual(mockDockerNetwork);
  });

  it('should throw an error if the command fails', async () => {
    mockExec.mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'error',
    });

    await expect(inspectNetwork('github_network')).rejects.toThrow('Failed to inspect network github_network: error');
  });

  it('should throw an error if the JSON parsing fails', async () => {
    mockExec.mockResolvedValue({
      exitCode: 0,
      stdout: 'invalid json',
      stderr: '',
    });

    await expect(inspectNetwork('github_network')).rejects.toThrow(
      'Failed to parse Docker network inspect JSON for network github_network',
    );
  });
});
