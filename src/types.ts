export interface DockerNetwork {
  Name: string;
  IPAM: {
    Config: {
      Gateway: string;
    }[];
  };
}
