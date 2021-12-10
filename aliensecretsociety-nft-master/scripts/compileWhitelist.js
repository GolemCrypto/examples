require("dotenv").config();
const {deployParams} = require("../constants");
const Deployer = require("./deploy.helpers.js");
async function main() {
  const params = deployParams[process.env.DEPLOY_PARAMS_KEY];
  return await Deployer.deploy(params);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
