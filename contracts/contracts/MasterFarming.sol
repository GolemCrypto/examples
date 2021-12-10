
pragma solidity ^0.6.12;
import "./Farming.sol";

//import "hardhat/console.sol";


contract MasterFarming {
  using SafeMath for uint256;

mapping (uint256 => address) farms;
mapping (address => uint256) farmsForTokenCount;
mapping (address => mapping (uint256 => address) ) farmAddress; //token , round give farm address
uint256  public countFarm;
address _feeCollector;
address owner;

uint256 fees = 2; //10-1 BNB
 constructor () public{
    owner = msg.sender;
   countFarm = 0;
 }



//   function test() public  returns(address) {
//      return vault.getMasterFarmingAddress();

//  }
 /**
     * @dev Returns the address of the current owner.
     */
function feeCollector() public view returns (address) {
        return _feeCollector;
    }

function setfeeCollector(address wallet) public   {
   require(msg.sender == owner );
        _feeCollector=wallet;
    }

function setfees(uint256 _fee) public   {
   require(msg.sender == owner );
        fees=_fee;
    }

function newFarm(address  tokenAddrReward_,
        address tokenAddrStake_,
        uint256 timestamp, //locking timestamp
        uint rpsNumerator,
        uint256 rpsDenominator,
        uint256 maxParticipant,
        uint minParticipation,
        uint maxParticipation,
        uint256 poolOpenTime,
        uint256 poolDuration)
public payable returns(address)
  {
 
    require(msg.sender == owner || msg.value>fees.div(10),"Fees haven't been paid");
  
    
      Farming _farm = new Farming(  tokenAddrReward_,
       tokenAddrStake_,
       timestamp, //locking timestamp
       rpsNumerator,
       rpsDenominator,
       maxParticipant,
       minParticipation,
       maxParticipation,
       poolOpenTime,
       poolDuration,msg.sender);

    _farm.transferOwnership(msg.sender);
    farmsForTokenCount[tokenAddrStake_]=farmsForTokenCount[tokenAddrStake_].add(1);
    farmAddress[tokenAddrStake_][farmsForTokenCount[tokenAddrStake_]]=address(_farm);
    countFarm = countFarm.add(1);
    farms[countFarm]= address(_farm);

    //Lost bnbs are sent to fee collector wallet if address is set
    if(feeCollector()!=address(0)){
      feeCollector().call{value : address(this).balance}("");
    }
    
  }


  function getFarm (uint256 id) public view returns(address){
      require(id > 0, "id<=0");

      return farms[id];

  }
  
  function getLatestFarmByTokenAddress (address token) public view returns(address){
     

      return farmAddress[token][farmsForTokenCount[token]];

  }
    function getFarmByTokenAddressAndIndex (address token,uint256 index) public view returns(address){
     

      return farmAddress[token][index];

  }
   function getCountsByTokenAddress (address token) public view returns(uint256){
     

      return farmsForTokenCount[token];

  }
 /*function getFarmPage (uint256 index,uint256 numberPerPage) public  returns(address[] memory){
    require(numberPerPage<20,"Number Per Page too hiigh");
    address[20] storage page;
    uint256 numberToSub=index.mul(numberPerPage);
    for(uint i=countFarm-numberToSub;i>=countFarm.sub(numberPerPage);i.sub(1)){

      page.push(farms[i]);
    }

      return page;

  }*/

}

