import * as exec from '@actions/exec';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { queryDockerNetworks } from './queryNetworks.js';

vi.mock('@actions/exec');

const mockExec = exec.getExecOutput as Mock;

const mockNetworks = ['network1', 'network2'];

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
