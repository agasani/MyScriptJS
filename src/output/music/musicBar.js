'use strict';

(function (scope) {
    /**
     * Music bar
     *
     * @class MusicBar
     * @extends MusicElement
     * @param {Object} [obj]
     * @constructor
     */
    function MusicBar(obj) {
        scope.MusicElement.call(this, obj);
        this.decorations = [];
        if (obj) {
            this.repeatDirection = obj.repeatDirection;
            this.style = obj.style;
            for (var i in obj.decorations) {
                this.decorations.push(new scope.MusicDecoration(obj.decorations[i]));
            }
        }
    }

    /**
     * Inheritance property
     */
    MusicBar.prototype = new scope.MusicElement();

    /**
     * Constructor property
     */
    MusicBar.prototype.constructor = MusicBar;

    /**
     * Get repeat direction
     *
     * @method getRepeatDirection
     * @returns {String}
     */
    MusicBar.prototype.getRepeatDirection = function () {
        return this.repeatDirection;
    };

    /**
     * Get style
     *
     * @method getStyle
     * @returns {String}
     */
    MusicBar.prototype.getStyle = function () {
        return this.style;
    };

    /**
     * Get decorations
     *
     * @method getDecorations
     * @returns {MusicDecoration[]}
     */
    MusicBar.prototype.getDecorations = function () {
        return this.decorations;
    };

    // Export
    scope.MusicBar = MusicBar;
})(MyScript);