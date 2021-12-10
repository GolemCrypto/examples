import React from "react";
import {  Backdrop  } from "@material-ui/core";

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

class ExpandButton extends React.Component{
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
      
      let {expanded, color, text, onClick} = this.props
       
       
        return (
            <Button 
            variant="outlined"
            className="expandButton" 
            color={color}
            onClick={onClick}>
                {text}
                {expanded ? <ExpandLess /> : <ExpandMore />}
    </Button>
  
        )
      }
   
 
  
  }


  export default  (ExpandButton);
