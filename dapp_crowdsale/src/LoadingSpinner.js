import React from "react";
import {  Backdrop  } from "@material-ui/core";

class LoadingSpinner extends React.Component{
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
      
      console.log("[LoadingSpinner]", this.props.show)
      let show = this.props.show
      
  
      if(!show) return null
      else{
        return (
          <div key={this.state} 
              style = {this.style} 
              class="" 
              role="status">
            
             
			<Backdrop  open={true} >
			 <img src="https://spaceseed.finance/wp-content/uploads/2021/06/SpaceSeed_White_animated.png"
			 	alt=""
				 style={{
					 maxWidth:"10em"
				 }}
				 />
            </Backdrop>
           
  
          </div>
  
        )
      }
   
   
    }
  
  }


  export default  (LoadingSpinner);
