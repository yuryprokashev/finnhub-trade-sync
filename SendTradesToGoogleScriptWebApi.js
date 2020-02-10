const superagent = require("superagent");

module.exports = function () {
    this.getBuilder = function () {
        return new SendTradesToGoogleScriptWebApiBuilder();
    };
    function SendTradesToGoogleScriptWebApiBuilder() {
        var _objectBuffer, _egressUrl, _bufferSize = 10;
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
        this.build = function () {
            return new SendTradesToGoogleScriptWebApi(_objectBuffer, _egressUrl, _bufferSize);
        };
    }
    function SendTradesToGoogleScriptWebApi(objectBuffer, egressUrl, bufferSize) {
        this.execute = async function (event) {
            var eventObject = JSON.parse(event);
            if(eventObject.type === "trade"){
                try {
                    JSON.parse(event).data.forEach((obj)=> {
                        objectBuffer.add(obj);
                    });
                    if(objectBuffer.size() === bufferSize){
                        console.log(`buffer size is ${bufferSize}`);
                        console.log(`last object: ${JSON.stringify(objectBuffer.get()[bufferSize - 1])}`);
                        await _sendItems(objectBuffer.get());
                        objectBuffer.empty();
                    }
                } catch (e) {
                    console.error(e);
                    console.log(`processing failed at event ${event}`);
                }
            }
        }
        async function _sendItems(objects){
            await superagent.post(egressUrl).set('Content-Type', 'application/json').send({objectType: "FinnhubTrade", items: objects});
        }
    }
};