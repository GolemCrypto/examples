# Project Deployment Procedure:

### Step 1 - Compile the whitelist json file. 
1. Create/update file `./assets/whitelists/addresses.txt` with addresses (ens supported) separated by break line.
2. Run `node ./scripts/utils/compileWhitelist.js`
3. Verify the logs for errors in parsing the addresses or resolving ens addrs.
4. New file will be created in `./assets/whitelists`. That's the file you need to use in `constants.js` -> `deployParams.live`

### Step 2 - Setup unrevealed IPFS files.
1. Upload the unrevealed image to IPFS. (see `./assets/test` for examples)
2. Create a unrevealed IPFS .json file. :WARNING: Don't forget to set correct `image` key to be unrevealed IPFS url.
3. Upload the .json file of the unrevealed NFT.
4. In `constants` update the following keys:
	- `deployParams.live.unrevealedBaseURI` (suggested: `https://ipfs.io/ipfs/`)
	- `deployParams.live.unrevealedTokenURI` (uri of .json file of the unrevealed NFT. see Step 1);

## Step 3 - Configure contract before deployment
1. In `.env` make sure `DEPLOY_PARAMS_KEY` is set to `live`.
2. In `./constants.js` set all required options of `deployParams.live`

## Step 4 - Deploying contracts.
1. Highly reccommended: deploy to an ethereum testnet first.
2. To deploy to mainnet Run `npx hardhat run ./scripts/deplpoy.js --network ethereum_mainnet`

## Step 5 - Generate NFT assets.
to be defined

--- 
 
# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
