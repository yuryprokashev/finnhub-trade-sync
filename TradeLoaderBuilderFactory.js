const WebSocket = require("ws");
module.exports = function () {
    this.getBuilder = function () {
        return new TradeLoaderBuilder();
    };

    /**
     *
     * @constructor
     */
    function TradeLoaderBuilder() {
        var _token, _errorApp;
        var _subscriptions = [];
        var _actions = [];
        this.setFinnhubToken = function (str) {
            _token = str;
            return this;
        };
        this.addSymbol = function(str){
            if(_subscriptions.indexOf(str) === -1) _subscriptions.push(str);
            return this;
        };
        this.addAction = function(func){
            _actions.push(func);
            return this;
        };
        this.setErrorApp = function(app){
            _errorApp = app;
            return this;
        };
        this.build = function () {
            return new TradeLoader(_token, _subscriptions, _actions, _errorApp);
        };
    }

    /**
     *
     * @constructor
     */
    function TradeLoader(token, subscriptions, actions, errorApp) {
        this.execute = async function(){
            let finnhubSocketClient = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
            finnhubSocketClient.on("open", ()=>{
                console.log("Opened connection to Finnhub server");
                subscriptions.forEach((symbol)=>{
                    _subscribe.call(finnhubSocketClient, symbol);
                });
            });
            finnhubSocketClient.on("close", (code, reason)=>{console.log(`The Finnhub server closed the connection: code is ${code} reason is ${reason}`)});
            finnhubSocketClient.on("message", (data)=>{
                actions.forEach(async (action)=>{
                    try {
                        await action(data);
                    } catch (e) {
                        await errorApp.save(e, data);
                    }
                });
            });
            finnhubSocketClient.on("error", async (error)=>{
                await errorApp.save(error);
            });
        };
        function _subscribe(symbol) {
            this.send(JSON.stringify({type: "subscribe", symbol: symbol}));
        }
    }
};