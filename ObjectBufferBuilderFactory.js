module.exports = function () {
    this.getBuilder = function () {
        return new ObjectBufferBuilder();
    };

    /**
     *
     * @constructor
     */
    function ObjectBufferBuilder() {
        this.build = function () {
            return new ObjectBuffer();
        };
    }

    /**
     *
     * @constructor
     */
    function ObjectBuffer() {
        var _objects = [];
        this.add = function (obj) {
            _objects.push(obj);
        };
        this.get = function () {
            return _objects;
        };
        this.empty = function () {
            _objects.length = 0;
        };
        this.size = function () {
            return _objects.length;
        };
    }
};