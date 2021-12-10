const hre = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

function hashEntry(account, amount) {
  return Buffer.from(ethers.utils.solidityKeccak256(['address', 'uint256'], [account, amount]).slice(2), 'hex')
}

module.exports.deploy = async (deployParams) => {
  console.log("Initiating deployment with params: ", deployParams);
  const AlienSecretSociety = await hre.ethers.getContractFactory("AlienSecretSociety");
  console.log("Creating MerlkeTree whitelist");
  const whitelistMerkleTree = new MerkleTree(Object.entries(deployParams.whitelist).map(entry => hashEntry(...entry)), keccak256, { sortPairs: true });
  console.log("Deploying...")
  const alienSecretSociety = await AlienSecretSociety.deploy(
        deployParams.whitelistPrice,
        deployParams.whitelistMaxAmount,
        deployParams.dutchAuctionStartPrice,
        deployParams.dutchAuctionFloorPrice,
        deployParams.dutchAuctionPriceDecreaseBy,
        deployParams.dutchAuctionLimitPerWallet,
        deployParams.dutchAuctionChangeTick,
        deployParams.unrevealedBaseURI, 
        deployParams.unrevealedTokenURI,
    );
  const contract = await alienSecretSociety.deployed();
  console.log('AlienSecretSociety deployed at: ', contract.address);
  return contract;
}