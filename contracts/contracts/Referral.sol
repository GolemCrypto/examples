pragma solidity ^0.4.23;

//import "hardhat/console.sol";

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }
}

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

interface ERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function decimals() external view returns (uint8);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title RefundVault
 * @dev This contract is used for storing funds while a crowdsale
 * is in progress. Supports refunding the money if crowdsale fails,
 * and forwarding it if crowdsale is successful.
 */
contract Referral is Ownable {
    using SafeMath for uint256;

    ERC20 token = ERC20(0x0);

    mapping (address => uint256) public referrers;
    mapping (address => uint256) public referees;

    uint256 referrerBonus = 10; // %
    uint256 refereeBonus = 10; //%
    

  
  constructor(address _token) public {
    token = ERC20(_token);
  }

   
  function claim(address referrer)  public  {
    require(token.balanceOf(address(this)) >0, "No tokens available" );
    require(token.balanceOf(referrer) >0, "Referrer balance is empty" );
    require(token.balanceOf(msg.sender) >0, "Referree balance is empty." );
    require(referees[msg.sender] != 0, "Referee already claimed tokens.");
    
    uint256 amountReferee = token.balanceOf(msg.sender).mul(refereeBonus).div(100);
    uint256 amountReferrer = token.balanceOf(msg.sender).mul(referrerBonus).div(100);

    require(token.balanceOf(address(this)) - (amountReferee + amountReferrer)>0, "Not enough tokens available." );

    token.transfer(msg.sender, amountReferee);
    token.transfer(referrer, amountReferrer);

    referees[msg.sender] = amountReferee;
    referrers[referrer] = referrers[referrer].add(amountReferrer);
     
  }

  function empty()  onlyOwner public   {
    token.transfer(msg.sender, token.balanceOf(address(this)));
     
  }

  function blackList(address addr)  onlyOwner public   {
    require(referees[addr] == 0, "Already blacklisted");
    referees[addr] = 1;
     
  }

  function whiteList(address addr)  onlyOwner public   {
    require(referees[addr] != 0, "Already whitelisted");
    referees[addr] = 0;
     
  }
 
}