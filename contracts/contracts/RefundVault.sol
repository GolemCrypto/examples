pragma solidity ^0.6.12;

 
import "./SafeMath.sol";
import "./IUniswapV2Router.sol";
 import "hardhat/console.sol";

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}
/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract OwnableR {
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

interface VIERC20 {
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


/**
 * @title RefundVault
 * @dev This contract is used for storing funds while a crowdsale
 * is in progress. Supports refunding the money if crowdsale fails,
 * and forwarding it if crowdsale is successful.
 */
contract RefundVault is OwnableR {
  using SafeMath for uint256;

  enum State { Active, Refunding, Closed }
  address operator;
  struct Vault {
    State state;
    address token;
    address beneficiary;
    uint256 percForLiquidity;
    uint256 hardcap;
    uint256 totalDeposited;
    uint256 liquidityRate;
    address pair;
    uint256 lockedTime;
    uint256 lockedUntil;
    mapping (address => uint) deposited;
    IUniswapV2Router02 router;
}
  address private feeCollector=0x0;
  uint256 public percFees=1;

  mapping (address => Vault) public vaults; 


  // mapping (address => uint) liquidityTokens; // address user => ( address crowdsale => number of tokens )
  // mapping (address => mapping (address => uint)) public deposited;// total deposited for user for each vault
  // mapping (address => uint256) public totalDeposited; // total deposited for each crowdsale
  // mapping (address => address) public beneficiary; //beneficiary of crowdsale

  // mapping (address => State) public tokenVaultState;
  // mapping (address => uint256) public percForLiquidity;
  // mapping (address => uint256) public _hardcap;
  // mapping (address => address) public tokens; //token of the crowdsale
  address public wallet;

  event Closed();
  event RefundsEnabled();
  event Refunded(address indexed beneficiary, address crowdsale, uint256 weiAmount);
  event LiquidityReleased(address indexed beneficiary, address crowdsale);


  IUniswapV2Router02 public  uniswapV2Router; 
  mapping (uint256 => IUniswapV2Router02) routers;
  //VIERC20 token; //percentage of BNB raised for liquidity


  constructor(address _pancakeRouter) public {
    routers[0]=IUniswapV2Router02(_pancakeRouter);
    operator=msg.sender;

  }

  function state(address _crowdsale) public view returns (State stateVault){
    return vaults[_crowdsale].state;
 
  }
  function depositedForLiq(address _crowdsale) public view returns (uint256 amount){
    return vaults[_crowdsale].totalDeposited;
  }
  function depositedBnbs(address _crowdsale) public view returns (uint256 amount){
    return vaults[_crowdsale].deposited[msg.sender];

  }
 
  function activate(address _beneficiary,address _crowdsale,uint256[5] memory crowdsaleValues,address token) onlyOwner public {
    uint256 percentage=crowdsaleValues[0];
    uint256 hardcap=crowdsaleValues[1];
    uint256 liquidityRate=crowdsaleValues[2];
    uint256 lockedTime=crowdsaleValues[3];
    uint256 indexRouter=crowdsaleValues[4];
    //chose which router to take
    require(address(routers[indexRouter])!=address(0),"Not a proper router");
    vaults[_crowdsale].router=routers[indexRouter];
    if(percentage==0){
      liquidityRate=0;
    }
    //Owner is Master Crowdsale
    require(msg.sender != address(0), "error sender address");
    require(vaults[_crowdsale].token==address(0), "vault already exist for this crowdsale"); //vault doesnt exist

  vaults[_crowdsale].lockedTime=lockedTime;
  vaults[_crowdsale].state = State.Active;
  vaults[_crowdsale].token =token;
  vaults[_crowdsale].beneficiary =_beneficiary;
  vaults[_crowdsale].percForLiquidity =percentage;
  vaults[_crowdsale].hardcap =hardcap;
  vaults[_crowdsale].liquidityRate =liquidityRate;

  }
  /**
   * @param investor Investor address
   */


   //investors invest bnbs into a token vault
  function deposit(address investor) public payable {
    address _crowdsale = msg.sender;
    require(vaults[_crowdsale].token!=address(0)); //only crowdsale contract can deposit on behalf of investor
    require( vaults[_crowdsale].state == State.Active);
    //console.log("deposit requirements met.");
    //console.log("sender address", investor);
    vaults[_crowdsale].deposited[investor] = vaults[_crowdsale].deposited[investor].add(msg.value);
    vaults[_crowdsale].totalDeposited = vaults[_crowdsale].totalDeposited.add(msg.value); 
   
  }
  //deposit tokens for liquidity by owner
  // function depositedTokens(address owner, uint256 amount)  public {
  //   address _crowdsale = msg.sender;
  //   require( vaults[_crowdsale].state == State.Active);
  //   require(vaults[_crowdsale].token!=address(0));
  //   //console.log("deposit requirements met.");
  //   //console.log("sender address", investor);
  //   vaults[_crowdsale].liquidityTokens = vaults[_crowdsale].liquidityTokens.add(amount);
  // }
  function close() public {
    address _crowdsale = msg.sender;
    uint256 forBeneficiary= vaults[_crowdsale].totalDeposited;
    address token=vaults[_crowdsale].token;
     uint256 feeTokens ;
    //collect fees if fees>0%
    if(percFees>0 ){
      uint256 collectedFees=vaults[_crowdsale].totalDeposited.mul(percFees).div(100);
      //collectfees
      address(feeCollector).call{value : collectedFees}("");
      forBeneficiary= vaults[_crowdsale].totalDeposited.sub(collectedFees);
      feeTokens= VIERC20(token).balanceOf(address(this)).mul(percFees).div(100);
    }
    require(vaults[_crowdsale].token!=address(0));
    //require(liquidityTokens[msg.sender][token]>0);
    require( vaults[_crowdsale].state == State.Active);
     vaults[_crowdsale].state = State.Closed;
    emit Closed();
    uint256 decimal_gap = 18 - VIERC20(token).decimals(); //gap between bnb_decimals and token decimals to adjust rate
    uint256 forLiquidity= vaults[_crowdsale].totalDeposited.mul(vaults[_crowdsale].percForLiquidity).div(100);
    uint256 tokensLiquidity= forLiquidity.div(10**decimal_gap).mul(vaults[_crowdsale].liquidityRate);
     
    uint256 tokensBalance = VIERC20(token).balanceOf(address(this));

     if( tokensBalance> 0 && tokensLiquidity>0 ){
      tokensBalance=tokensBalance.sub(feeTokens);
      forBeneficiary = forBeneficiary.sub(forLiquidity);
      vaults[_crowdsale].pair = IUniswapV2Factory(vaults[_crowdsale].router.factory())
            .getPair(address(token), vaults[_crowdsale].router.WETH());
      // Create a uniswap pair for this new token
      if(vaults[_crowdsale].pair==address(0)){
      vaults[_crowdsale].pair = IUniswapV2Factory(vaults[_crowdsale].router.factory())
              .createPair(address(token), vaults[_crowdsale].router.WETH());
          }
      //part to create liquidity
     VIERC20(token).approve(address(vaults[_crowdsale].router),tokensBalance);
     vaults[_crowdsale].lockedUntil=now+vaults[_crowdsale].lockedTime;
            
     vaults[_crowdsale].router.addLiquidityETH{value: forLiquidity}(
           address(token),
           tokensLiquidity,
           0,
           0, //fonction du rate
           address(this), //
           block.timestamp
     );
     }
    VIERC20(token).transfer(vaults[_crowdsale].beneficiary,tokensBalance.sub(tokensLiquidity));
    //sent to the owner that created ico
    if(vaults[_crowdsale].liquidityRate==0){
      address(vaults[_crowdsale].beneficiary).call{value : forBeneficiary.add(forLiquidity)}("");
    }else{
      address(vaults[_crowdsale].beneficiary).call{value : forBeneficiary}("");
    }
    

  }

  function enableRefunds() public {
    address _crowdsale = msg.sender;
    address token=vaults[_crowdsale].token;
    uint256 tokensBalance = VIERC20(token).balanceOf(address(this));
    require(vaults[_crowdsale].token!=address(0)); //require the msg sender to be creator of ico 
    require( vaults[_crowdsale].state == State.Active);
    //Refunds the owner tokens
    vaults[_crowdsale].state = State.Refunding;
    VIERC20(token).transfer(vaults[_crowdsale].beneficiary,tokensBalance);
    emit RefundsEnabled();
  }

  /**
   * @param investor Investor address
   */
  function refund( address investor) public {
    address _crowdsale = msg.sender;
    require( vaults[_crowdsale].state == State.Refunding);
    uint256 depositedValue = vaults[_crowdsale].deposited[investor];
    vaults[_crowdsale].deposited[investor] = 0;
    //investor.transfer(depositedValue);
    investor.call{value : depositedValue}("");
    emit Refunded(investor, _crowdsale, depositedValue);
  }
   function isUnlocked() public view returns(bool){
    address _crowdsale = msg.sender;
    return vaults[_crowdsale].lockedUntil <= now;
  }
  
  function isRefund() public view returns(bool){
    address _crowdsale = msg.sender;
    return vaults[_crowdsale].state == State.Refunding;
  }

  function unlockLiquidity() public {
    address _crowdsale = msg.sender;
    require( vaults[_crowdsale].lockedUntil <= now);
    uint256 balanceOfLp=VIERC20(vaults[_crowdsale].pair).balanceOf(address(this));
    VIERC20(vaults[_crowdsale].pair).transfer(vaults[_crowdsale].beneficiary,balanceOfLp);
    emit LiquidityReleased(vaults[_crowdsale].beneficiary, _crowdsale);
  }


   function percForLiquidity(address _crowdsale) public  view returns(uint) {
     return vaults[_crowdsale].percForLiquidity;
  }
  function liquidityRate(address _crowdsale) public  view returns(uint) {
     return vaults[_crowdsale].liquidityRate;
  }

  function beneficiary(address _crowdsale) public  view returns(address) {
     return vaults[_crowdsale].beneficiary;
  }

  function setRouterAddress(uint256 index, address _addressRouter)  public {
    require(msg.sender==operator,"not allowed");
    routers[index] = IUniswapV2Router02(_addressRouter);

    }
  function setFees(uint256 percentageFees)  public {
    require(msg.sender==operator,"not allowed");
    percFees=percentageFees;
    }
    function setFeeCollector(address collector)  public {
      require(msg.sender==operator,"not allowed");
    feeCollector=collector;
    }

} 