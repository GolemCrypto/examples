let util = {

      monthNames :  ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
        ]
    ,
    formatNumber : function(number) {
        console.log("test format", number, Intl.NumberFormat('en-US').format(number))
        if(number > 10)
        return new Intl.NumberFormat('en-US').format(number)

        else return number
    }
    ,
    formatExp(number, zeroes){
        if(number === null || number === undefined || !parseInt(zeroes)) return

        
        //cas des nombres décimaux

        if(number < 1){
            let decimals = parseInt(1/number).toString();

            decimals = decimals.match(/^1(0*)$/g)  ? decimals.length - 1 : decimals.length

            zeroes-=decimals;
            number = number.toString()
            number=number.replace("0.", "")
            number=number.replace("0,", "")


        }
        
 
        for(let i=0; i<zeroes;i++)
            number += "0"
        
        return number
    }
    ,

    formatDate : function(date){
        if(!date) return null 

        let now = new Date()  
        let day = date.getDate()
        
        let month = date.getMonth()

        let monthName = this.monthNames[month]
        
        let year = date.getFullYear()
        
        let dateString = ""

        dateString = monthName +" "+ day   

        if(year !== now.getFullYear()) dateString += " " + year

        return dateString

    }
    ,
    sleep : function(milliseconds)  {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }

      ,
      statusHTML : function(status){
        let statusHTML = null;
        if(status === "Finalized") statusHTML = <span class="badge bg-primary">Finalized</span>
        else if (status === "Closed") statusHTML = <span class="badge bg-success  ">Closed</span>
        else if (status === "Not started") statusHTML = <span class="badge bg-warning text-dark">Not started</span>
        else if (status === "Open")  statusHTML = <span class="badge bg-danger">Open</span>

        return statusHTML
      }

      ,
      /*
        loop through json values & parse numbers
        returns parsed json
      */
      parseJsonNumber : function(json){
        let keys = Object.keys(json)

        let json_={}

        keys.forEach((key)=>{
            json_[key] = parseFloat(json[key]) || json[key] === "0"  
                        ? parseFloat(json[key]) : json[key]
          })

          return json_
      }

}

export default util;