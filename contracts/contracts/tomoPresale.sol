/**
 *Submitted for verification at Etherscan.io on 2021-10-22
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

interface INFT {
	function mint(address _to) external;
	function mintBatch(address _to, uint _amount) external;
}

contract TomoPresale is Ownable {

    mapping (address => uint256[]) result; // DELETE
    bytes32[] layer1; // DELETE
    bytes32[][] layers; // DELETE
    bytes32[] layer; // DLETE

	uint public constant START_TIME = 1636990691;
	uint public constant FINISH_TIME = 1637123091;
	uint public constant PRE_SALE_PRICE = 0.2 ether;
    bytes32 public root;

	INFT public nft;
	
	address public verifyAddress = 0x0;
	mapping(address => bool) public buyers;
	
	address payable public receiver;

	constructor(address _nftAddress, address payable _receiverAddress) {
		nft = INFT(_nftAddress);
		
		receiver = _receiverAddress;
	}

	/*
	 * @dev function to buy tokens. Can be bought only 1. 
	 * @param _amount how much tokens can be bought.
	 * @param _proof Merkle tree proof.
	 */
	function buy(uint _amount, bytes32[] memory _proof) public payable {
	    require(_amount == 1, "only 1 token can be bought on presale");
	    require(block.timestamp >= START_TIME && block.timestamp < FINISH_TIME, "not a presale time");
		require(msg.value == PRE_SALE_PRICE, "token price 0.2 ETH");
		require(!buyers[msg.sender], "only one token can be bought on presale");
        require(verify(_proof, bytes32(uint256(uint160(msg.sender)))), "Not whitelisted");
		buyers[msg.sender] = true;
        
		nft.mintBatch(msg.sender, _amount);
		(bool sent, ) = receiver.call{value: address(this).balance}("");
        require(sent, "Something wrong with receiver");
	}
	
	/*
	 * @dev function to withdraw all tokens
	 * @param _to ETH receiver address
	 */
	function cashOut(address _to) public onlyOwner {
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        
        (bool sent, ) = _to.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function setRoot(uint256 _root) onlyOwner() public {
        root = bytes32(_root);
    }

    function verify(bytes32[] memory proof, bytes32 leaf) public view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = sha256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = sha256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == root;
    }
}