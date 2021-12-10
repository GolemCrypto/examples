import React, { useState } from "react";
import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import watch from 'redux-watch'
import { createLogger } from 'redux-logger'

 
import './App.css';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';

import {  Backdrop, CircularProgress  } from "@material-ui/core";
import { LinearProgress } from '@material-ui/core';
 

import conf, { config } from './config.js'
import util from './util.js'
import reducers from './reducers.js'
import contracts from './contracts_api.js'

 
 
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
 
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Alert from '@material-ui/lab/Alert';


import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile
  } from "react-device-detect";

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


  var store_presaleForm = createStore(reducers.presaleForm,applyMiddleware(logger))

  var store_presaleFormErrors = createStore(reducers.presaleFormErrors,applyMiddleware(logger))

  class PresaleForm extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }

      let {userAddress, userBalance, navbar_open} = this.props
  
      this.style = {
        
    
        color : "black"
    }

    this.updateForm = this.updateForm.bind(this);
    this.checkForm = this.checkForm.bind(this);
    this.newPresale = this.newPresale.bind(this);
    this.approve = this.approve.bind(this);
    }
	
    async componentDidMount(){
		document.title = "New Presale | SpaceSeed"
        let {userAddress, userBalance, navbar_open, web3js} = this.props
        if(!userAddress) return 

 
        store_presaleFormErrors.subscribe( ()=>{
            this.setState({key : Date.now()})
          });

        let w2 = watch(store_presaleForm.getState, 'loading')
        store_presaleForm.subscribe(w2((newVal, oldVal, objectPath) => {
            //console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
            this.setState({key : Date.now()})
        }))


        //get data

        store_presaleForm.dispatch({type:1, loading:true})
 
        store_presaleForm.dispatch({type:1, loading:false})
    }
  
    checkForm(){
        console.log("[Checkform]")
        let {  token_address,
            logo_url  ,
            website_url  ,
            cap  ,
            goal  ,
            min_participation,
            max_participation,
            presale_rate  ,
            openingTime  , //seconds timestamp
            closingTime, //seconds timestamp
            liquidity_percentage,
            listing_rate,
            lockingTime } = store_presaleForm.getState();
        
        let errors = {type:1, update_all : true}
        
        if(!token_address) errors.token_address = "Missing"
        
        if(!website_url) errors.website_url = "Missing"
        if(!logo_url) errors.logo_url = "Missing"
        if(!cap) errors.cap = "Missing"
        if(!goal) errors.goal = "Missing"
        if(!min_participation) errors.min_participation = "Missing"
        if(!max_participation) errors.max_participation = "Missing"
        if(!presale_rate) errors.presale_rate = "Missing"
        if(!openingTime) errors.openingTime = "Missing"
        if(!closingTime) errors.closingTime = "Missing"
        if(liquidity_percentage>0 && !listing_rate) errors.listing_rate = "Missing"
        

        //amount order errors
        if(cap && goal && cap < goal) errors.cap = "Softcap needs to be lower than hardcap"
        
        if(min_participation && max_participation && min_participation > max_participation) 
        errors.min_participation = "Min part. needs to be lower than max part."
        
        if(openingTime && closingTime && openingTime > closingTime) 
        errors.openingTime = "openingTime needs to be earlier than closingTime"
        
        if(closingTime && lockingTime && openingTime > lockingTime - 3600*24*7) 
        errors.lockingTime = "lockingTime needs to be at least a week after closingTime"
        

        if(cap && max_participation && max_participation > cap)  
        errors.max_participation = "Max participation needs to be lower than softcap."
        //format errors
            
        //checking eth/bsc address
        //need to check for other networks in the future
        if(token_address && !config.regex_eth_addr.test(token_address))  errors.token_address = "Invalid address"
        
        
        if(website_url && !config.regex_url.test(website_url))  errors.website_url = "Invalid url"
        
        if(logo_url && !config.regex_url.test(logo_url))  errors.logo_url = "Invalid url"

        store_presaleFormErrors.dispatch(errors)

        let error_count = Object.keys(errors).length - 2
        
       
        return error_count

    }
    updateForm(e){
        let name = e.target.name 
        let value = e.target.value
        let json = {type:1}

        console.log("name", name, "value", value) 
        json[name] = value
        store_presaleForm.dispatch(json)

        
    }

    async approve(e){
        e.preventDefault();
        const {web3js, userAddress} = this.props;

        const {token_address} = store_presaleForm.getState();

        await contracts.approve(web3js, userAddress,config.masterCrowdsaleAddress,token_address)


    }
    async newPresale(e){
        console.log("[newPresale]")
        e.preventDefault()
 
         let error_count =   this.checkForm()
        const {web3js, userAddress} = this.props;
        let params = {...store_presaleForm.getState()}

        
        if(error_count > 0) return 

 
        //format big numbers
        //todo : adapt to other currencies decimals
        params.cap = util.formatExp(params.cap , config.bnb_decimals)
        params.goal = util.formatExp(params.goal , config.bnb_decimals)
        params.max_participation = util.formatExp(params.max_participation , config.bnb_decimals)
        params.min_participation = util.formatExp(params.min_participation , config.bnb_decimals)

        
        params.locking_duration = parseInt(params.lockingTime - Date.now()/1000) 

        console.log("params", params)
        await contracts.newCrowdsale(web3js, userAddress, params)
        //do sth

    }
    render(){
        console.log("[RENDER] PresaleForm", this.props)
    
            const {userAddress, userBalance, navbar_open} = this.props

            const { crowdsaleCount, crowdsaleAddress, crowdsale_details, loading,
                token_address  ,
                logo_url  ,
                website_url  ,
                cap  ,
                goal  ,
                min_participation,
                max_participation,
                presale_rate  ,
                openingTime  ,  
                closingTime,  
                liquidity_percentage,
                listing_rate ,
                
            
            } = store_presaleForm.getState();
        
            const errors = store_presaleFormErrors.getState();

            

            let now = Date.now()

            // <span style={this.style}> Presale 0 {crowdsaleAddress} </span>
          return (
              <div class="row card" style={this.style}>
                  
                   <LoadingSpinner show={false}/>

 

                    <Typography variant="h2"  >Create presale</Typography> 


                    <div class="  row" >

                        <div class="col-md-12">
                            <TextField   
                            id="form-token"
                            name="token_address"
                            label="Token Address"
                            defaultValue={token_address}
                            placeholder="0x0.."
                            onChange={this.updateForm}
                            
                            
                            error={errors.token_address}
                            helperText={errors.token_address}
                            />

                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-logo"
                            label="Logo url"
                            defaultValue={logo_url}
                            placeholder="https://...logo.png"
                            onChange={this.updateForm}
                            
                            name="logo_url"
                            error={errors.logo_url}
                            helperText={errors.logo_url}
                            />
                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-website"
                            label="Website url"
                            defaultValue={website_url}
                            onChange={this.updateForm}
                            
                            name="website_url"
                            error={errors.website_url}
                            helperText={errors.website_url}
                            />
                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-goal"
                            label="Softcap"
                            defaultValue={goal}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="goal"
                            error={errors.goal}
                            helperText={errors.goal}
                            />
                        </div>

                         
                        <div class="col-md-12">
                            <TextField 
                            id="form-cap"
                            label="Hardcap"
                            defaultValue={cap}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="cap"
                            error={errors.cap}
                            helperText={errors.cap}
                            />
                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-min"
                            label="Min participation"
                            defaultValue={min_participation}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="min_participation"
                            error={errors.min_participation}
                            helperText={errors.min_participation}
                            />
                        </div>

   

                        <div class="col-md-12">
                            <TextField 
                            id="form-max"
                            label="Max participation"
                            defaultValue={max_participation}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="max_participation"
                            error={errors.max_participation}
                            helperText={errors.max_participation}
                            />
                        </div>


                        <div class="col-md-12">
                            <TextField 
                            id="form-presale-rate"
                            label="Presale rate"
                            defaultValue={presale_rate}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="presale_rate"
                            error={errors.presale_rate}
                            helperText={errors.presale_rate}
                            />
                        </div>

 


                        <div class="col-md-12">
                            <TextField 
                            id="form-liq"
                            label="Liquidity Percentage"
                            defaultValue={liquidity_percentage}
                            type="number"
                            onChange={this.updateForm}
                            

                            name="liquidity_percentage"
                            error={errors.liquidity_percentage}
                            helperText={errors.liquidity_percentage}
                            
                            />
                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-listing-rate"
                            label="Listing rate"
                            defaultValue={listing_rate}
                            type="number"
                            helperText="No need to fill if liquidity percentage is 0."

                            onChange={this.updateForm}
                            
                            name="listing_rate"
                            error={errors.listing_rate}
                            helperText={errors.listing_rate}
                            />
                            
                        </div>
                        
                        <div class="col-md-12">
                            <TextField 
                            id="form-open"
                            label="Opening datetime"
                            defaultValue=""
                            type="datetime-local"
                            InputLabelProps={{
                                shrink: true,
                              }}

                            onChange={this.updateForm}
                            
                            name="openingTime"
                            error={errors.openingTime}
                            helperText={errors.openingTime}
                            />
                        </div>

                        <div class="col-md-12">
                            <TextField 
                            id="form-close"
                            label="Closing datetime"
                            defaultValue=""
                            type="datetime-local"
                            InputLabelProps={{
                                shrink: true,
                              }}

                            onChange={this.updateForm}
                            
                            name="closingTime"
                            error={errors.closingTime}
                            helperText={errors.closingTime}
                            />
                        </div>

                        
                        <div class="col-md-12">
                            <TextField 
                            id="form-close"
                            label="End of locking"
                            defaultValue=""
                            type="datetime-local"
                            InputLabelProps={{
                                shrink: true,
                              }}

                            onChange={this.updateForm}
                            
                            name="lockingTime"
                            error={errors.lockingTime}
                            helperText={errors.lockingTime}
                            />
                             <br/>
                             <br/>
                        </div>

                       


                        <div class="col-md-12">
                        <Button variant="contained" 
                                color="secondary"
                                onClick={this.approve}>
                        Approve
                        
                        </Button>
                        <br/>
                        <br/>
                        </div>

                        <div class="col-md-12">
                        <Button variant="contained" 
                                color="primary"
                                onClick={this.newPresale}>
                        Create
                        </Button>
                        <br/>
                        <br/>
                        </div>

                        <div class="col-md-12"> 
                        <Alert severity="info">Fees amount to 0.2BNB</Alert>
                        </div>

                    </div>

              </div>
                        
          )
   
   
    }
  
  }

  export default connect(
    (state) => ({
        ...state
  
    })
  )(PresaleForm);



 

 