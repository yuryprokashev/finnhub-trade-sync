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
        var _token;
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
        this.build = function () {
            return new TradeLoader(_token, _subscriptions, _actions);
        };
    }

    /**
     *
     * @constructor
     */
    function TradeLoader(token, subscriptions, actions) {
        this.execute = function(){
            let finnhubSocketClient = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
            finnhubSocketClient.on("open", ()=>{
                subscriptions.forEach((symbol)=>{
                    _subscribe.call(finnhubSocketClient, symbol);
                });
            });
            finnhubSocketClient.on("close", ()=>{console.log("socket close")});
            finnhubSocketClient.on("message", (data)=>{
                actions.forEach((action)=>{
                    action(data);
                });
            });
        };
        function _subscribe(symbol) {
            this.send(JSON.stringify({type: "subscribe", symbol: symbol}));
        }
    }
};