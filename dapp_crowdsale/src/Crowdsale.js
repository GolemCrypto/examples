import React, { useState } from "react";

import { createStore, applyMiddleware } from 'redux'
import watch from 'redux-watch'
import { createLogger } from 'redux-logger'

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

import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';

import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile
  } from "react-device-detect";


  const logger = createLogger({
	duration : false  , // print the duration of each action?
	timestamp : true, // print the timestamp with each action?

	logger : console, // implementation of the `console` API.
	logErrors : true, // should the logger catch, log, and re-throw errors?
   
	diff : false, // (alpha) show diff between states?
 
  });


  class Crowdsale extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }
  
      this.style = {
        position: "absolute",
        left: "50%",
        margin : "auto",
        "margin-top" : "20em",
        "z-index" : "10",
        color : "#DD5E89"
    }
  
    }
	
    componentDidMount(){
		document.title = "SpaceSeed Private Sale DAPP"
 
    }
  
    render(){
 
	
        let { key, amount,error,
            userBalance, userAddress, totalSupply, name,  symbol, decimals
              , tokenAddress, available_tokens, rate, weiRaised, openingTime, closingTime
              , cap, goal,
              minParticipation,
              maxParticipationTier1,
              maxParticipationTier2,
              maxParticipationTier3,
              maxParticipationTier4,
        
              minAlienTokensTier1,
              minAlienTokensTier2,
              minAlienTokensTier3,
              minAlienTokensTier4 
            , hasClosed, isFinalized, status,
            amountToClaim
    
        } = this.state
        
        console.log("test available_tokens", available_tokens)
        if(!cap)return <span></span>
        
        let multiplier = 10**decimals 
        totalSupply/=multiplier
     
        userBalance/=10**alien_decimals 
    
        cap /=  10**bnb_decimals
        goal /=  10**bnb_decimals
        available_tokens/=10**decimals
        minParticipation /=   10**bnb_decimals
        maxParticipationTier4 /=   10**bnb_decimals
        maxParticipationTier3 /=   10**bnb_decimals
        maxParticipationTier2 /=   10**bnb_decimals
        maxParticipationTier1 /=   10**bnb_decimals
    
        minAlienTokensTier4 /=10**decimals 
        minAlienTokensTier3 /=10**decimals 
        minAlienTokensTier2 /=10**decimals 
        minAlienTokensTier1 /=10**decimals
        amountToClaim /=10**decimals
     
        rate = rate
        
        let bnbRaised = weiRaised/10**bnb_decimals
    
        let canBuy = parseFloat(amount) && amount >= minParticipation && amount <= maxParticipationTier4
    
        let percentComplete = (100*bnbRaised/(cap))
    
     
        let now = Date.now()
        let statusHTML = null;
        if(status === "Finalized") statusHTML = <span class="badge bg-primary">Finalized</span>
        else if (status === "Closed") statusHTML = <span class="badge bg-danger  ">Closed</span>
        else if (status === "Not started") statusHTML = <span class="badge bg-warning text-dark">Not started</span>
        else if (status === "Open")  statusHTML = <span class="badge bg-success">Open</span>
    
          return (
    
            <div class="card" style={{    color:"#404040"}}>
     
    
            <div class="card-body">
            {statusHTML} 
            <h2 class="card-title">{name} Private Sale</h2>
    
            <h5>{percentComplete} % ({bnbRaised} BNB ) completed</h5>
    
            {
                bnbRaised < goal && status === "Finalized"
            &&<p class="text-danger" style={{fontWeight:"500"}}>
                    Goal was not reached 
                    <br/>
                    <button type="button" 
                            class="btn btn-danger"
                            onClick={this.refund}
                            >
                        Refund me
                    </button>
            </p>
               }
    
            {
            bnbRaised >= goal && status === "Finalized"
            &&
              amountToClaim > 0 
            &&
            <p>
                      <button type="button" 
                            class=" btn-grad-success"
                            onClick={this.claim}
                            >
                        Claim {amountToClaim} {symbol}
                    </button>
            </p>
               }
               {	
               bnbRaised >= goal && status === "Finalized"
               &&
                !amountToClaim
                && <p>
                    No Token to claim.
                </p>
               }
    
        { status!=="Closed" && status!=="Finalized"&&
         Date.now() < openingTime && <Countdown date={openingTime} /> }
        <br/>
        { status!=="Closed" && status!=="Finalized"&&
        Date.now() < closingTime && <Countdown date={closingTime} /> }
    
            <div class="w3-border">
            <div class="w3-grey"  style={{height:"24px", width:"20%"}}></div>
            </div>
            <div class="progress">
                
    
    
            <div class="progress-bar" 
                    role="progressbar" 
                    aria-valuenow={bnbRaised} aria-valuemin="0" aria-valuemax={cap} 
                    style={{width: percentComplete + "%" }}>
                <span class="sr-only">{bnbRaised} BNB</span>
            </div>
            </div>
    
     
            
             
                <div class="row">
            <div class="col-5  ">
            <hr/>
                        <p class="card-text"> 
    
                        
                        Contract address
                        <hr/>
                        Available tokens     
                        <hr/>
                        Hardcap 
                        <hr/>
                        softCap  
                        <hr/>
                        openingTime  
                        <hr/>
                        closingTime  
                        <hr/>
                        Rate  
                        <hr/>
                        minParticipation  
                        <hr/>
                         Tier 1
                        <hr/>
                         Tier 2
                        <hr/>
                         Tier 3
                        <hr/>
                         Tier 4
                         </p>
                        
                    </div>
                
            <div class="col-7  ">
            <p class="card-text">
            <hr/>
                {tokenAddress}
                <hr/>
                { util.formatNumber(available_tokens)} {symbol} 
                <hr/>
               {cap}  BNB
               <hr/>
                {goal}   BNB
                <hr/>
                {openingTime ? (new Date(openingTime)).toString()  : "No" } 
                <hr/>
                {closingTime ? (new Date(closingTime)).toString()  : "No" }
                
                <hr/>
                {rate} {symbol} / BNB
                <hr/>
                {minParticipation}     BNB
                <hr/>
                min tokens required {util.formatNumber(minAlienTokensTier1)} / maxParticipation {maxParticipationTier1} BNB 
                <hr/>
                min tokens required {util.formatNumber(minAlienTokensTier2)} / maxParticipation {maxParticipationTier2} BNB  
                <hr/>
                min tokens required {util.formatNumber(minAlienTokensTier3)} / maxParticipation {maxParticipationTier3} BNB 
                <hr/>
                min tokens required {util.formatNumber(minAlienTokensTier4)} / maxParticipation {maxParticipationTier4} BNB 
     
            </p>
            </div>
    
            </div>
                
             
        </div>
        </div>
          )
   
   
    }
  
  }

  export default Crowdsale;

 