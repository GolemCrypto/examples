import React, { useState } from "react";
import { connect, Provider } from 'react-redux';
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

 var chainId=null;
  const logger = createLogger({
	duration : false  , // print the duration of each action?
	timestamp : true, // print the timestamp with each action?
	logger : console, // implementation of the `console` API.
	logErrors : true, // should the logger catch, log, and re-throw errors?
	diff : false, // (alpha) show diff between states?
 
  });
  const addNetwork = (params) =>
    window.ethereum.request({ method: 'wallet_addEthereumChain', params })
      .then(() => {
        console.log( `Switched to ${params[0].chainName} (${parseInt(params[0].chainId)})`)
        chainId=parseInt(params[0].chainId);
      })
      .catch((error) => console.log( `Error: ${error.message}`))

      const addToken = (params) =>
      window.ethereum.request({ method: 'wallet_watchAsset', params })
        .then(() => console.log('Success, Token added!'))
        .catch((error) => console.log( `Error: ${error.message}`))
  
    const addMuscToken = () =>
      addToken({
        type: 'ERC20',
        options: {
          address: '0x0',
          symbol: 'MUSC',
          decimals: 18,
          image: 'https://raw.githubusercontent.com/pierrot498/configure-bsc/main/logo.jpg'
        }
      })
  function addBSCMainnet() {
    addNetwork([
      {
        chainId: '0x38',
        chainName: 'Smart Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
      }
    ])}
  class Buttons extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  chainId : null }
        let {userAddress, userBalance, navbar_open, web3js} = this.props
        
   
      this.style = {
        
        width: navbar_open && !isMobile ? "calc(100% - 240px)" : "" ,
        "transition": "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,width 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
           "margin-left": navbar_open && !isMobile ? "240px" : "",

        color : "black"
    }
  
  
   
  
    }
	
    componentDidMount(){
      var networkName = this.chainId === 56 ? 'Mainnet' : 'Testnet'
		document.title = "SpaceSeed Staking"
        
       
    }
  
    render(){
        console.log("[RENDER] Staking")
    
            let {userAddress, userBalance, navbar_open} = this.props
    
          return (
                      
                        <div style={this.style} className="App">
      <header className="App-header">
        Add Mainnet BSC to Metamask.
      </header>

      <section>
        <h2>step 1</h2>
        Download Metamask.
      </section>

      {chainId && (
        <section>
          <h2>Current Network</h2>
          <p><strong>ChainId</strong> {chainId}</p>
          <p><strong>Name</strong> {this.networkName}</p>
        </section>
      )}

      <section>
        <h2>Step 2:</h2>
        <button onClick={addBSCMainnet}>Add Binance Mainnet</button>
      </section>

      {
        <section>
          <h2>Step 3:</h2>
          <p>Add the MUSC token!</p>
          <p>Click below to add the <strong>{this.networkName}</strong> MUSC token.</p>
          <button onClick={addMuscToken }>Add MUSC Token</button>
        </section>
      }

      

    </div>
          )
   
   
    }
  
  }

  export default connect(
    (state) => ({
        ...state
  
    })
  )(Buttons);

 