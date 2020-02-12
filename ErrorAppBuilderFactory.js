const superagent = require("superagent");

module.exports = function(){
    this.getBuilder = function(){
        return new ErrorAppBuilder();
    };

    /**
     * Builds various types of Error Apps depending on provided attributes;
     * @constructor
     */
    function ErrorAppBuilder(){
        var _httpEndpoint;
        this.setHttpEndpoint = function(url){
            _httpEndpoint = url;
            return this;
        };
        this.build = function(){
            if(!_httpEndpoint) throw new Error("Http Endpoint is undefined");
            return new HttpErrorApp(_httpEndpoint);
        }
    }

    /**
     * Posts Error object to Http endpoint
     * @param httpEndpoint
     * @constructor
     */
    function HttpErrorApp(httpEndpoint) {
        this.save = async function(error, context){
            await superagent.post(httpEndpoint).set('Content-Type', 'application/json').send({
                objectType: "Error", items:[{timestamp: new Date().valueOf(), event: JSON.stringify(context), message: error.message, stack: error.stack}]
            });
        };
    }
};