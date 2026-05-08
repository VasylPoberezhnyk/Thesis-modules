require("dotenv").config()


const { EnsResolver } = require("ethers");
const { ethers, InfuraProvider } = require("ethers");

class InfuraEnsResolver {
    constructor(network = process.env.ETHEREUM_NETWORK, infuraApiKey = process.env.INFURA_API_KEY) {
        this.provider = new ethers.InfuraProvider(
            network,
            infuraApiKey
        );

        this.ensName = null;
        this.resolver - null;
    }

    getProvider() {
        return this.provider;
    }

    setEnsName(ensName) {
        this.ensName = ensName;
        return this;
    }

    async getResolver(name = this.ensName) {
        return await this.provider.getResolver(name);
    }

    async getTextRecord(key) {
        return await (await this.getResolver()).getText(key);
    }

    async getEnsAddress() {
        return await (await this.getResolver()).getAddress();
    }
}

module.exports = {
    InfuraEnsResolver
}