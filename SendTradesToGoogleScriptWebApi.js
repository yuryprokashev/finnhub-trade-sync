const superagent = require("superagent");

module.exports = function () {
    this.getBuilder = function () {
        return new SendTradesToGoogleScriptWebApiBuilder();
    };
    function SendTradesToGoogleScriptWebApiBuilder() {
        var _objectBuffer, _egressUrl, _errorApp, _bufferSize = 10;
        this.setObjectBuffer = function (objectBuffer) {
            _objectBuffer = objectBuffer;
            return this;
        };
        this.setEgressUrl = function (str) {
            _egressUrl = str;
            return this;
        };
        this.setBufferSize = function (number) {
            _bufferSize = number;
            return this;
        };
        this.setErrorApp = function(app){
            _errorApp = app;
            return this;
        };
        this.build = function () {
            return new SendTradesToGoogleScriptWebApi(_objectBuffer, _egressUrl, _bufferSize, _errorApp);
        };
    }
    function SendTradesToGoogleScriptWebApi(objectBuffer, egressUrl, bufferSize, errorApp) {
        this.execute = async function (event) {
            var eventObject = JSON.parse(event);
            if(eventObject.type === "trade"){
                try {
                    JSON.parse(event).data.forEach((obj)=> {
                        objectBuffer.add(obj);
                    });
                    if(objectBuffer.size() === bufferSize){
                        let response = await _sendItems(objectBuffer.get());
                        if(response.text.indexOf("error") !== -1) console.log(response);
                        objectBuffer.empty();
                    }
                } catch (err) {
                    await errorApp.save(err, event);
                }
            }
        };
        async function _sendItems(objects){
            return await superagent.post(egressUrl).set('Content-Type', 'application/json').send({objectType: "FinnhubTrade", items: objects});
        }
    }
};