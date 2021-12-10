import { ethers } from 'ethers';
import constants from '../constants.js';
// https://github.com/chnejohnson/vue-dapp/issues/3
const WalletConnectProvider = window.WalletConnectProvider.default;

export default
class WalletProvider {

  requireEthereum() {
    if(!window.ethereum) {
      alert('No Ethereum wallet has been found, please install Metamask https://metamask.io/');
      return true;
    }
    return false;
  }

  async connectMetamask() {
    console.log("Connecting to metamsk");
    if(this.requireEthereum()) return;
    await this.requestChainSwitch(constants.requiredChain);
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await this.provider.send("eth_requestAccounts", []);
    const signer = this.provider.getSigner();
    if(signer) {
      this.signer = signer;
      this.connected = true;
      return true;
    } else {
      // TODO: if no signer after connect handle somehow
      alert('Cannot connet wallet, check Metamask or web3 wallet');
      return false;
    }
  }


  async requestChainSwitch(chainId) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: "0x" + chainId.toString(16) }],
    });
  }

  async connectWithWalletConnect() {
    console.log("Connecting with walletConnect");
    const provider = new WalletConnectProvider({
      infuraId: "f6698a8c78174f6e88c16b5afc0e7bd8", // Required
    });
    try {
      await provider.enable();
      this.provider = new ethers.providers.Web3Provider(provider, "any");
      const signer = this.provider.getSigner();
      if (signer) {
        this.signer = signer;
      }
      return true;
    } catch (err) {
      console.error("failed to connect via WalletConnect", err);
    }
    return false;
  }

}