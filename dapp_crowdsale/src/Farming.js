import React, { useState } from "react";
import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import watch from 'redux-watch'
import { createLogger } from 'redux-logger'

import contracts from './contracts_api.js'
import   { config } from './config.js'
import util from './util.js'

import logo from './logo.svg';
import './App.css';

import Portis from "@portis/web3";
import Web3 from "web3";
import Web3Modal from "web3modal";

import {  Backdrop, CircularProgress  } from "@material-ui/core";
import { LinearProgress } from '@material-ui/core';
import Favicon from 'react-favicon';

import conf from './config.js'
import uti from './util.js'
import reducers from './reducers.js'

import Countdown from 'react-countdown';

import clsx from 'clsx';
import { makeStyles,useTheme,withStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import SpaIcon from '@material-ui/icons/Spa';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

 
import FarmCard from './FarmCard.js';
 
import Typography from '@material-ui/core/Typography'; 

import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile
  } from "react-device-detect";

  import { Modal } from 'react-bootstrap';

  import TextField from '@material-ui/core/TextField';

  const logger = createLogger({
	duration : false  , // print the duration of each action?
	timestamp : true, // print the timestamp with each action?
	logger : console, // implementation of the `console` API.
	logErrors : true, // should the logger catch, log, and re-throw errors?
	diff : false, // (alpha) show diff between states?
 
  });

  var store_farming = createStore(reducers.farming,applyMiddleware(logger))

  
  class Farming extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }

      let {userAddress, userBalance, navbar_open} = this.props
  
      this.style = {
        width: navbar_open && !isMobile ? "calc(100% - 240px)" : "" ,
        "transition": "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,width 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
           "margin-left": navbar_open && !isMobile ? "240px" : "",

        color : "black"
    }

    this.enableFarm = this.enableFarm.bind(this);
  
    }
	
    expandFarm(){
      console.log("expandFarm")
    }

    async componentDidMount(){
		document.title = "Farms | SpaceSeed "
      
    let {userAddress, userBalance, navbar_open, web3js} = this.props
        if(!userAddress || !web3js ) return 

      //watchers
      let w1 = watch(store_farming.getState, 'loading')
      store_farming.subscribe(w1((newVal, oldVal, objectPath) => {
          //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
          this.setState({key : Date.now()})
      }))

      //watchers
      let w2 = watch(store_farming.getState, 'apy')
      store_farming.subscribe(w2((newVal, oldVal, objectPath) => {
          //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
          this.setState({key : Date.now()})
      }))

 

      let farmAddress = await contracts.call(web3js
        , config.masterFarm_abi
        , config.masterFarmAddress
        , "getLatestFarmByTokenAddress"
        , userAddress
        , ["0x0"])

        let farmInfo =    await contracts.callMany(web3js, config.farm_abi,  farmAddress
          , ["tokenAddrReward"
          , "tokenAddrStake"
          , "rpsNumerator", "rpsDenominator"
          , "minParticipation"
          , "maxParticipation"]
          ,userAddress
          , { })

          console.log("farmInfo", farmInfo)
       
        let tokenReward = await contracts.callMany(web3js, config.token_abi,  farmInfo.tokenAddrReward
            , ["symbol"
            , "decimals"
            , "name"
             ]
            ,userAddress
            , { })
            tokenReward.address = farmInfo.tokenAddrReward
        
          let tokenStake = await contracts.callMany(web3js, config.token_abi,  farmInfo.tokenAddrStake
            , ["symbol"
            , "decimals"
            , "name"
              ]
            ,userAddress
            , { })
            tokenStake.address = farmInfo.tokenAddrStake
          
         farmInfo.tokenStake=tokenStake
         farmInfo.tokenReward=tokenReward
          farmInfo.farmAddress = farmAddress
        store_farming.dispatch({type:1, farmInfo:farmInfo })

        this.setState({key:Date.now()})
 
    }
  
    openModalStaking(index){  
      store_farming.dispatch({type:1,  showModalStaking: index})
    }

    async enableFarm(farmIndex){
      const {userAddress, web3js} = this.props
 
      const {farms} = store_farming.getState();

      const {tokenStake, farmAddress} = farms[farmIndex]
 
      await contracts.approve(web3js, userAddress,farmAddress,tokenStake.address)

    }
    render(){
 
            let {web3js,userAddress, userBalance, navbar_open} = this.props  
            let {farms, showModalStaking} = store_farming.getState();

            console.log("[RENDER] Farming", farms.length)

            if(farms.length===0)return null

            
            const {pair, apy, contractAddress, earned, tokenAddrStake} = farms[0]
          return (
                      <div class="row">



                <div class="col-12" key={this.state.key}>
                            <FarmCard   
                                    farmIndex={0}
                                    farmInfo={farms[0]} 
                                    openModalStaking={this.openModalStaking} 
                                    enableFarm={this.enableFarm}
                            />

                            
                </div>

                
                  <ModalStaking
                    userAddress={userAddress}
                    web3js={web3js}
                  />
               
 
                      </div>
          )
   
   
    }
  
  }

  export default connect(
    (state) => ({
        ...state
  
    })
  )(Farming);

  class ModalStaking extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now()
                      , amountToStake : 0
                  }

     this.handleAmount = this.handleAmount.bind(this);
     this.stake = this.stake.bind(this);
     
    }

    
    componentDidMount(){
      
      let w1 = watch(store_farming.getState, 'showModalStaking')
      store_farming.subscribe(w1((newVal, oldVal, objectPath) => {
          //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
          this.setState({key : Date.now()})
      }))
    }

    hide(){
      store_farming.dispatch({type:1, showModalStaking:null})
    }
    handleAmount(e){
      this.state.amountToStake = parseFloat(e.target.value)
    }
    async stake(){
      const {userAddress, web3js} = this.props
      const {amountToStake}=this.state
      const {farms, showModalStaking} = store_farming.getState();

      const {tokenStake, farmAddress} = farms[showModalStaking]
      const {decimals} = tokenStake;

      let amount = util.formatExp(amountToStake, decimals)
 
      await contracts.send(web3js, config.farm_abi, farmAddress
        , "stake"
        ,userAddress
        , [amountToStake]  )
    }
    
    render(){

    
      const {showModalStaking, farms} = store_farming.getState(); 
      const {key} = this.state;
    
      console.log("[ModalStaking]", showModalStaking)

      if(  showModalStaking===undefined || showModalStaking===null || farms.length === 0) return null

      const {tokenStake} = farms[showModalStaking]

      console.log("tokenStake", tokenStake)
      return(
        <Modal
        show={true}
        key={key}
        onHide={this.hide}
      >
      <Modal.Header>
        
        <Typography variant="body"  >Stake {tokenStake.name}</Typography>
      </Modal.Header>

      <Modal.Body>
        
        <div class="row">
      <TextField   
        id="form-token"
        name="token_address"
        type="number"
        className="col-md-6 sol-sm-6"
        //label="Token Address"
        defaultValue={""}
        placeholder="Type amount"
        onChange={this.handleAmount}
        
        //error={errors.token_address}
        //helperText={errors.token_address}
        />

      <Button variant="contained" 
                  color="secondary"
                  className="col-md-6 sol-sm-6"
                  onClick={this.stake}>
          Confirm Staking  
          
          </Button>

          </div>

      </Modal.Body>
      </Modal>
      
      )
    }
  }
 

  
