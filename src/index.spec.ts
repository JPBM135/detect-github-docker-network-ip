import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { main } from './index.js';

vi.mock('@actions/core');
vi.mock('@actions/exec');

const mockGetBooleanInput = core.getBooleanInput as Mock;
const mockGetExecOutput = exec.getExecOutput as Mock;

const mockDockerNetworks = `network1\nnetwork2\ngithub_network`;
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

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set the GitHub Actions network IP when found', async () => {
    mockGetBooleanInput.mockReturnValue(false);
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 0, stdout: mockDockerNetworks, stderr: '' });
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 0, stdout: mockInspectOutput, stderr: '' });

    await main();

    expect(core.setOutput).toHaveBeenCalledWith('github-network-ip', '192.168.1.1');
  });

  it('should fail when Docker network listing fails', async () => {
    mockGetBooleanInput.mockReturnValue(false);
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 1, stdout: '', stderr: 'error' });

    await main();

    expect(core.setFailed).toHaveBeenCalledWith('Failed to list all Docker networks: error');
  });

  it('should fail when Docker network inspection fails', async () => {
    mockGetBooleanInput.mockReturnValue(false);
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 0, stdout: mockDockerNetworks, stderr: '' });
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 1, stdout: '', stderr: 'error' });

    await main();

    expect(core.setFailed).toHaveBeenCalledWith('Failed to inspect network network1: error');
  });

  it('should fail in strict mode when GitHub Actions network is not found', async () => {
    mockGetBooleanInput.mockReturnValue(true);
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 0, stdout: 'network1\nnetwork2', stderr: '' });
    for (const _ of Array(2)) {
      mockGetExecOutput.mockResolvedValueOnce({
        exitCode: 0,
        stdout: JSON.stringify([
          {
            Name: 'network1',
            IPAM: {
              Config: [
                {
                  Gateway: '0.0.0.0',
                },
              ],
            },
          },
        ]),
        stderr: '',
      });
    }

    await main();

    expect(core.setFailed).toHaveBeenCalledWith('GitHub Actions network not found');
  });

  it('should warn when GitHub Actions network is not found and not in strict mode', async () => {
    mockGetBooleanInput.mockReturnValue(false);
    mockGetExecOutput.mockResolvedValueOnce({ exitCode: 0, stdout: 'network1\nnetwork2', stderr: '' });
    for (const _ of Array(2)) {
      mockGetExecOutput.mockResolvedValueOnce({
        exitCode: 0,
        stdout: JSON.stringify([
          {
            Name: 'network1',
            IPAM: {
              Config: [
                {
                  Gateway: '0.0.0.0',
                },
              ],
            },
          },
        ]),
        stderr: '',
      });
    }

    await main();

    expect(core.warning).toHaveBeenCalledWith('GitHub Actions network not found');
  });
});
