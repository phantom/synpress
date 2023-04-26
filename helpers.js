const log = require('debug')('synpress:helpers');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('ethers');
const download = require('download');
const packageJson = require('./package.json');

const PRESET_NETWORKS = Object.freeze({
  mainnet: {
    networkName: 'mainnet',
    networkId: 1,
    isTestnet: false,
  },
  goerli: {
    networkName: 'goerli',
    networkId: 5,
    isTestnet: true,
  },
  sepolia: {
    networkName: 'sepolia',
    networkId: 11155111,
    isTestnet: true,
  },
});

let selectedNetwork = PRESET_NETWORKS.mainnet;

module.exports = {
  async setNetwork(network) {
    log(`Setting network to ${JSON.stringify(network)}`);

    if (Object.keys(PRESET_NETWORKS).includes(network)) {
      selectedNetwork = PRESET_NETWORKS[network];
    }

    if (network === 'localhost') {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      const { chainId, name } = await provider.getNetwork();
      selectedNetwork = {
        networkName: name,
        networkId: chainId,
        isTestnet: true,
      };
    } else if (typeof network === 'object') {
      selectedNetwork = {
        networkName: network.networkName,
        networkId: Number(network.chainId),
        isTestnet: network.isTestnet,
      };
    }
    // todo: handle a case when setNetwork() is triggered by changeNetwork() with a string of already added custom networks
  },
  getNetwork: () => {
    log(`Current network data: ${selectedNetwork}`);
    return selectedNetwork;
  },
  getSynpressPath() {
    if (process.env.SYNPRESS_LOCAL_TEST) {
      return './node_modules/@phantom/synpress';
    } else {
      return path.dirname(require.resolve(packageJson.name));
    }
  },
  async createDirIfNotExist(path) {
    try {
      log(`Checking if directory exists on path: ${path}`);
      await fs.access(path);
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        log(`Creating directory as it doesn't exist..`);
        await fs.mkdir(path);
        return true;
      }

      throw new Error(
        `[createDirIfNotExist] Unhandled error from fs.access() with following error:\n${e}`,
      );
    }
  },
  async checkDirOrFileExist(path) {
    try {
      log(`Checking if directory exists on path: ${path}`);
      await fs.access(path);
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        log(`Directory or file doesn't exist`);
        return false;
      }

      throw new Error(
        `[checkDirOrFileExist] Unhandled error from fs.access() with following error:\n${e}`,
      );
    }
  },
  async getMetamaskReleases(version) {
    log(`Trying to find metamask version ${version} in GitHub releases..`);
    let filename;
    let downloadUrl;
    let tagName;
    let response;

    try {
      if (version === 'latest' || !version) {
        if (process.env.GH_USERNAME && process.env.GH_PAT) {
          response = await axios.get(
            'https://api.github.com/repos/metamask/metamask-extension/releases',
            {
              auth: {
                username: process.env.GH_USERNAME,
                password: process.env.GH_PAT,
              },
            },
          );
        } else {
          response = await axios.get(
            'https://api.github.com/repos/metamask/metamask-extension/releases',
          );
        }
        filename = response.data[0].assets[0].name;
        downloadUrl = response.data[0].assets[0].browser_download_url;
        tagName = response.data[0].tag_name;
        log(
          `Metamask version found! Filename: ${filename}; Download url: ${downloadUrl}; Tag name: ${tagName}`,
        );
      } else if (version) {
        filename = `metamask-chrome-${version}.zip`;
        downloadUrl = `https://github.com/MetaMask/metamask-extension/releases/download/v${version}/metamask-chrome-${version}.zip`;
        tagName = `metamask-chrome-${version}`;
        log(
          `Metamask version found! Filename: ${filename}; Download url: ${downloadUrl}; Tag name: ${tagName}`,
        );
      }
      return {
        filename,
        downloadUrl,
        tagName,
      };
    } catch (e) {
      if (e.response && e.response.status === 403) {
        throw new Error(
          `[getMetamaskReleases] Unable to fetch metamask releases from GitHub because you've been rate limited! Please set GH_USERNAME and GH_PAT environment variables to avoid this issue or retry again.`,
        );
      }

      throw new Error(
        `[getMetamaskReleases] Unable to fetch metamask releases from GitHub with following error:\n${e}`,
      );
    }
  },
  getPhantomReleases: async version => {
    log(`Trying to find phantom version ${version} in GitHub releases..`);
    let filename;
    let downloadUrl;
    let tagName;
    let response;

    /**
     * We don't have github releases public for now. Hardcode values until we have
     */
    return {
      filename: 'phantom-chrome-latest',
      downloadUrl: 'chrome-dist.zip',
      tagName: 'phantom-chrome-latest',
    };
    // try {
    //   if (version === 'latest' || !version) {
    //     if (process.env.GH_USERNAME && process.env.GH_PAT) {
    //       response = await axios.get(
    //         'https://api.github.com/repos/phantom/wallet/releases',
    //         {
    //           auth: {
    //             username: process.env.GH_USERNAME,
    //             password: process.env.GH_PAT,
    //           },
    //         },
    //       );
    //     } else {
    //       response = await axios.get(
    //         'https://api.github.com/repos/phantom/wallet/releases',
    //       );
    //     }
    //     console.log(response.data[0])
    //     filename = response.data[0].assets[0].name;
    //     downloadUrl = response.data[0].assets[0].url;
    //     tagName = 'phantom-chrome-latest';
    //     log(
    //       `Phantom version found! Filename: ${filename}; Download url: ${downloadUrl}; Tag name: ${tagName}`,
    //     );
    //   } else if (version) {
    //     filename = `chrome-dist.zip`;
    //     downloadUrl = `https://github.com/phantom-labs/wallet/releases/download/v${version}/chrome-dist.zip`;
    //     tagName = `phantom-chrome-${version}`;
    //     log(
    //       `Phantom version found! Filename: ${filename}; Download url: ${downloadUrl}; Tag name: ${tagName}`,
    //     );
    //   }
    //   return {
    //     filename,
    //     downloadUrl,
    //     tagName,
    //   };
    // } catch (e) {
    //   if (e.response && e.response.status === 403) {
    //     throw new Error(
    //       `[getPhantomReleases] Unable to fetch phantom releases from GitHub because you've been rate limited! Please set GH_USERNAME and GH_PAT environment variables to avoid this issue or retry again.`,
    //     );
    //   } else {
    //     throw new Error(
    //       `[getPhantomReleases] Unable to fetch phantom releases from GitHub with following error:\n${e}`,
    //     );
    //   }
    // }
  },
  download: async (provider, url, destination) => {
    try {
      log(
        `Trying to download and extract file from: ${url} to following path: ${destination}`,
      );
      if (process.env.GH_USERNAME && process.env.GH_PAT) {
        await download(url, destination, {
          extract: true,
          auth: `${process.env.GH_USERNAME}:${process.env.GH_PAT}`,
          headers: {
            Accept: 'application/octet-stream',
          },
        });

        /**
         * Some extensions will zip their dist folder
         */
        if (provider === 'phantom') {
          await moveFiles(`${destination}/dist`, destination);
        }
      } else {
        await download(url, destination, {
          extract: true,
        });
      }
    } catch (e) {
      throw new Error(
        `[download] Unable to download provider release from: ${url} to: ${destination} with following error:\n${e}`,
      );
    }
  },
  prepareProvider: async (provider, version) => {
    const release =
      provider === 'phantom'
        ? await module.exports.getPhantomReleases(version)
        : await module.exports.getMetamaskReleases(version);
    const downloadsDirectory = path.resolve(__dirname, 'downloads');
    await module.exports.createDirIfNotExist(downloadsDirectory);
    const providerDirectory = path.join(downloadsDirectory, release.tagName);
    const providerkDirectoryExists = await module.exports.checkDirOrFileExist(
      providerDirectory,
    );
    const providerManifestFilePath = path.join(
      downloadsDirectory,
      release.tagName,
      'manifest.json',
    );
    const providerManifestFileExists = await module.exports.checkDirOrFileExist(
      providerManifestFilePath,
    );
    if (!providerkDirectoryExists && !providerManifestFileExists) {
      await module.exports.download(
        provider,
        release.downloadUrl,
        providerDirectory,
      );
    } else {
      log('provider is already downloaded');
    }
    return providerDirectory;
  },
};

async function moveFiles(srcDir, destDir) {
  const files = await fs.readdir(srcDir);

  return Promise.all(
    files.map(function (file) {
      var destFile = path.join(destDir, file);
      return fs.rename(path.join(srcDir, file), destFile);
    }),
  );
}
