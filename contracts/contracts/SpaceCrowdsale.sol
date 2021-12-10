pragma solidity ^0.6.12;


//import "hardhat/console.sol";

import "./SafeMath.sol";
 import "hardhat/console.sol";
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


interface IRefundVault{
  function deposit(address investor)  external payable;
  function close()  external;
  function enableRefunds()  external;
  function refund(address investor) external ;
  function activate(address owner,address crowdsale ) external;
  function unlockLiquidity() external;
  function isRefund() external view returns (bool);
}


contract SpaceCrowdsale {
  using SafeMath for uint256;

 
  ERC20 public token; //token to distribute
  ERC20 public alienToken; // 
  IRefundVault public vault; //=RefundVault(0X00..)

  // Address where funds are collected
  address payable  public wallet=0x0;//temporary


  mapping(address => uint256) public balances;//participants temporary balances, will be given after presale end

  // Amount of wei raised
  uint256 public weiRaised;

// How many token units a buyer gets per wei
uint256 public rate;
uint256 public openingTime  ; // Sat Jun 12 2021 01:43:23 GMT+0000
uint256 public closingTime  ; // Wed Jun 16 2021 01:43:23 GMT+0000

uint256 public cap; // 1*(10**5)*(10**18)
uint256 public goal; //5*(10**4)*(10**18)
 
uint256 public minParticipation;
uint256 public lockedTime;
uint256 public finalizedTime;
uint256 public maxParticipation;
//mapping (uint256 => uint256) public minAlienTokensTier;
mapping (address => uint256) public participation;
mapping (address => bool) public _isWhitelisted;
bool public whitelist;
uint256 public whitelistCount;
bool public isFinalized = false;

address public owner;

string public logo_url;
string public website_url;

bool public kyc_verified;
bool public audited;

event Finalized();

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

 
  constructor(
          address payable _wallet,
          address _token,
          address _alienToken,
          address _vault,

          uint256[10] memory intParams,

          // 0 _cap,
          // 1 _goal,
          // 2 _maxParticipation,
          // 3 _minParticipation,
          // 4 _rate,          
          // 5 _openingTime,
          // 6 _closingTime,
          // 7 _minAlienTokensTier[1]
          // 8 _minAlienTokensTier[2]
          // 9 _minAlienTokensTier[3]
          // 10 _minAlienTokensTier[4]           

          string memory _logo_url,
          string memory _website_url,
          bool isWhitelist 
          ) public {

  whitelist=isWhitelist;
  cap=intParams[0];
  goal = intParams[1];
  minParticipation = intParams[3];
  maxParticipation = intParams[2];
  
  rate = intParams[4];
  openingTime = intParams[5];
  closingTime = intParams[6];
/*
  minAlienTokensTier[4] = intParams[7]; // 50*(10**9)*(10**9);
  minAlienTokensTier[3] = intParams[8]; //100*(10**9)*(10**9);
  minAlienTokensTier[2] = intParams[9]; //150*(10**9)*(10**9);
  minAlienTokensTier[1] = intParams[10]; //300*(10**9)*(10**9);*/


  owner = address(_wallet);

  wallet = _wallet;
  token = ERC20(_token); //token to distribute
  alienToken = ERC20(_alienToken);
  vault = IRefundVault(_vault);

  lockedTime=intParams[8];
  logo_url = _logo_url;
  website_url = _website_url;

  console.log("[SpaceCrowdsale]", maxParticipation, cap);

  require(cap>=maxParticipation,"cap lower than max participation");
  require(wallet != address(0), "wallet address invalid");
  require(address(token) != address(0), "token address invalid");
  require(cap > 0, "cap amount invalid");
  require(intParams[7] >= 0, "liquidity rate amount invalid cannot be under 0");
  //require(goal> 0, "goal amount invalid");
  require(goal  < cap , "goal > cap");
  require(minParticipation>=0, "minParticipation <0");
  require(maxParticipation>0, "maxParticipation <0");
  require(minParticipation < intParams[2], "minParticipation > maxParticipation");
  require(maxParticipation <= cap, "maxParticipation > cap");
  require(rate> 0, "rate < 0");
  require( block.timestamp <= closingTime, "invalid time");



  }

  // -----------------------------------------
  // Crowdsale external interface
  // -----------------------------------------

  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
  receive() external payable {
    buyTokens(msg.sender);
  }

  function setKYC(bool val) public  {
    require(msg.sender == owner, "not owner" );
    kyc_verified = val;
  }
   
  function setAudited(bool val) public  {
    require(msg.sender == owner, "not owner" );
    audited = val;
  } 



  function availableTokens() public view returns (uint256){
    return token.balanceOf(address(this));
  }

 
  /**
   * @dev low level token purchase ***DO NOT OVERRIDE***
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) public payable {
     if(whitelist){
      require(_isWhitelisted[_beneficiary], "Account is not whitelisted");
    }
    uint256 weiAmount = msg.value;
    participation[msg.sender]=participation[msg.sender].add(weiAmount);
    // console.log("crowdsale.buyTokens requirements"
    // //, alienToken.balanceOf(_beneficiary) > minAlienTokens 
    // , weiRaised.add(weiAmount) <= cap
    // , weiAmount >= minParticipation 
    // , weiAmount <= maxParticipation);

    uint256 userBalance = alienToken.balanceOf(_beneficiary); 

    require(_beneficiary != address(0), "beneficiary");
    require(weiAmount != 0, "weiAmount");
    require(block.timestamp >= openingTime && block.timestamp <= closingTime, "time is outside of presale timespan");

    
    // if(minAlienTokensTier[1]!=0){
    
    //require(userBalance >= minAlienTokensTier[4], "Balance lower than min alien required");
   
    // if(userBalance < minAlienTokensTier[3])     require( participation[msg.sender] <= maxParticipationTier[4], "weiAmount exceeds tier1 user max participation");
    // else if(userBalance < minAlienTokensTier[2]) require(participation[msg.sender] <= maxParticipationTier[3], "weiAmount exceeds tier2 user max participation");
    // else if(userBalance < minAlienTokensTier[1]) require(participation[msg.sender] <= maxParticipationTier[2], "weiAmount exceeds tier3 user max participation");
    // else                                      require(participation[msg.sender] <= maxParticipationTier[1], "weiAmount exceeds tier4 user max participation");
    // }else{
    //   require(participation[msg.sender] <= maxParticipationTier[4], "weiAmount exceeds user max participation");
    // }

    //max participation
    require(participation[msg.sender] <= maxParticipation, "weiAmount exceeds user max participation");
    
    require(weiRaised.add(weiAmount) <= cap, "weiAmount greater than presale cap");
    
    require(weiAmount >= minParticipation  , "weiAmount lower than min participation");

    // calculate token amount to be created
    uint256 tokens = _getTokenAmount(weiAmount);
    
    // update state
    weiRaised = weiRaised.add(weiAmount);

    vault.deposit{value : address(this).balance}(msg.sender);
 
    _processPurchase(_beneficiary, tokens);
    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      weiAmount,
      tokens
    );

  }

 

  /**
   * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
   * @param _beneficiary Address performing the token purchase
   * @param _tokenAmount Number of tokens to be emitted
   */
  function _deliverTokens(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    //console.log("_deliverTokens", _tokenAmount);
    token.transfer(_beneficiary, _tokenAmount);
  }

  /**
   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
   * @param _beneficiary Address receiving the tokens
   * @param _tokenAmount Number of tokens to be purchased
   */
  function _processPurchase(
    address _beneficiary,
    uint256 _tokenAmount
  )
    internal
  {
    balances[_beneficiary] = balances[_beneficiary].add(_tokenAmount);
    //_deliverTokens(_beneficiary, _tokenAmount);
  }
  
  function amountToClaim() public view returns(uint256){
    return balances[msg.sender];
  }
  function withdrawTokens() public {

    // console.log("crowdsale.withDrawtokens requirements"
    //           ,isFinalized, balances[msg.sender] > 0);
    require(isFinalized, "crowdsale not finalized");
    uint256 amount = balances[msg.sender];
    require(amount > 0, "amount<0");
    balances[msg.sender] = 0;
    _deliverTokens(msg.sender, amount);
  }

    function isRefunding() public view returns(bool){
     return vault.isRefund();
    }
    function claimRefund() public {
    //require(vault.isRefund()==true,"is not in refunding state");
    //require(isFinalized,"is not finalized");
    //require(!goalReached(),"goal not reached");

    vault.refund(msg.sender);
  }
  
 

  /**
   * @dev Override to extend the way in which ether is converted to tokens.
   * @param _weiAmount Value in wei to be converted into tokens
   * @return Number of tokens that can be purchased with the specified _weiAmount
   */
  function _getTokenAmount(uint256 _weiAmount)
    internal view returns (uint256)
  {
    uint256 decimal_gap = 18 - token.decimals(); //gap between bnb_decimals and token decimals to adjust rate
    return _weiAmount.mul(rate).div(10**decimal_gap);
  }

 

  function finalize()  public{
    //if the owner didn't finalized it before 24 hours then anyone can finalize it
    require(block.timestamp > closingTime.add(604800)||msg.sender == owner, "not owner or less than 24hours" );
  
    require(!isFinalized, "already finalized");
    require(hasClosed(), "not closed");
    finalizedTime=block.timestamp;
    emit Finalized();
    isFinalized = true;
    uint256 balanceToken=ERC20(token).balanceOf(address(this));
    uint256 decimal_gap = 18 - ERC20(token).decimals(); //gap between bnb_decimals and token decimals to adjust rate
    uint256 tokenToSend=balanceToken.sub(weiRaised.div(10**decimal_gap).mul(rate)); //send the right amount of tokens to the vault
  
     if (goalReached()) {
      vault.close();
      ERC20(token).transfer(owner,tokenToSend);
    } else {
      vault.enableRefunds();
      ERC20(token).transfer(owner,balanceToken);

    }
  }

   function forceFinalizeRefunds()  public{
    //if the owner didn't finalized it before 24 hours then anyone can finalize it
    require(msg.sender == owner, "not owner" );
  
    require(!isFinalized, "already finalized");
    require(hasClosed(), "not closed");
    finalizedTime=block.timestamp;
    emit Finalized();
    isFinalized = true;
    uint256 balanceToken=ERC20(token).balanceOf(address(this));
    vault.enableRefunds();
    ERC20(token).transfer(owner,balanceToken);
  }

   function goalReached() public view returns (bool) {
    return weiRaised >= goal;
  }
  function excludeFromWhitelist(address account) public  {
          require(msg.sender == owner, "not owner" );
          require(!_isWhitelisted[account], "Account is already not whitelisted");
          _isWhitelisted[account]=false;
          whitelistCount=whitelistCount.sub(1);
      }

    function includeInWhitelist(address account) public {
        require(msg.sender == owner, "not owner" );
        require(_isWhitelisted[account], "Account is already whitelisted");
        _isWhitelisted[account]=true;
        whitelistCount=whitelistCount.add(1);
    }

    function isWhitelisted(address account) public view returns (bool){
        
        return _isWhitelisted[account];
    }
  // TIMED CROWDSALE
    /**
   * @dev Checks whether the period in which the crowdsale is open has already elapsed.
   * @return Whether crowdsale period has elapsed
   */
  function hasClosed() public view returns (bool) {
    console.log(weiRaised);
    console.log(cap);
    // solium-disable-next-line security/no-block-members
    return block.timestamp > closingTime || weiRaised >= cap;
  }
//unlock liquidity
  function unlockLiquidity() public  {
    require(msg.sender == owner, "not owner" );
    vault.unlockLiquidity();
  }
  function liquidityUnlocked() public  view returns(bool) {
    return finalizedTime+lockedTime<block.timestamp;
  }
}

 