import React from "react";
import {  Backdrop  } from "@material-ui/core";

 
import Button from '@material-ui/core/Button';

import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
 
import { Modal } from 'react-bootstrap';

import TextField from '@material-ui/core/TextField';

class FarmCard extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }
  
      this.style = {
        position: "absolute",
        left: "60%",
        margin : "auto",
        "margin-top" : "10em",
        "z-index" : "10",
        color : "#DD5E89"
    }
  
    }
	
    componentDidMount(){
		document.title = "SpaceSeed Private Sale DAPP"
 
    }
  
    render(){
      console.log("[FarmCardz]")
      
      const {farmInfo, farmIndex, openModalStaking, enableFarm} = this.props
      const {  apy, contractAddress, earned, tokenStake, tokenReward} = farmInfo
       
       let pair = tokenStake.name +"-"+tokenReward.name
        return (
           
            <ExpansionPanel 
          defaultExpanded = {true}  
          className="expandPanel"
          >
        <ExpansionPanelSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
           
           <div class="row">
                  <div class="col-1">
                    <span class="label" hidden>Icon</span><br/>
                      <MonetizationOnIcon/> 
                  </div>
                  
                  <div class="col-3">
                    <span class="label" >Pair</span>
                    <br/>
                    <span  >{pair}</span>
                  </div>
                  

                  <div class="col-2">
                  <span class="label" >Earned</span>
                  <br/>
                  <span  >{earned}</span>
                  </div>

                  <div class="col-2">
                  <span class="label" >APR</span>
                  <br/>
                  <span  >{apy}%</span>
                  </div>

 
 
                  </div>

        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          
         

          <div class="row">

          <div class="col-md-2 col-sm-4">
              <Button variant="contained" 
                      color="secondary"
                      onClick={()=>enableFarm(farmIndex)}>
              Enable Farm
              
              </Button>
            </div>

          <div class="col-md-2 col-sm-4">
              <Button variant="contained" 
                      color="secondary"
                      onClick={()=>openModalStaking(farmIndex)}>
              Stake {tokenStake.name}
              
              </Button>
            </div>

            <div class="col-md-2 col-sm-4">
              <Button variant="contained" 
                      color="primary"
                      onClick={this.approve}>
              Harvest  {tokenReward.name}
              
              </Button>
            </div>

 

          </div>
          
          
        </ExpansionPanelDetails>
  </ExpansionPanel>          

  
        )
      }
   
 
  
  }


  export default  (FarmCard);
