const fs = require('fs');
const readline = require('readline');
const ethers = require('ethers');

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/029a25a55a4b49858bcadcf98f696458");
function isAddress(addr) {
  try {
    return ethers.utils.getAddress(addr);
  } catch (err) {
    console.warn(`${addr} is not a valid address`, err);
    return null;
  }
}

function isENS(addr) {
  return addr.toLowerCase().includes('.eth');
}

async function resolve(ens) {
  try {
    return await provider.resolveName(ens);
  } catch (err) {
    console.warn(`${addr} cannot be resolved`, err);
    return null;
  }
}

async function getAddr(entry) {
  let addr = null;
  if (isENS(entry)) {
    addr = await resolve(entry);
  } else {
    addr = isAddress(entry);
  }
  return addr;
}

async function processLineByLine(filepath) {
  const fileStream = fs.createReadStream(filepath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  const whitelist = {}
  for await (const entry of rl) {
    // Each line in input.txt will be successively available here as `line`.
    let addr = await getAddr(entry);
    if (addr) {
      whitelist[addr] = 0;
    }
  }
  
  const split = filepath.split("/");
  const output = filepath.replace(split[split.length -1], `whitelist-${new Date().toISOString()}.json`)

  fs.writeFile(output, JSON.stringify(whitelist), (err) => {if (err) console.log(err)});
}

processLineByLine("./assets/whitelists/addresses.txt");
