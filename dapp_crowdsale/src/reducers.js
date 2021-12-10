import util from './util.js'

export default   {

    app : function(state={
      navbar_open : true
      , userAddress : null 
      , userBalance : null 
      , web3js : null 
      , expand_presale : true
      , loading : false
       }, action){
        
        let keys = Object.keys(action)

        keys.forEach((key)=>{
          state[key] = action[key]
        })

       return state
     
     },
     
     crowdsale : function(state={
       
        amount : null,
        crowdsaleAddress : null
        ,rate :  null
        ,weiRaised :  null
        , cap : null
        , openingTime : null
        , closingTime : null
        , goal : null
        , minParticipation : null
        , available_tokens : null
        , minAlienTokensTier4: null,
        maxParticipationTier1:null,
        maxParticipationTier2:null,
        maxParticipationTier3:null,
        maxParticipation:"5000000000000000000",

        minAlienTokensTier1 : null,
        minAlienTokensTier2 : null,
        minAlienTokensTier3 : null,
        minAlienTokensTier4 : null,
                            
        tokenAddress : null
        , hasClosed : null
        , isFinalized : null
        , vault : null
        , amountToClaim : null
        ,isRefunding:null
        , decimals : null
        , symbol : null
        , name : null
        , status : null 
  
         }, action){
          
 
  
        let keys = Object.keys(action)

        keys.forEach((key)=>{
          state[key] = parseFloat(action[key]) || action[key]==="0" ? parseFloat(action[key]) : action[key]         
          if(key==="openingTime" || key==="closingTime") state[key] *=1000
        })

         return state
       
       },
    
       presaleList : function(state={

        loading :false,
        crowdsaleAddress : null,
        crowdsale_details : [],
        crowdsaleCount : 0,
        startIndex : 1,
        displayCount : 1
 
         }, action){
          
          if(action.loading !== undefined)
          state.loading = action.loading

          if(action.crowdsaleCount !== undefined)
          state.crowdsaleCount = action.crowdsaleCount

          if(action.startIndex !== undefined)
            state.startIndex = action.startIndex

            if(action.displayCount !== undefined)
            state.displayCount = action.displayCount
          
          
          if(action.reset){
            action.crowdsale_details=[]
          }

          if(action.crowdsale_details){
            let keys= Object.keys(action.crowdsale_details)
            let info = {}
             
            for(let i=0; i<keys.length;i++){
                let key = keys[i]
                let val = action.crowdsale_details[key]
                info[key] = parseFloat(val) || val==="0" ?  parseFloat(val) : val

                if(key==="openingTime" || key==="closingTime") info[key]*=1000 //convert to seconds
            }
            
            if(action.push_crowdsale)
            state.crowdsale_details.push(info)
            else
            state.crowdsale_details=[info]
          }
          
        


  
         return state
       
       },

       presaleForm : function(state={

        refresh:0,
        loading :false,

       
        token_address : "0x0",
        logo_url : "https://i.ibb.co/L5z7MBw/logo-muslim2.png",
        website_url : "https://muscoins.com/",
        cap : 40,
        goal :  4,
        min_participation:0.1,
        max_participation:40,
        presale_rate : 12348,
        //prod 1630494000
        openingTime : 1630494000 ,  //seconds timestamp
        closingTime: 1630494000+ 3600*48,   //seconds timestamp
        liquidity_percentage:0,
        listing_rate:1 ,
        lockingTime : 1630494000 +3600*24*7
 
         }, action){
          
          let keys = Object.keys(action)

          
          if(action.refresh !== undefined)
          state.refresh++;

          keys.forEach((key)=>{
            if(key === "refresh") return

            state[key] = parseFloat(action[key]) ? parseFloat(action[key]) : action[key]

            if(key=== "openingTime" || key==="closingTime" || key ==="lockingTime") 
            state[key] =  Date.parse(action[key])/1000
 
          })
 
         return state
       
       },

       presaleFormErrors : function(state={

        token_address : false,
        logo_url : false,
        website_url : false,
        cap : false,
        goal : false,
        min_participation:false,
        max_participation:false,
        presale_rate : false,
        openingTime : false,  
        closingTime:false,  
        liquidity_percentage:false,
        listing_rate:false ,
        lockingTime : false
        
 
         }, action){
          
          let keys = Object.keys(action)

   
          keys.forEach((key)=>{
            if(key === "errors") return

            state[key] = action[key]
          })

          if(action.update_all){
            state = action
          }

  
         return state
       
       },

       farming : function(state={

        loading :false,
 
        farms : [],
        crowdsaleCount : 0,
        startIndex : 1,
        displayCount : 1,
        
        showModalStaking : null // null or integer for farm index
  
         }, action){
          
          action = util.parseJsonNumber(action)
          let keys = Object.keys(action)
          
          if(!action.farmInfo)
          keys.forEach((key)=>{
            if(key === "errors") return
            state[key] = action[key]
          })

          if(action.farmInfo){
            
            let farmInfo=util.parseJsonNumber(action.farmInfo)
             farmInfo.apy=100* farmInfo.rpsNumerator/ farmInfo.rpsDenominator
            farmInfo.tokenReward = util.parseJsonNumber(farmInfo.tokenReward)
            farmInfo.tokenStake = util.parseJsonNumber(farmInfo.tokenStake)
            if(action.push)
              state.farms.push(farmInfo)
            else 
              state.farms = [farmInfo]
          }

  
         return state
       
       },
}