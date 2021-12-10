import React, { useState } from "react";
import { connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import watch from 'redux-watch'
import { createLogger } from 'redux-logger'

 
import './App.css';

 

import conf, { config } from './config.js'
import util from './util.js'
import reducers from './reducers.js'
import contracts from './contracts_api.js'

import Countdown from 'react-countdown';

 
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Typography from '@material-ui/core/Typography';

import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile
  } from "react-device-detect";

  import Button from '@material-ui/core/Button';

  import LoadingSpinner from './LoadingSpinner.js';

  const bnb_decimals = config.bnb_decimals;
  const alien_decimals = config.alien_decimals;

  const logger = createLogger({
	duration : false  , // print the duration of each action?
	timestamp : true, // print the timestamp with each action?
	logger : console, // implementation of the `console` API.
	logErrors : true, // should the logger catch, log, and re-throw errors?
	diff : false, // (alpha) show diff between states?
 
  });


  var store_presaleList = createStore(reducers.presaleList,applyMiddleware(logger))

  class PresaleList extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }

      let {userAddress, userBalance, navbar_open} = this.props
  
      this.style = {
 
        color : "black"
    }
  
    this.addPresale = this.addPresale.bind(this);
    }
	
    async componentDidMount(){
        
		document.title = "Presales | SpaceSeed "
        let {userAddress, userBalance, navbar_open, web3js} = this.props
        if(!userAddress || !web3js || !userBalance) return 


        //watchers
        let w1 = watch(store_presaleList.getState, 'crowdsaleAddress')
        store_presaleList.subscribe(w1((newVal, oldVal, objectPath) => {
            //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
            this.setState({key : Date.now()})
        }))


        let w2 = watch(store_presaleList.getState, 'loading')
        store_presaleList.subscribe(w2((newVal, oldVal, objectPath) => {
            //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
            this.setState({key : Date.now()})
        }))


        //get data

        store_presaleList.dispatch({type:1, loading:true})

  
        let crowdsaleCount = parseInt(await contracts.call(web3js
            , config.masterCrowdsale_abi
            , config.masterCrowdsaleAddress
            , "countCrowdsale"
            , userAddress
            , []))
        
        store_presaleList.dispatch({type:1,   crowdsaleCount : crowdsaleCount
                                            , startIndex:crowdsaleCount })
        
        await util.sleep(100)
        this.loadPresale()
    }
  
    async loadPresale(){
        console.log("[loadPresale]")
        let {userAddress, userBalance, navbar_open, web3js} = this.props

        if(!userAddress) return

        const{startIndex, displayCount} = store_presaleList.getState();

        let crowdsale_details=null;
        
        let i= startIndex;
           
            let crowdsaleAddress = await contracts.call(web3js
            , config.masterCrowdsale_abi
            , config.masterCrowdsaleAddress
            , "getCrowdsale"
            , userAddress
            , [i])
           
            console.log("WIN")
             crowdsale_details= await contracts.getCrowdsaleInfo(web3js, crowdsaleAddress, userAddress, true)
            crowdsale_details.crowdsaleAddress = crowdsaleAddress
            crowdsale_details.index = i 
 
            console.log("LOOSE")
        store_presaleList.dispatch({type:1, 
            crowdsale_details:crowdsale_details
            })
 
         
         store_presaleList.dispatch({type:1, loading:false})

    }

    async addPresale(e){
        console.log("[addPresale]")
        e.preventDefault()
        let {userAddress, userBalance, navbar_open, web3js} = this.props

        let{startIndex, displayCount} = store_presaleList.getState();

        let i = startIndex-displayCount
        displayCount++
        
        if(i===0) return 

 
        store_presaleList.dispatch({type:1, loading:true})

        let crowdsaleAddress = await contracts.call(web3js
            , config.masterCrowdsale_abi
            , config.masterCrowdsaleAddress
            , "getCrowdsale"
            , userAddress
            , [i])


        let crowdsale_details= await contracts.getCrowdsaleInfo(web3js, crowdsaleAddress, userAddress, true)
        crowdsale_details.crowdsaleAddress = crowdsaleAddress
        crowdsale_details.index = i 

    
        store_presaleList.dispatch({type:1, 
            crowdsale_details:crowdsale_details,
            push_crowdsale : true,
            displayCount : displayCount
            })
 
        
         store_presaleList.dispatch({type:1, loading:false})
        
    }

    render(){
        console.log("[RENDER] PresaleList", this.props)
    
            const {userAddress, userBalance, navbar_open} = this.props

            const { crowdsaleCount, crowdsaleAddress, crowdsale_details
                , loading, displayCount,startIndex
            
                } = store_presaleList.getState();
 
            // <span style={this.style}> Presale 0 {crowdsaleAddress} </span>

            if(!userAddress) return null
          return (
              <div class="row" style={this.style}>
                  
                   <LoadingSpinner show={loading}/>

                    <h2></h2>

                    <Typography variant="h2"  >{crowdsaleCount} presales</Typography> 

 

                    {
                        crowdsale_details.map((crowdsale)=>{

                            let {goal, cap, openingTime, closingTime, isFinalized, hasClosed,
                                kyc_verified,audited, name, symbol, logo_url, website_url,
                                crowdsaleAddress, index
                            } = crowdsale
                
                            let status = "Open"
                
                            if(isFinalized) status="Finalized"
                            else if (hasClosed) status = "Closed"
                            else if (Date.now() < openingTime) status = "Not started"
                            else   status = "Open"
                
                            
                            cap /=  10**bnb_decimals
                            goal /=  10**bnb_decimals
                
                
                            let now = Date.now()

                            
                            
                            return (<div class={"card col-sm-12 col-md" + (displayCount>3 ? "-4" : "")} >
                        
                            <div class="card-body">
                                <h5 class="card-title">  {name} ({symbol}) 
                                <br/>
                                <span class="badge bg-light text-dark"> #{index} </span> 
        
                                <div>
                                <a href={"/presale/"+crowdsaleAddress}>
                                <img 
                                    src={ logo_url} 
                                    alt="" 
                                    style={{maxWidth:"50px"}} />
        
                                {" "}
                                </a>
                                </div>
        
                                </h5>
        
                                <h6 class="card-subtitle mb-2 text-muted">
                                    {
                                    
                                    (kyc_verified || audited)
                                    &&
                                    
                                     <img src={require("./img/checked.svg").default} 
                                    style={{maxWidth:"20px"}}
                                    title="KYC" />
                                   
                                    }
                                    
                                    {kyc_verified && " KYC "}
        
                                    {kyc_verified && audited && " / "}
        
                                    {audited && " Audited "} 
        
                                </h6>
        
                           
                                
        
                                 { status==="Not started"&&
                                Date.now() < openingTime && <Countdown className="text-danger" date={openingTime} /> }
                                <br/>
                                { status==="Open"  &&
                                Date.now() < closingTime && <Countdown className="text-danger" date={closingTime} /> }
                                
                                
                                <List className="mobile_list">
                                
        
                                
        
                                <ListItem button key={"presaleList"} >
                                    <ListItemIcon>
                                        <img src={require("./img/clock.svg").default} alt="" style={{maxWidth:"20px"}}/>
                                    </ListItemIcon>
                                    
                                    <ListItemText  primary={"Start date"} />
        
                                    { openingTime < Date.now() 
                                            && <ListItemText  primary={openingTime ? util.formatDate(new Date(openingTime))   : ""} />
                                    }
        
                                    {
                                        openingTime > Date.now()
                                        &&
                                        <Countdown date={openingTime} />
                                    }
        
                                </ListItem>
        
        
                                <Divider />
                                
                                {/*
                                <ListItem button key={"presaleList"} >
           
                                    <ListItemIcon>
                                        <img src={require("./img/target.svg").default} alt="" style={{maxWidth:"20px"}}/>
                                    </ListItemIcon>
                                    
                                    <ListItemText  primary={"Softcap"} />
        
                                    <ListItemText  primary={goal + " BNB"} />
                                </ListItem>
                                */}
        
                                <Divider />
        
                                <ListItem button key={"presaleList"} >
           
                                    <ListItemIcon>
                                        <img src={require("./img/target.svg").default} alt="" style={{maxWidth:"20px"}}/>
                                    </ListItemIcon>
                                    
                                    <ListItemText  primary={"Hardcap"} />
        
                                    <ListItemText  primary={cap + " BNB"} />
                                </ListItem>
        
        
        
                             
        
                                </List>
        
        
                                <hr/>
        
                                 <a href={"/presale/"+crowdsaleAddress}>{util.statusHTML(status)}</a> 
        
                                
                            </div>
                            </div>
                            )
 
 
                        })
                    }
            

                        {
                            crowdsale_details.length > 0
                            && startIndex-displayCount >0
                            &&
                            <div class="col-md-12">
                            <Button variant="contained" 
                                    color="primary"
                                    onClick={this.addPresale}>
                            See More
                            </Button>
                            </div>
                        }
                        

      

              </div>
                        
          )
   
   
    }
  
  }

  export default connect(
    (state) => ({
        ...state
  
    })
  )(PresaleList);



 

 