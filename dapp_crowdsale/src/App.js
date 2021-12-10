import React, { useState } from "react";
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';

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
import util from './util.js'
import reducers from './reducers.js'
import contracts from './contracts_api.js'

import Countdown from 'react-countdown';

import clsx from 'clsx';
import { makeStyles,useTheme,withStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ListItemText from '@material-ui/core/ListItemText';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

import Typography from '@material-ui/core/Typography';

import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';

import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import {
	BrowserView,
	MobileView,
	isBrowser,
	isMobile
  } from "react-device-detect";
  
  import {
	  BrowserRouter,
    HashRouter,
    Route,
    Link
  } from 'react-router-dom';


import Farming from './Farming.js';
import Buttons from './Buttons.js';
import PresaleList from './PresaleList.js';
import PresaleForm from './PresaleForm.js';
import LoadingSpinner from './LoadingSpinner.js';

const config = conf.config ;
const networks = config.networks;

 
var crowdsaleAddress;

const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

var contract;

const bnb_decimals = config.bnb_decimals;
const alien_decimals = config.alien_decimals;

let web3js = null;
let web3 = null;
let accounts = null;

 // Web3modal instance
 var web3Modal;
  
 // Chosen wallet provider given by the dialog window
 let provider;
 
 
 // Address of the selected account
 let selectedAccount;

//reducers
const logger = createLogger({
	duration : false  , // print the duration of each action?
	timestamp : true, // print the timestamp with each action?

	logger : console, // implementation of the `console` API.
	logErrors : true, // should the logger catch, log, and re-throw errors?
   
	diff : false, // (alpha) show diff between states?
 
  });
  var store_app = createStore(reducers.app)
  var store_crowdsale = createStore(reducers.crowdsale, applyMiddleware(logger))

  const providerOptions = {
	walletconnect: {
	  package: WalletConnectProvider,
	  options: {
		rpc: {
		   56: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
		},
		network: 'binance',
		chainId:"97"
	  }
	}
  };
  
  

  async function init(){

		web3Modal = new Web3Modal({
		  rpc: {
			   56: 'https://bsc-dataseed.binance.org/'
			},
		  cacheProvider: true, // optional
		  providerOptions, // required
		  disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
		});
		
		try {
			provider = await web3Modal.connect();
		
		  } catch(e) {
			console.log("Could not get a wallet connection", e);
			return;
		  }
	web3js = new Web3(provider);
	store_app.dispatch({type:1, web3js})
	contract = new web3js.eth.Contract(config.token_abi, config.alienAddress)
	 

}

 if(window.ethereum){
window.ethereum.on('chainChanged', (chainId)=>{
	window.location.reload()
});

window.ethereum.on('accountsChanged', (chainId)=>{
	window.location.reload()
});
 }
async function switchNetwork(e) {
	e.preventDefault()
	
	if(!window.ethereum) return 

    let params = [{chainId:"0x38"
   						, chainName: 'Binance Smart Chain'
						   , rpcUrls:["https://data-seed-prebsc-1-s1.binance.org:8545/"]}]
  
	  params = [{
	chainId: '0x38',
	chainName: 'Binance Smart Chain',
	nativeCurrency:
		{
			name: 'BNB',
			symbol: 'BNB',
			decimals: 18
		},
	rpcUrls: ['https://bsc-dataseed.binance.org/'],
	blockExplorerUrls: ['https://bscscan.com/'],
}]

   await window.ethereum.request({
	method: 'wallet_addEthereumChain',
	params: params
  })

 
 
     return  
}


async function connectEth(e) {
	window.ethereum.request({ method: 'eth_requestAccounts' });

   
  provider = await web3Modal.connect();
  store_app.dispatch({type:1, loading:false})
  web3=new Web3(provider);
 
     return  
}

 
async function getTokenInfo(alienAddress, user_address){
	 
  let info = {

  }
  try{
  let contract = new web3js.eth.Contract(config.token_abi, config.alienAddress);
  
  info.userBalance = await contract.methods.balanceOf(user_address).call({from:  user_address })

 
  return info
  }catch(e){
	  console.log(e)
	  return {}
  }
  
}

 


class App extends React.Component{
  constructor(props){
    super(props);

    this.state={

	error : null,
	current_input:null,
      key : Date.now(),
      userAddress : null,
      userBalance : null,
      totalSupply : null,
      symbol : null,
	  decimals:null,
	
	  token_address:null,
	  available_tokens:null,
      rate : null,
	  weiRaised:null,
	  openingTime : null,
	  closingTime : null,
	  cap : null,
	  goal:null,
	  minParticipation:null,
	  maxParticipationTier1:null,
	  maxParticipationTier2:null,
	  maxParticipationTier3:null,
	  maxParticipation:null,

	  minAlienTokensTier1 : null,
	  minAlienTokensTier2 : null,
	  minAlienTokensTier3 : null,
	  minAlienTokensTier4 : null,

	  canBuy : false,
	  goal:null,
	  amount : null,
	  loading:false,
	  hasClosed : null ,
	  isFinalized : null,

	  status : null ,
	  vault : null,
	  amountToClaim : null 
	  
    }
	this.fetchAccountData = this.fetchAccountData.bind(this);
    this.onConnect = this.onConnect.bind(this);
	this.getTier = this.getTier.bind(this);
	this.Navbar = this.Navbar.bind(this);
  }

  async componentDidMount(){

	let w1 = watch(store_app.getState, 'navbar_open')
	store_app.subscribe(w1((newVal, oldVal, objectPath) => {
		//console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
		this.setState({key : Date.now()})
	}))

	let w2 = watch(store_app.getState, 'userAddress')
	store_app.subscribe(w2((newVal, oldVal, objectPath) => {
		//console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
		this.setState({key : Date.now()})
	}))

	let w3 = watch(store_app.getState, 'loading')
	store_app.subscribe(w3((newVal, oldVal, objectPath) => {
		//console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
		this.setState({key : Date.now()})
	}))

 
	
	if(isMobile) store_app.dispatch({type:1,navbar_open:false})

	try{
	await init();
	
	await this.fetchAccountData()
	await this.onConnect();
	this.setState({ key: Date.now()})
	
	const network_id = await web3js.eth.net.getId();
	console.log("net",network_id)
	let network =   networks.filter((n)=> n.id=== network_id )[0]
	this.setState({ key: Date.now(), network: network })

	}
	catch(e){
		store_app.dispatch({type:1, loading:false})
	}

}
  async fetchAccountData() {
	
	try{
	// Get a Web3 instance for the wallet
	const web3 = new Web3(provider);
   
	 
	// Get connected chain id from Ethereum node
	const chainId = await web3.eth.getChainId();
	// Load chain information over an HTTP API
	const chainData = evmChains.getChain(chainId);
	//document.querySelector("#network-name").textContent = chainData.name;
  
	// Get list of accounts of the connected wallet
	const accounts = await web3.eth.getAccounts();
  
	// MetaMask does not give you all accounts, only the selected account
   
	selectedAccount = accounts[0];
	
	store_app.dispatch({type:1, userAddress : selectedAccount})
	//this.setState({key:Date.now(), userAddress : selectedAccount})
	
	}catch(e){
		console.log("[ERROR]", e.toString())
		store_app.dispatch({type:1, loading:false})
	}
	return
 
  }

  componentDidUpdate(){
	  let current_input = document.getElementById(this.state.current_input)
	  if(current_input) current_input.focus()
  }

  

  async onConnect(){
	  console.log("[onConnect]")
	let {userAddress} = store_app.getState();
	//store_app.dispatch({type:1, loading:true})

	let selected_account = userAddress
	if(!userAddress){
		let accountz = await window.ethereum.request({ method: 'eth_requestAccounts' });
		  selected_account = accountz[0]

		  await init();
		  //await this.fetchAccountData();
		
		  store_app.dispatch({type:1, userAddress : selectedAccount})
		  this.setState({key:Date.now(), userAddress : selectedAccount})
		  //this.setState({loading : true});
	}
	let userBalance = 0;
	//  userBalance = await contract.methods.balanceOf(selectedAccount).call({from: 
	// 	selectedAccount
	// 	})
 
	 
	try{
		let token = await getTokenInfo(config.alienAddress, selected_account)
		
		store_app.dispatch({type:1, userAddress : selected_account
			, userBalance : token.userBalance})
 
    //store_app.dispatch({type:1, loading:false})
		}catch(e){
			store_app.dispatch({type:1, loading:false})
			return
		}
  }
 
 

  getTier(){
	let { amount, minParticipation, decimals,
		maxParticipation, maxParticipationTier3, maxParticipationTier2, maxParticipationTier1
		, minAlienTokensTier4, minAlienTokensTier3, minAlienTokensTier2, minAlienTokensTier1
	} = this.state

	let {userAddress, userBalance} = store_app.getState();

	if( userBalance > minAlienTokensTier1) return "Tier1"
	else if( userBalance > minAlienTokensTier2) return "Tier2"
	else if( userBalance > minAlienTokensTier3) return "Tier3"
	else if( userBalance > minAlienTokensTier4) return "Tier4"
	else return ""

  }
  
  toggleDrawer(e,bool){

  }
  render(){ 
	let {key} = this.state;
	  
    let {   amount,error, errorCrowdsale,
		  totalSupply,  symbol, decimals
          , status, available_tokens, rate, weiRaised, openingTime, closingTime
		  , cap, goal, minParticipation, maxParticipation, minAlienTokensTier4
		  , canBuy  } = store_crowdsale.getState()

	 let {userAddress, userBalance,navbar_open, loading} = store_app.getState();

	let multiplier = 10**decimals 
	totalSupply/=multiplier
	available_tokens=parseInt(available_tokens/multiplier)
	userBalance /= 10**alien_decimals

	cap /=  10**bnb_decimals
	goal /=  10**bnb_decimals
	minParticipation /=  10**bnb_decimals
	maxParticipation /=  10**bnb_decimals
	minAlienTokensTier4 /= 10**decimals 
	let bnbRaised = weiRaised/10**bnb_decimals
	
	

    return (
      <div className="App" key={key}>
	  		
		  <this.Navbar/>

		  <MainMenu/>

        <header className="App-header">
		<div class="container-fluid row"
			style={{
				"margin-top": isMobile ? "5em" : "1em",
				width: navbar_open && !isMobile ? "calc(100% - 240px)" : "" ,
				marginLeft: navbar_open && !isMobile ? "240px" : "" 
			}}
		>

			 
			
 
		<Provider store={store_app}>

			<BrowserRouter>

			<Route exact path="/" component={PresaleList}></Route>


			<Route  exact path="/presale/:id" component={PresaleDetails}></Route>

			<Route    path="/presaleForm" component={PresaleForm}></Route>
			<Route    path="/presaleList" component={PresaleList}></Route>

			<Route exact path="/Farming" component={Farming}></Route>
			<Route exact path="/Buttons" component={Buttons} ></Route>
 
			</BrowserRouter>
			
		</Provider>
 
		 
			</div>
		</header>

		
        </div>

		
		
    );

  }

   

  Navbar(){
	  
	let {   network,
		 totalSupply, decimals,
           available_tokens  } = this.state
 

		let {navbar_open, userAddress, userBalance, loading} = store_app.getState();

		  let multiplier = 10**decimals 
		  totalSupply/=multiplier
		  available_tokens=parseInt(available_tokens/multiplier)
		  userBalance= parseInt(userBalance/10**alien_decimals)
	  
 
		let tier = this.getTier()

		let userAddressMin= userAddress ? 
						userAddress.substring(0,5) + ".." + userAddress.substring(userAddress.length-5, userAddress.length) 
						: null
		 
		
	return(
		 

<AppBar
        position="fixed"
 
		style={
			{
				width: navbar_open && !isMobile ? "calc(100% - 240px)" : "" ,
				"transition": "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,width 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
   				"margin-left": navbar_open && !isMobile ? "240px" : "",
				// backgroundImage : "linear-gradient(to right, #3CA55C 0%, #9cb549  51%, #3CA55C  100%)",
				backgroundSize:" 200% auto;"
			}
		}
      >
        <Toolbar>
		<IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={()=>store_app.dispatch({type:1, navbar_open:true})}
            edge="start"
             
          >
            <MenuIcon />
          </IconButton>

		<div class="row"
			style={{
				display:"block"
				, width:"100%"
			}}
		>
 
		  
		<a class="navbar-brand col-md-3 col-sm-6" 
		href="https://spaceseed.finance"
		target="_blank"
		style={{paddingLeft:"2em"}}
		>

		<img 
				src={require("./img/logo_white.svg").default} 
				alt="SpaceSeed Dapp" 
				style={{maxWidth:"12em"}} />

		</a>



		 
		{userAddress 
		&& <span class="col-md-3 col-sm-6"
				style={{fontSize:"0.6em"}}
				title={userAddress}
			
		> 
			
			<Chip 
					icon={<AccountBalanceWalletIcon className="text-light"/>}
					label={userAddressMin} 
					variant="outlined" 
					className="text-light"
					/>
		 </span>
  		}

		<span class={"col-md-3 col-sm-6 " + (userBalance === 0 ? " text-danger" : " text-light")}
				style={{display: isMobile ? "block" : "inline-block"}}
			> 
 
		  { util.formatNumber(userBalance)} ALIEN 👽 {tier && <span class="text-light">({tier})</span> } 
 
		</span>
		
		{	userAddress
			&& ( !network)
			&& <span  class="col-md-2 col-sm-6    pointer" 
					style={{fontWeight:"500"}}
					onClick={switchNetwork}
					>

				<span class="badge bg-danger">
					Disconnected, Click here to connect to Network  					 
				</span>
			</span>
		}
			{network && <span class="col-md-3 col-sm-6">
					
					{
					!isMobile && <img src={require("./img/"+network.logo).default} 
							alt={network.name} 
							style={{maxWidth:"3em"}}/>

  					}
					{" "}
{network.testnet  
&& <span class="badge bg-warning  text-dark" > <strong>Connected to {network.name}</strong> </span> 
 }
		</span> }

		{!userAddress     &&  

				<Button variant="contained" 
				color="secondary"
				onClick={this.onConnect}
				className="col-md-2 col-sm-6"
				>
				Connect

				</Button>

		}

		 
		{loading && <span class="col-md-1 col-sm-6"><LoadingSpinner show={loading}/></span> }
		</div>
		

        </Toolbar>
      </AppBar>



	
	 
	)
  }
}

export default App;

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

 function PersistentDrawerLeft() {
  const classes = useStyles();
  const theme = useTheme();
  
 
  const {navbar_open, expand_presale} = store_app.getState();

  let open = navbar_open;
  const handleDrawerOpen = () => {
	  
    store_app.dispatch({type:1, navbar_open : true})
	//setOpen(true)
  };

  const handleDrawerClose = () => {
	 
    store_app.dispatch({type:1, navbar_open : false})
	//setOpen(false)
  };

  const expandPresale = () => {
 
    store_app.dispatch({type:1, expand_presale : !expand_presale})
	//setOpen(false)
  };

  let current_path = window.location.pathname;
  return (
    <div className={classes.root}>
		
 
	  <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          {1==1 && <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
 			}
        </div>
        <Divider />
        <List>
		

		<ListItem button key={"presaleMain"} 
				onClick={expandPresale}
		>
			<ListItemIcon>
				<img src={require("./img/rocket.svg").default} alt="" style={{maxWidth:"20px"}}/>

			</ListItemIcon>
			
			<ListItemText  primary={"Presale"} />
 
			{expand_presale ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

		<Collapse in={expand_presale} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
		<ListItem button key={"presaleList"} >
			<a href="/presaleList" class="side_menu_link">
			<ListItemText  primary={"Browse"} />
			</a>
        </ListItem>
		<ListItem button key={"presaleForm"} >
			<a href="/presaleForm" class="side_menu_link">
			<ListItemText  primary={"Start new"} />
			</a>
        </ListItem>
        </List>
      </Collapse>
		

	 
		<ListItem button key={"farm"}>
		{/*<a href="/farming" class="side_menu_link">*/} 
		<ListItemIcon><img src={require("./img/tractor.svg").default} alt="" style={{maxWidth:"20px"}}/></ListItemIcon>
              <ListItemText primary={"Farm"} />
			  <Chip className="side_menu_chip" label={"soon"} color="secondary" variant="outlined" />
		 	
        </ListItem>
		

		<ListItem button key={"mint"}>
	 		<ListItemIcon><img src={require("./img/token.svg").default} alt="" style={{maxWidth:"20px"}}/></ListItemIcon>
		   <ListItemText primary={"Mint Token"} />
		   <Chip className="side_menu_chip" label={"soon"} color="secondary" variant="outlined" />
	 </ListItem>


		<ListItem button key={"referral"}>
 
		<ListItemIcon><img src={require("./img/megaphone.svg").default} alt="" style={{maxWidth:"20px"}}/></ListItemIcon>
              <ListItemText primary={"Referral"} />

		<Chip color="secondary" className="side_menu_chip" label={"soon"} variant="outlined" />
        </ListItem>
 
        </List>
        <Divider />
 
      </Drawer>
     

      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
       
	   
	    </main>
    </div>
  );
}


 
class MainMenu extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }
  
      this.style = {
 
    }
  
    }
	

    async componentDidMount(){
		
		let w3 = watch(store_app.getState, 'expand_presale')
		store_app.subscribe(w3((newVal, oldVal, objectPath) => {
			//console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
			this.setState({key : Date.now()})
		}))
	
		
    }
  
    render(){
		 console.log("[RENDER] MainMenu ")
	let { expand_presale } = store_app.getState();

	let {key} = this.state
 
	  return <div key={key}>
			<PersistentDrawerLeft/>
			</div>
   
   
    }
  
  }

  
 class PresaleDetails extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }
  
      this.style = { }
		
	  this.buy = this.buy.bind(this);
	  this.handleAmount = this.handleAmount.bind(this);
	  this.checkValues = this.checkValues.bind(this);
	  this.refund = this.refund.bind(this);
	  this.claim = this.claim.bind(this);
    }
	

    async componentDidMount(){
		
		document.title = "SpaceSeed | Presale Detail"
 
		let w1 = watch(store_crowdsale.getState, 'amountToClaim')
		store_crowdsale.subscribe(w1((newVal, oldVal, objectPath) => {
		//	console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
			this.setState({key : Date.now()})
		}))
	

		let w2 = watch(store_crowdsale.getState, 'crowdsaleAddress')
		store_crowdsale.subscribe(w2((newVal, oldVal, objectPath) => {
			//console.log('%s changed from %s to %s', objectPath, oldVal, newVal)
			this.setState({key : Date.now()})
		}))

	//get crowdsale address from url
	 let address = window.location.pathname.replace("/presale","");
	 address = address.replace("/","");
	if(!address) return 
	else crowdsaleAddress = address
	store_crowdsale.dispatch({type:1, crowdsaleAddress:address})

	let {userAddress} = store_app.getState()
	

	let crowdsale= await contracts.getCrowdsaleInfo(web3js,crowdsaleAddress, userAddress)
	let status = null;
	let now = Date.now()
	if(crowdsale.isRefunding) status="Refunding"
	else if(crowdsale.isFinalized) status="Finalized"
	else if (crowdsale.hasClosed) status = "Closed"
	else if (now < crowdsale.openingTime) status = "Not started"
	else   status = "Open"
	
	
 
	let vaultInfo =  await contracts.callMany(web3js
		, config.vault_abi
		, crowdsale.vault
		, ["percForLiquidity", "liquidityRate", "depositedBnbs"]
		, userAddress
		, {"percForLiquidity" : [crowdsaleAddress],
			"liquidityRate" : [crowdsaleAddress],
			"depositedBnbs" : [crowdsaleAddress]
		})

		

	store_crowdsale.dispatch({type:1 
					,setCrowdsaleValues:true
					, status : status 

					 ,...crowdsale
					 ,...vaultInfo
	})


		
    }
  
	async claim(){
		let {userAddress} = store_app.getState();
		let {vault} = store_crowdsale.getState();
		 
		await contracts.send(web3js, config.crowdsale_abi, crowdsaleAddress
			, "withdrawTokens"
			,userAddress
			, []  )
	 
	 
	  }
	  async amountDeposited(){
		let {userAddress} = store_app.getState();
		let {vault} = store_crowdsale.getState();

		return await contracts.call(web3js
            , config.masterCrowdsale_abi
            , config.masterCrowdsaleAddress
            , "deposited"
            , userAddress
            , [userAddress])
	  }
	
	 
	  async refund(){
		  
		let {userAddress} = store_app.getState();
		let {vault} = store_crowdsale.getState();

		await contracts.send(web3js, config.crowdsale_abi,crowdsaleAddress 
			, "claimRefund"
			,userAddress
			, []  )
	  }

	  async finalize(){
		let {userAddress} = store_app.getState()
		let {crowdsaleAddress} = store_crowdsale.getState();
		await contracts.send(web3js, config.crowdsale_abi,crowdsaleAddress 
							, "finalize"
							,userAddress
							, []  )
	}
	async forceFinalizeRefunds(){
		let {userAddress} = store_app.getState()
		let {crowdsaleAddress} = store_crowdsale.getState();
		await contracts.send(web3js, config.crowdsale_abi,crowdsaleAddress 
							, "forceFinalizeRefunds"
							,userAddress
							, []  )
		}
	
	handleAmount(e){
		let amount = e.target.value;
	  //this.checkValues(parseFloat(amount));
  
	  //if(!isNaN(parseFloat(amount)))
	  //this.setState({key: Date.now, amount : parseFloat(e.target.value)})
		
	  store_crowdsale.dispatch({type:1, amount : parseFloat(e.target.value)})
	  
	}

	checkValues(amount){

		let { minParticipation, decimals,
			maxParticipation, maxParticipationTier3, maxParticipationTier2, maxParticipationTier1
			, minAlienTokensTier4, minAlienTokensTier3, minAlienTokensTier2, minAlienTokensTier1
		} = this.state
		let {userAddress, userBalance} = store_crowdsale.getState();
	
		amount = amount*(10**bnb_decimals);
		 
	
		if(!userAddress) return this.setState({key:Date.now(), canBuy:false, 
			error:"Problem with wallet address"})
		
		else if(userBalance < minAlienTokensTier4) 
		return this.setState({key:Date.now(), canBuy:false, 
			error:"You need " + (minAlienTokensTier4/10**decimals).toString() + " ALIEN to participate."})
	
		
		else if( !parseFloat(amount)) 
		return this.setState({ canBuy:false, 
			error:"Problem with amount."})
	
		else if( amount < minParticipation ) 
		return this.setState({key:Date.now(), canBuy:false, 
							error:"Amount is lower than min participation."})
	
		else if( userBalance < minAlienTokensTier3 &&  amount > maxParticipation )
			return this.setState({key:Date.now(), canBuy:false
				, error:"Amount is greater than the max participation for your Tier(4)."})
	 
		 
	
		 else if( userBalance < minAlienTokensTier2 &&  amount > maxParticipationTier3 )
		 return this.setState({key:Date.now(), canBuy:false, 
			error:"Amount is greater than the max participation for your Tier(3)."})
	
	 
	
		 else if( userBalance < minAlienTokensTier1 &&  amount > maxParticipationTier2 )
			return this.setState({key:Date.now(), canBuy:false, 
				error:"Amount is greater than the max participation for your Tier(2)."})
		 
		
		 else if(userBalance >= minAlienTokensTier1 && amount > maxParticipationTier1 )
		 return this.setState({key:Date.now(), canBuy:false, 
		error:"Amount is greater than the max participation for your Tier(1)"})
	
		 
		else 
		return this.setState({key:Date.now(), canBuy:true, 
			error:null})
	 
	  }

	  
	async buy(userAddress, crowdsaleAddress){
		
		let {amount} =  store_crowdsale.getState();
		
		console.log("BUY", parseFloat(amount))
		if(!parseFloat(amount)) return
		amount =  amount* 10**bnb_decimals;
		
		console.log("BUY 2")
		const accounts = await web3js.eth.getAccounts();
		  let user_address = accounts[0];
	
		let contract = new web3js.eth.Contract(config.crowdsale_abi, crowdsaleAddress);
	
		  web3js.eth.sendTransaction({
			from: user_address,
			to: crowdsaleAddress,
			value: amount.toString()
		}, (error, txnHash) => {
			if (error) throw error;
			 
		  });
	
	 
	
	  }


    render(){
		 console.log("[RENDER] PresaleDetails ")
	let { key } = this.state

	let {
		amount,error,
		 totalSupply,isRefunding, name,  symbol, decimals
          , tokenAddress, available_tokens, rate, weiRaised, openingTime, closingTime
		  , cap, goal,
		  minParticipation,
		  maxParticipationTier1,
		  maxParticipationTier2,
		  maxParticipationTier3,
		  maxParticipation,
	
		  minAlienTokensTier1,
		  minAlienTokensTier2,
		  minAlienTokensTier3,
		  minAlienTokensTier4 
		, hasClosed, isFinalized,
		amountToClaim,
		errorCrowdsale,
		website_url,
		logo_url,
		owner,
		percForLiquidity,
		liquidityRate,
		depositedBnbs
	} = store_crowdsale.getState();

	let {userAddress, userBalance, navbar_open} = store_app.getState();
	
 
	if(!cap)return <span></span>
	
	let multiplier = 10**decimals 
	totalSupply/=multiplier
 
	userBalance/=10**alien_decimals 

	cap /=  10**bnb_decimals
	goal /=  10**bnb_decimals
	available_tokens/=10**decimals
	minParticipation /=   10**bnb_decimals
	maxParticipation /=   10**bnb_decimals
	maxParticipationTier3 /=   10**bnb_decimals
	maxParticipationTier2 /=   10**bnb_decimals
	maxParticipationTier1 /=   10**bnb_decimals

	minAlienTokensTier4 /=10**decimals 
	minAlienTokensTier3 /=10**decimals 
	minAlienTokensTier2 /=10**decimals 
	minAlienTokensTier1 /=10**decimals
	amountToClaim /=10**decimals
	
	rate = rate
	
	depositedBnbs /=   10**bnb_decimals
	
	let bnbRaised = weiRaised/10**bnb_decimals

	
	let canBuy = parseFloat(amount) && amount >= minParticipation && amount <= maxParticipation
	 

	let percentComplete = (100*bnbRaised/(cap))

 
	let status = "Open"
    if(isRefunding) status="Refunding"      
	else if(isFinalized) status="Finalized"
	else if (hasClosed) status = "Closed"
	else if (Date.now() < openingTime) status = "Not started"
	else   status = "Open"

	console.log("status", status)

	let now = Date.now()
	let statusHTML = null;
	if(status === "Refunding") statusHTML = <span class="badge bg-danger text-dark">Refunding</span>
	else if(status === "Finalized") statusHTML = <span class="badge bg-primary">Finalized</span>
	else if (status === "Closed") statusHTML = <span class="badge bg-success  ">Closed</span>
	else if (status === "Not started") statusHTML = <span class="badge bg-warning text-dark">Not started</span>
	else if (status === "Open")  statusHTML = <span class="badge bg-danger">Open</span>

	  return (

		[<div class="row section"

		>

	 
		<div class="card" style={{    color:"#404040"}}>
 

		<div class="card-body">
		{statusHTML} 
 

		<Typography variant="h2"  >{name}  Sale</Typography>
		{userAddress === owner 
		&& status === "Closed"
		&& <div>
				<Button variant="contained" 
				color="secondary"
				onClick={this.finalize}
				className="col-md-3 col-sm-6"
				>
				Finalize 

				</Button>
				<br/>
				<br/>
		</div>
		}
		{userAddress === owner 
		&& status === "Closed"
		&& <div>
			
				<Button variant="contained" 
				color="secondary"
				onClick={this.forceFinalizeRefunds}
				className="col-md-3 col-sm-6"
				>
			Force Refund

				</Button>
				<br/>
				<br/>
		</div>
		
		}

		{
			status === "Refunding"
			&& depositedBnbs >0
		&& 

				 
		[

			<h5>Goal was not reached</h5>
			,

				<Button variant="contained" 
				color="secondary"
				onClick={this.refund}
				className=""
				>
				Refund  {depositedBnbs} BNB

				</Button>
				
		]
		 
   		}

		{
		 status === "Finalized"
		&& amountToClaim > 0 
		&&
		<p>
 
				<Button variant="contained" 
				color="secondary"
				onClick={this.claim}
				className=""
				>
				Claim {amountToClaim} {symbol}

				</Button>
		</p>
   		}
		   {	
		   status !== "Finalized" && status !== "Refunding"
		   &&
			amountToClaim>0
			&& <h5>
				You have {amountToClaim} tokens to claim.
				</h5>
		   }
		   {/* {	
		   bnbRaised >= goal && status === "Finalized"
		   &&
			!amountToClaim
			&& <h5>
				No Token to claim.
			</h5>
		   } */}

				<div>
				<img 
				src={logo_url} 
				alt="" 
				style={{maxWidth:"50px"}} />
		</div>

	<div>
	{ status=== "Not started" &&
	 Date.now() < openingTime && <Countdown className="text-danger" date={openingTime} /> }
	<br/>
	{ status==="Open" &&
	Date.now() < closingTime && <Countdown className="text-danger" date={closingTime} /> }

</div>
<h5>{percentComplete} % ({bnbRaised} BNB ) completed</h5>

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

				
			<List className="mobile_list">
		
			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Contract address"} />
				<ListItemText  primary={tokenAddress} />
			</ListItem>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Website"} />
				<ListItemText  primary={website_url} />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Available tokens"} />
				<ListItemText  primary={util.formatNumber(available_tokens) + " " + symbol} />
			</ListItem>
		   
			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Hardcap"} />
				<ListItemText  primary={cap + "BNB"} />
			</ListItem>

			<Divider/>

			   
			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"softCap"} />
				<ListItemText  primary={goal} />
			</ListItem>
		 

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"openingTime"} />
				<ListItemText  primary={openingTime ? (new Date(openingTime)).toString()  : "No" } />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"closingTime"} />
				<ListItemText  primary={closingTime ? (new Date(closingTime)).toString()  : "No"} />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Presale Rate"} />
				<ListItemText  primary={rate + " " + symbol + "/BNB"} />
			</ListItem>
		   
			<Divider/>

		{
			    
				liquidityRate > 0

				&&
				[
			<ListItem button key={"liquidityRate"} >		
				<ListItemText  primary={"Listing Rate"} />
				<ListItemText  primary={liquidityRate + " " + symbol + "/BNB"} />
			</ListItem>

			   ,
			<Divider/>
			 
			,	
		 
			<ListItem button key={"liquidityPercentage"} >		
				<ListItemText  primary={"Liquidity Percentage"} />
				<ListItemText  primary={percForLiquidity + "%"} />
			</ListItem>

			,
			<Divider/>
				]
		}
		   
			
		 
		

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"minParticipation"} />
				<ListItemText  primary={minParticipation + " BNB"} />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"maxParticipation"} />
				<ListItemText  primary={ maxParticipation + " BNB"} />
			</ListItem>

		   <Divider/>

		   {/*
		   <ListItem button key={"minAlienTokensTier1"} >		
				<ListItemText  primary={"minAlienTokensTier1"} />
				<ListItemText  primary={  util.formatNumber(minAlienTokensTier1)} />
			</ListItem>

		   <Divider/>
		 
			{/* <ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Tier 1"} />
				<ListItemText  primary={"min tokens required " + util.formatNumber(minAlienTokensTier1) + "/ maxParticipation " + maxParticipationTier1 +" BNB"  } />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Tier 2"} />
				<ListItemText  primary={"min tokens required " + util.formatNumber(minAlienTokensTier2) + "/ maxParticipation " + maxParticipationTier2 +" BNB"  } />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Tier 3"} />
				<ListItemText  primary={"min tokens required " + util.formatNumber(minAlienTokensTier3) + "/ maxParticipation " + maxParticipationTier3 +" BNB"  } />
			</ListItem>

			<Divider/>

			<ListItem button key={"presaleList"} >		
				<ListItemText  primary={"Tier 4"} />
				<ListItemText  primary={"min tokens required " + util.formatNumber(minAlienTokensTier4) + "/ maxParticipation " + maxParticipation +" BNB"  } />
			</ListItem>
	 */}
	
		</List>

 
		</div>
			
		 
	</div>
	</div>

	</div>
	,
	
	<div class="row section" style={{width: (isMobile ? "100%" : "40%"), margin:"auto"}}>
	<div class="col-2"></div>

  {
	  userAddress &&  status === "Open" &&
	   
	  <input
		  id="minAmount"
		  type="text"
		  placeholder="type amount"
		  onFocus = {(e) => {this.state.current_input = e.target.id}}
		  onBlur={()=>this.state.current_input=null}
		  defaultValue={amount}
		  onChange={this.handleAmount}

	/>
  }


  {userAddress   &&  status === "Open" &&
<button type="button" 
	  //class={  (canBuy ? "btn-grad" : "btn-secondary")}
	  class="btn-grad"
	  //disabled={!canBuy}
	   onClick={()=> this.buy(userAddress, crowdsaleAddress)}>BUY</button>
   }

	  
  {
	  !canBuy
  &&error 
  &&
	 status === "Open" &&
  <div class="alert alert-danger" role="alert">
	  {error}
  </div>
	}

  {
  errorCrowdsale		
  &&
  <div class="alert alert-danger" role="alert">
	  {errorCrowdsale}
  </div>
	}

</div>
]
	  )
   
   
    }
  
  }