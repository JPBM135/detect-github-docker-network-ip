import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import * as core from '@actions/core';
import { inspectContainer } from '../docker/inspectContainer.js';
import { discoverPorts } from './discoverPorts.js';
import type { DockerNetwork, PortMapping } from '../types.js';

vi.mock('@actions/core');
vi.mock('../docker/inspectContainer.js');
const mockInspectContainer = inspectContainer as Mock;
const mockCoreWarning = core.warning as Mock;
const mockCoreDebug = core.debug as Mock;

const mockNetwork: DockerNetwork = {
  Name: 'github_network',
  IPAM: {
    Config: [
      {
        Gateway: '192.168.1.1',
      },
    ],
  },
  containers: {
    container_id: {
      Name: 'github_container',
    },
  },
};

const mockInspectedContainer = {
  NetworkSettings: {
    Ports: {
      '8080/tcp': [{ HostPort: '9090' }],
    },
  },
};

describe('discoverPorts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the port mappings of a Docker network', async () => {
    mockInspectContainer.mockResolvedValue(mockInspectedContainer);
    const result = await discoverPorts('localhost', mockNetwork);
    const expected: PortMapping[] = [
      {
        host: {
          ip: 'localhost',
          port: 9090,
        },
        container: {
          ip: '192.168.1.1',
          port: 8080,
        },
      },
    ];
    expect(result).toEqual(expected);
  });

  it('should handle invalid container port numbers', async () => {
    const invalidInspectedContainer = {
      NetworkSettings: {
        Ports: {
          'invalid/tcp': [{ HostPort: '9090' }],
        },
      },
    };
    mockInspectContainer.mockResolvedValue(invalidInspectedContainer);
    await discoverPorts('localhost', mockNetwork);
    expect(mockCoreWarning).toHaveBeenCalledWith(
      'Failed to parse container port number from invalid/tcp (Container ID: container_id)',
    );
  });

  it('should handle missing inspected container', async () => {
    mockInspectContainer.mockResolvedValue(null);
    const result = await discoverPorts('localhost', mockNetwork);
    expect(result).toEqual([]);
  });
});
