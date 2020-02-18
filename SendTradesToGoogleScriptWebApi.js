const superagent = require("superagent");

module.exports = function () {
    this.getBuilder = function () {
        return new SendTradesToGoogleScriptWebApiBuilder();
    };

    /**
     *
     * @constructor
     */
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

    /**
     *
     * @param objectBuffer
     * @param egressUrl
     * @param bufferSize
     * @param errorApp
     * @constructor
     */
    function SendTradesToGoogleScriptWebApi(objectBuffer, egressUrl, bufferSize, errorApp) {
        this.execute = async function (event) {
            var eventObject = JSON.parse(event);
            if(eventObject.type === "trade"){
                try {
                    JSON.parse(event).data.forEach((obj)=> {
                        obj.received = new Date().valueOf();
                        objectBuffer.add(obj);
                    });
                    if(objectBuffer.size() === bufferSize){
                        await _sendItems(objectBuffer.get());
                        objectBuffer.empty();
                    }
                } catch (err) {
                    await errorApp.save(err, event);
                }
            }
        };
        async function _sendItems(objects){
            let response = await superagent.post(egressUrl)
                .set('Content-Type', 'application/json')
                .send({objectType: "FinnhubTrade", items: objects});
            if(response.text.indexOf("error") !== -1) logErrorMessageAndStack(response.text);
        }
        function logErrorMessageAndStack(responseText) {
            let responseTextObject = JSON.parse(responseText);
            console.error(`Error!\nSender: ${responseTextObject.sender};\nMessage: ${responseTextObject.message};\nStack: ${responseTextObject.stack}`);
        }
    }
};