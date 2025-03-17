export interface DockerNetwork {
  Containers: {
    [key: string]: {
      Name: string;
    };
  };
  IPAM: {
    Config: {
      Gateway: string;
    }[];
  };
  Name: string;
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
  container: {
    ip: string;
    port: number;
  };
  host: {
    ip: string;
    port: number;
  };
}
