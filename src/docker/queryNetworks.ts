import * as exec from '@actions/exec';

export async function queryDockerNetworks() {
  const allDockerNetworks = await exec.getExecOutput('docker', ['network', 'ls', '--format', '{{.Name}}']);

  if (allDockerNetworks.exitCode !== 0) {
    throw new Error(`Failed to list all Docker networks: ${allDockerNetworks.stderr}`);
  }

  return allDockerNetworks.stdout.split('\n').filter(Boolean) as string[];
}
