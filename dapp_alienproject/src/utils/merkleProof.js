import {ethers} from 'ethers';
import { MerkleTree } from 'merkletreejs';
import whitelist from '../assets/whitelist.js';
const keccak256 = window.keccak256;

export default 
  class MerlkeProof {
    static hashEntry = (account, amount) => {
      return Buffer.from(ethers.utils.solidityKeccak256(['address', 'uint256'], [account, amount]).slice(2), 'hex')
    }

    static getValidProof (address) {
      const entries = Object.entries(whitelist).map(entry => this.hashEntry(...entry));
      const whitelistMerkleTree = new MerkleTree(entries, keccak256, { sortPairs: true });

      const proof = whitelistMerkleTree.getHexProof(this.hashEntry(address, 0));
      const valid = whitelistMerkleTree.verify(proof, this.hashEntry(address, 0), whitelistMerkleTree.getHexRoot());
      return valid ? proof : null; 
    }
}