<span>
  <img style="border-radius: 6px" align="right" width="95" src="https://i.imgur.com/1tUj131.jpg"></img>
  <h1 align="left">Detect GitHub Docker Network</h1>
</span>

This project is designed to detect the network of a GitHub Docker container. This can be specially useful for self-hosted runners, as they may not have access to the host network.

This in detail, will extract the `Gateway` IP from the `github_network_*` bridge network, which is the network that GitHub Actions uses to run Docker containers. This IP can be useful to, for example, connect to a database!

> [!NOTE]
> This is not default behavior, in a perfect world, you should be able to connect to the host network using port declaration. However, this is not always possible, and this action can be a workaround.

## Inputs

### `strict`

**Description:** Whether to fail the action if a network IP cannot be detected.

| **Type:** | **Required:** | **Default:** |
| --------- | ------------- | ------------ |
| Boolean   | No            | false        |

### `forward-ports`

**Description:** If the action should forward from the GitHub Actions Docker network to the host. Note: this will fail if the port is already in use.

| **Type:** | **Required:** | **Default:** |
| --------- | ------------- | ------------ |
| Boolean   | No            | false        |

### `host`

**Description:** The host to forward the ports to.

| **Type:** | **Required:** | **Default:** |
| --------- | ------------- | ------------ |
| String    | No            | 127.0.0.1    |

## Outputs

### `github-network-ip`

**Description:** The IP address of the GitHub Actions Docker network.

### `port-mappings`

**Description:** The port mapping from the GitHub Actions Docker network to the host, in JSON format.

Example:

```json
[
  {
    "host": {
      "ip": "127.0.0.1",
      "port": 5432
    },
    "container": {
      "ip": "172.0.0.1",
      "port": 80
    }
  }
]
```

## Usage

```yaml
- uses: JPBM135/detect-github-docker-network@v1
  id: detect-network
  with:
    strict: true

- name: Print network ip
  run: echo ${{ steps.detect-network.outputs.github-network-ip }}
```

## Installation

To install the dependencies, run:

```bash
yarn install
```

## Scripts

The following scripts are available:

- `build`: Runs the clean, check, and esbuild scripts.
- `lint`: Lints the code using ESLint and Prettier.
- `test`: Runs the tests.

## Testing

To run the tests, use:

```bash
yarn test
```

## Linting

To lint the code, use:

```bash
yarn lint
```

To fix linting issues, use:

```bash
yarn lint:fix
```

## License

This project is licensed under the AGPL-3.0 License.

## Author

JPBM135 <jpedrobm0@gmail.com>
