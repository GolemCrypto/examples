pragma solidity ^0.6.12;

import "./SpaceCrowdsale.sol";
import "hardhat/console.sol";

interface IRefundVault_{
 
  function deposit(address investor)  external payable;
  function close()  external;
  function enableRefunds()  external;
  function refund(address investor) external ;
  function activate(address owner,address crowdsale ,uint256[5] memory crowdsaleValues,address token) external;

  function getMasterCrowdsaleAddress() external returns (address) ;

}


contract MasterCrowdsale {
  using SafeMath for uint256;

IRefundVault_ vault;
address public vaultAddress;
mapping (uint256 => address) crowdsales;
mapping (address => uint256) crowdsalesForTokenCount;
mapping (address => mapping (uint256 => address) ) crowdsaleAddress; //token , round give crowdsale address
uint256  public countCrowdsale;
address public feeCollector;
address public owner;
mapping(address => bool) private _isIncluded;
uint256 public fees = 2*10**17; //10-1 BNB
 constructor () public{
    owner = msg.sender;
   countCrowdsale = 0;
   feeCollector=msg.sender;
   _isIncluded[msg.sender] = true;
 }

 function setVault(address _vault) public{
     require(msg.sender == owner );
     vault=IRefundVault_(_vault);
     vaultAddress = _vault;
 }

 
 function getVault() public view returns(address vault) {
     return vaultAddress;

 }

//   function test() public  returns(address) {
//      return vault.getMasterCrowdsaleAddress();

//  }
 /**
     * @dev Returns the address of the current owner.
     */

function setfeeCollector(address wallet) public   {
   require(msg.sender == owner );
        feeCollector=wallet;
    }

function setfees(uint256 _fee) public   {
   require(msg.sender == owner );
   require(fees<100);
        fees=_fee;
    }

function newCrowdsale(
        address payable _wallet,
          address _token,
          address _alienToken,

          uint256[10] memory intParams, //12 liquidityRate
          uint256 percentage,

          string memory _logo_url,
          string memory _website_url,
          bool isWhitelist
)
public payable
  {
 
    require(_isIncluded[msg.sender] || msg.value>=fees,"Fees haven't been paid");

    console.log("[CONTRACT] 1 masterCrowdsale",_token);
    //tokens that will be sended to vault
    uint256 decimal_gap = 18 - ERC20(_token).decimals(); //gap between bnb_decimals and token decimals to adjust rate
    uint256 tokensForVault=intParams[0].div(10**decimal_gap).mul(intParams[7]); //send the right amount of tokens to the vault
    uint256 tokensForInvestors=intParams[0].div(10**decimal_gap).mul(intParams[4]);
    //send tokens after being approved
    
    

    console.log("[CONTRACT] 2 masterCrowdsale",_token);
    //in case it's the same rate between launch and presale

  

    ERC20(_token).transferFrom(msg.sender,address(vault),tokensForVault);
    
 
    
      SpaceCrowdsale _crowdsale = new SpaceCrowdsale(
            _wallet,
           _token,
           _alienToken,
            vaultAddress,
 
           intParams,
           _logo_url,
           _website_url,
           isWhitelist

      );

      
      //send token to be withdrawn
      ERC20(_token).transferFrom(msg.sender,address(_crowdsale),tokensForInvestors);
     
      vault.activate(msg.sender, address(_crowdsale),[percentage,intParams[0],intParams[7],intParams[8],intParams[9]],_token);

    crowdsalesForTokenCount[_token]=crowdsalesForTokenCount[_token].add(1);
    crowdsaleAddress[_token][crowdsalesForTokenCount[_token]]=address(_crowdsale);
    countCrowdsale = countCrowdsale.add(1);
    crowdsales[countCrowdsale]= address(_crowdsale);

    //Lost bnbs are sent to fee collector wallet if address is set
    if(feeCollector!=address(0)){
      feeCollector.call{value : address(this).balance}("");
    }

  }


  function getCrowdsale (uint256 id) public view returns(address){
      require(id > 0, "id<=0");

      return crowdsales[id];

  }
  
  function getLatestCrowdsaleByTokenAddress (address token) public view returns(address){
     

      return crowdsaleAddress[token][crowdsalesForTokenCount[token]];

  }
    function getCrowdsaleByTokenAddressAndRound (address token,uint256 round) public view returns(address){
     

      return crowdsaleAddress[token][round];

  }
   function getRoundByTokenAddress (address token) public view returns(uint256){
     

      return crowdsalesForTokenCount[token];

  }

   function exclude(address user) public  {
     require(msg.sender == owner,"Not owner");

    _isIncluded[user]==false;
    
  }
     function include(address user) public {
    require(msg.sender == owner,"Not owner");

    _isIncluded[user]==true;
    
  }
  function isIncluded(address account) public view returns (bool) {
        return _isIncluded[account];
    }
  
}

