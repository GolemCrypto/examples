import conf from './config.js'
const config = conf.config ;

 let contracts = {


     /*
        *******************
        generic function for calling any view contract function 
      */
      call : async function(web3js, contract_abi, contract_address, func
    ,user_address , params){


        try{
          let contract = new web3js.eth.Contract(contract_abi, contract_address);

          console.log("contract.methods", contract.methods, func )
          let res =   await contract.methods[func].apply( null, params).call({from:  user_address })

          return res

        }catch(e){
        console.log("[ERROR] " + func + " : " , e.toString())
        return null
        }

        }
        ,
        
        /*
        *******************
        generic function for calling any contract function 
      */

        callMany : async function(web3js, contract_abi, contract_address, func_array
        ,user_address, paramsJson={}){

              //call multiple get functions from a given contract

              try{
                    let contract = new web3js.eth.Contract(contract_abi, contract_address);

                    let iterable = []

                    for(let i= 0; i<func_array.length; i++){
                          let func = func_array[i]
                          let params = paramsJson ? paramsJson[func] : []
                          let p = new Promise(  function(resolve){
                              contract.methods[func].apply( null, params)
                              .call({from:  user_address })
                              .then((value)=>{
                              resolve({ key : func, value : value  })
                              })

                          })
                          iterable.push(p)
                    }


                    return await Promise.all(iterable).then((array)=>{

                          let json = {}
                          for(let i=0; i<array.length;i++){
                          let item = array[i]
                          json[item.key] = item.value
                          }

                          return json
                    })


              }catch(e){
              console.log("[ERROR] "  + " : " , e.toString() + " : "+contract_address)
              return null
              }

}
,

 /*
        *******************
        generic function for calling any non-view contract function 
    */
  send :   async function (web3js, contract_abi, contract_address, func,
                        user_address
                        , params  ){
       
    try{

        let contract = new web3js.eth.Contract(contract_abi, contract_address);

        console.log("contract", contract_address)
        contract.methods[func].apply(null, params )
                         .send({from:  user_address })

      
  }catch(e){
    console.log("[ERROR] send: " , func , e.toString())
    return null
  }
    
    }
,
  getCrowdsaleInfo : async function(web3js, crowdsaleAddress, user_address, light=false){
    
        try{
        let contract = new web3js.eth.Contract(config.crowdsale_abi, crowdsaleAddress);
        var crowdsale_func =[]
        //MUSC crowdsale 
          if(crowdsaleAddress==""){
         crowdsale_func =  [ "hasClosed"//,"isRefunding"
        , "isFinalized","amountToClaim","weiRaised", "owner", "openingTime", "closingTime", "cap", "goal", 
        "minParticipation", 
         "logo_url", "website_url", "kyc_verified", "audited"
        , "token",
    
        //light
         "vault","rate", 
        // ,"maxParticipationTier1", "maxParticipationTier2", "maxParticipationTier3", 
       // "maxParticipation"
        // ,"minAlienTokensTier1", "minAlienTokensTier2", "minAlienTokensTier3", "minAlienTokensTier4"  
 
      ]}else{
        crowdsale_func =  [ "hasClosed","isRefunding"
        , "isFinalized","amountToClaim","weiRaised", "owner", "openingTime", "closingTime", "cap", "goal", 
        "minParticipation", 
         "logo_url", "website_url", "kyc_verified", "audited"
        , "token",
    
        //light
         "vault","rate", 
        // ,"maxParticipationTier1", "maxParticipationTier2", "maxParticipationTier3", 
       "maxParticipation"
        // ,"minAlienTokensTier1", "minAlienTokensTier2", "minAlienTokensTier3", "minAlienTokensTier4"  
 
      ]
      }
      
      const token_func = ["symbol", "decimals", "name"]
     
    
    let crowdsale_info = await this.callMany(web3js, config.crowdsale_abi, crowdsaleAddress
      , crowdsale_func,user_address
      , { })
    let tokenContract =   new web3js.eth.Contract(config.token_abi, crowdsale_info.token);

    let token_info =   await this.callMany(web3js, config.token_abi, crowdsale_info.token, token_func,user_address)

    //crowdsale_info.maxParticipationTier2 = await contract.methods.maxParticipation.call({from:  user_address })
     // console.log("Testttt",crowdsale_info.maxParticipation)
  
      return {...crowdsale_info
              , ...token_info
              ,crowdsale_bnb : await web3js.eth.getBalance(crowdsaleAddress)
              ,available_tokens : await tokenContract.methods.balanceOf(crowdsaleAddress).call({from:  user_address })
              , tokenAddress : crowdsale_info.token
            }

      // let info = {
    
      //   available_tokens :  light ? null :  parseInt(await tokenContract.methods.balanceOf(crowdsaleAddress).call({from:  user_address }))
      //   ,
      //   rate : light ? null : await contract.methods.rate().call({from:  user_address })
      //   , crowdsale_bnb: light ? null : await web3js.eth.getBalance(crowdsaleAddress)
      //   , weiRaised : parseInt(await contract.methods.weiRaised().call({from:  user_address }))
      //   , owner :  await contract.methods.owner().call({from:  user_address })
      //   , openingTime :  1000*parseInt(await contract.methods.openingTime().call({from:  user_address }))
      //   , closingTime :  1000*parseInt(await contract.methods.closingTime().call({from:  user_address }))
      //   , cap : parseInt(await contract.methods.cap().call({from:  user_address }))
      //   , minParticipation: parseInt(await contract.methods.minParticipation().call({from:  user_address }))
    
      //    , maxParticipationTier1 : light ? null : parseInt(await contract.methods.maxParticipationTier(1).call({from:  user_address }))
      //   , maxParticipationTier2 : light ? null : parseInt(await contract.methods.maxParticipationTier(2).call({from:  user_address }))
      //   , maxParticipationTier3 : light ? null : parseInt(await contract.methods.maxParticipationTier(3).call({from:  user_address }))
      //   , maxParticipation : light ? null : parseInt(await contract.methods.maxParticipationTier(4).call({from:  user_address }))
      //   , minAlienTokensTier1 : light ? null : parseInt(await contract.methods.minAlienTokensTier(1).call({from:  user_address }))
      //   , minAlienTokensTier2 : light ? null : parseInt(await contract.methods.minAlienTokensTier(2).call({from:  user_address }))
      //   , minAlienTokensTier3 : light ? null : parseInt(await contract.methods.minAlienTokensTier(3).call({from:  user_address }))
      //   , minAlienTokensTier4 :  light ? null : parseInt(await contract.methods.minAlienTokensTier(4).call({from:  user_address }))
    
      //   , goal :  parseInt(await contract.methods.goal().call({from:  user_address }))
      //   , tokenAddress : light ? null : await contract.methods.token().call({from:  user_address })
    
      //   , hasClosed : await contract.methods.hasClosed().call({from:  user_address })
      //   , isFinalized : await contract.methods.isFinalized().call({from:  user_address })
    
      //   , vault : light ? null : await contract.methods.vault().call({from:  user_address })
        
      //   , amountToClaim : light ? null : parseInt(await contract.methods.amountToClaim().call({from:  user_address }))

      //   , logo_url : await contract.methods.logo_url().call({from:  user_address })
      //   , website_url : await contract.methods.website_url().call({from:  user_address })

      //   , kyc_verified : await contract.methods.kyc_verified().call({from:  user_address })
      //   , audited : await contract.methods.audited().call({from:  user_address })

      // }
    


      //info.totalSupply = await tokenContract.methods.totalSupply().call({from:  user_address })
    //   info.symbol = await tokenContract.methods.symbol().call({from:  user_address })
    //   info.decimals = await tokenContract.methods.decimals().call({from:  user_address })
    //   info.name = await tokenContract.methods.name().call({from:  user_address })
      


    //   return info
    }catch(e){
        console.log("ERROR getCrowdsaleInfo", e.toString())
        return {}
    }
      
    }

  ,

  getCrowdsale : async function (id, user_address, web3js){
    
	try{
	let contract = new web3js.eth.Contract(config.masterCrowdsale_abi, config.masterCrowdsaleAddress);
 

  return await contract.methods.getCrowdsale(id).call({from:  user_address })
}catch(e){
	console.log("ERROR getCrowdsale", e.toString())
	return null
}
  
  }
  ,

  getCrowdsaleCount : async function (web3js, user_address ){
    
    try{
    let contract = new web3js.eth.Contract(config.masterCrowdsale_abi, config.masterCrowdsaleAddress);
  
    return parseInt(await  contract.methods.countCrowdsale().call({from:  user_address }))
  }catch(e){
    console.log("ERROR getCrowdsaleCount", e.toString())
    return null
  }
    
    }

    ,
    newCrowdsale : async function (web3js, user_address, params ){
    
      try{
      let contract = new web3js.eth.Contract(config.masterCrowdsale_abi, config.masterCrowdsaleAddress);
        
      let owner = await contract.methods.owner().call({from:  user_address})
      console.log("fees owner", owner)
        let fees=(user_address== owner ?0
        :await contract.methods.fees().call({from:  user_address}))

        console.log("fees2", fees)
       

      let intParams = [params.cap, params.goal, params.max_participation, params.min_participation
                  , params.presale_rate, params.openingTime, params.closingTime 
                      ,params.listing_rate, params.locking_duration,0]
        
        contract.methods.newCrowdsale(user_address
                                            ,params.token_address
                                           ,config.alienAddress
                                           
                                           ,intParams
                                           ,params.liquidity_percentage
                                           ,params.logo_url
                                           ,params.website_url,false

        ).send({from:  user_address, value:fees })

          

    }catch(e){
      console.log("ERROR newCrowdsale", e.toString())
      return null
    }
      
      }

    ,
    approve : async function (web3js, user_address, approve_address, token_address ){
       
      try{
      let contract = new web3js.eth.Contract(config.token_abi, token_address);
 
        let user_balance =  await contract.methods.balanceOf(user_address).call({from:  user_address })

        console.log("approve user_balance", user_balance )
          contract.methods.approve(approve_address, user_balance ).send({from:  user_address })
 
        
    }catch(e){
      console.log("ERROR approve: ", e.toString())
      return null
    }
      
      }

     
    
     
}

export default contracts;