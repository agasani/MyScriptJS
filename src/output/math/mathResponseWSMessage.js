'use strict';

(function (scope) {
    /**
     * WebSocket recognition math result message
     *
     * @class MathResponseWSMessage
     * @extends AbstractRecoResponseWSMessage
     * @param {Object} [obj] Recognition WebSocket message
     * @constructor
     */
    function MathResponseWSMessage(obj) {
        scope.AbstractRecoResponseWSMessage.call(this, obj);
        if (obj) {
            this.result = new scope.MathDocument(obj.result);
        }
    }

    /**
     * Inheritance property
     */
    MathResponseWSMessage.prototype = new scope.AbstractRecoResponseWSMessage();

    /**
     * Constructor property
     */
    MathResponseWSMessage.prototype.constructor = MathResponseWSMessage;

    /**
     * Get math document
     *
     * @method getMathDocument
     * @returns {MathDocument}
     */
    MathResponseWSMessage.prototype.getMathDocument = function () {
        return this.result;
    };

    // Export
    scope.MathResponseWSMessage = MathResponseWSMessage;
})(MyScript);