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

import watch from 'redux-watch'
import { connect, Provider } from 'react-redux';

class ModalStaking extends React.Component{
    constructor(props){
      super(props);
  
      this.state = {  key : Date.now() }
    }

    componentDidMount(){
 
    }

    render(){

    
      const {showModalStaking, farms, stake} = this.props
      const {key} = this.state;
    
      console.log("[ModalStaking]", showModalStaking)

      if(  showModalStaking===undefined || showModalStaking===null || farms.length === 0) return null

      const {tokenStake} = farms[showModalStaking]

      console.log("tokenStake", tokenStake)
      return(
        <Modal
        show={true}
        key={key}
      >
      <Modal.Header>
        Stake {tokenStake.name}
      </Modal.Header>

      <Modal.Body>
        
      <TextField   
        id="form-token"
        name="token_address"
        type="number"
        //label="Token Address"
        defaultValue={""}
        placeholder="Type amount"
        //onChange={this.updateForm}
        
        //error={errors.token_address}
        //helperText={errors.token_address}
        />

      <Button variant="contained" 
                  color="secondary"
                  onClick={this.approve}>
          Confirm Staking  
          
          </Button>

      </Modal.Body>
      </Modal>
      
      )
    }
  }
  export default connect(
    (state) => ({
        ...state
    })
  )(ModalStaking);
