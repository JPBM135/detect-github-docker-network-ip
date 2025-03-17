import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as exec from '@actions/exec';
import { inspectContainer } from './inspectContainer.js';
import { safeJsonParse } from '../utils/safeJsonParse.js';
import type { DockerContainer } from '../types.js';

vi.mock('@actions/exec');
const mockExec = exec.getExecOutput as Mock;

const mockInspectOutput = JSON.stringify([
  {
    Id: 'container_id',
    Name: 'github_container',
    State: {
      Status: 'running',
    },
  },
]);

const mockDockerContainer: DockerContainer[] = safeJsonParse<DockerContainer[]>(mockInspectOutput) || [];

describe('inspectContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the inspect JSON of a Docker container', async () => {
    mockExec.mockResolvedValue({
      exitCode: 0,
      stdout: mockInspectOutput,
      stderr: '',
    });
    const result = await inspectContainer('container_id');
    expect(result).toEqual(mockDockerContainer[0]);
  });

  it('should throw an error if the command fails', async () => {
    mockExec.mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'error',
    });
    await expect(inspectContainer('container_id')).rejects.toThrow('Failed to inspect container container_id: error');
  });

  it('should throw an error if the JSON parsing fails', async () => {
    mockExec.mockResolvedValue({
      exitCode: 0,
      stdout: 'invalid json',
      stderr: '',
    });
    await expect(inspectContainer('container_id')).rejects.toThrow(
      'Failed to parse Docker container inspect JSON for container container_id',
    );
  });
});
