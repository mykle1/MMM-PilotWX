/* Magic Mirror
 *
 * Module: MMM-PilotWX
 *
 * By Mykle1
 * 
 */
const NodeHelper = require('node_helper');
const request = require('request');
const parser = require('xml2js').parseString;


module.exports = NodeHelper.create({
	  
    start: function() {
    	console.log("Starting module: " + this.name);
    },
    
    getWISP: function(url) {
    	request({ 
    	          url: url,
    	          method: 'GET' 
    	        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                parser(body, (err, result)=> {
						var result = JSON.parse(JSON.stringify(result.response.data));
					//	console.log(result); // for checking
					//	console.log(response.statusCode); // for checking
                        this.sendSocketNotification("WISP_RESULT", result);
                   
                });
            }
       });
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_WISP') {
                this.getWISP(payload);
            }
         }  
    });
