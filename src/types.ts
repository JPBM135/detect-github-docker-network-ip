export interface DockerNetwork {
  Name: string;
  IPAM: {
    Config: {
      Gateway: string;
    }[];
  };
  containers: {
    [key: string]: {
      Name: string;
    };
  };
}

export interface DockerContainer {
  Id: string;
  Names: string[];
  NetworkSettings: {
    Ports: {
      [key: string]: {
        // e.g. "8080/tcp"
        HostIp: string;
        HostPort: string;
      }[];
    };
  };
}

export interface PortMapping {
  host: {
    ip: string;
    port: number;
  };
  container: {
    ip: string;
    port: number;
  };
}
