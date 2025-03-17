import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function ensureIpTablesLegacy() {
  const code = await exec.exec('update-alternatives', ['--set', 'iptables', '/usr/sbin/iptables-legacy']);

  if (code !== 0) {
    throw new Error('Failed to set iptables to legacy mode');
  }

  core.info('iptables set to legacy mode');
}
