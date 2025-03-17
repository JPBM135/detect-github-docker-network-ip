import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { ensureIpTablesLegacy } from './ensureIptablesLegacy.js';

vi.mock('@actions/exec');
vi.mock('@actions/core');

const mockExec = exec.exec as Mock;
const mockCoreInfo = core.info as Mock;

describe('ensureIpTablesLegacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set iptables to legacy mode successfully', async () => {
    mockExec.mockResolvedValue(0);
    await ensureIpTablesLegacy();
    expect(mockExec).toHaveBeenCalledWith('update-alternatives', ['--set', 'iptables', '/usr/sbin/iptables-legacy']);
    expect(mockCoreInfo).toHaveBeenCalledWith('iptables set to legacy mode');
  });

  it('should throw an error if the command fails', async () => {
    mockExec.mockResolvedValue(1);
    await expect(ensureIpTablesLegacy()).rejects.toThrow('Failed to set iptables to legacy mode');
  });
});
