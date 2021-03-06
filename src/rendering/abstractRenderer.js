'use strict';

(function (scope) {
    /**
     * Represent the Abstract Renderer. It's used to calculate the ink rendering in HTML5 canvas
     *
     * @class AbstractRenderer
     * @constructor
     */
    function AbstractRenderer() {
        this.points = [];
        this.drawing = false;
        this.parameters = new scope.RenderingParameters();
    }

    /**
     * Get parameters
     *
     * @method getParameters
     * @returns {RenderingParameters}
     */
    AbstractRenderer.prototype.getParameters = function () {
        return this.parameters;
    };

    /**
     * Set parameters
     *
     * @method setParameters
     * @param {RenderingParameters} parameters
     */
    AbstractRenderer.prototype.setParameters = function (parameters) {
        this.parameters = parameters;
    };

    /**
     * Draw recognition result on HTML5 canvas.
     *
     * @method drawRecognitionResult
     * @param {AbstractComponent[]} components
     * @param {Object} recognitionResult
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawRecognitionResult = function (components, recognitionResult, context, parameters) { // jshint ignore:line
        throw new Error('not implemented');
    };

    /**
     * Draw input components
     *
     * @method drawComponents
     * @param {AbstractComponent[]} components
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawComponents = function (components, context, parameters) {
        for (var i in components) {
            var component = components[i];
            if (component instanceof scope.Stroke) {
                this.drawStroke(component, context, parameters);
            } else if (component instanceof scope.CharacterInputComponent) {
                this.drawCharacter(component, context, parameters);
            }
        }
    };

    /**
     * Record the beginning of drawing
     *
     * @method drawStart
     * @param {Number} x
     * @param {Number} y
     */
    AbstractRenderer.prototype.drawStart = function (x, y) {
        this.points = [];
        this.drawing = true;
        this.points.push(new scope.QuadraticPoint({x: x, y: y}));
    };

    /**
     * Record the drawing
     *
     * @method drawContinue
     * @param {Number} x
     * @param {Number} y
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawContinue = function (x, y, context, parameters) {
        if (this.drawing) {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            if (this.points.length === 1) { // firstPoint

                var pA = this.points[this.points.length - 1]; // firstPoint
                var pB = new scope.QuadraticPoint({x: x, y: y});
                var pAB = new scope.QuadraticPoint({
                    x: 0.5 * (pA.getX() + pB.getX()),
                    y: 0.5 * (pA.getY() + pB.getY())
                });
                computePointParameters(pA, pAB, params.getPressureType());
                computePointParameters(pAB, pB, params.getPressureType());

                computeFirstControls(pA, pAB, params.getWidth());
                computeControls(pAB, pB, params.getWidth());

                this.points.push(pAB);
                this.points.push(pB);

                this.drawFirstSegment(pA, pAB, context, params);

            } else {
                var pAB = this.points[this.points.length - 2]; // jshint ignore:line
                var pB = this.points[this.points.length - 1]; // jshint ignore:line
                var pC = new scope.QuadraticPoint({x: x, y: y});
                var pBC = new scope.QuadraticPoint({
                    x: 0.5 * (pB.getX() + pC.getX()),
                    y: 0.5 * (pB.getY() + pC.getY())
                });
                computePointParameters(pB, pBC, params.getPressureType());
                computePointParameters(pBC, pC, params.getPressureType());

                computeControls(pB, pBC, params.getWidth());
                computeControls(pBC, pC, params.getWidth());

                this.points.push(pBC);
                this.points.push(pC);

                this.drawSegment(pAB, pB, pBC, context, params);
            }
        }
    };

    /**
     * Stop record of drawing
     *
     * @method drawEnd
     * @param {Number} x
     * @param {Number} y
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawEnd = function (x, y, context, parameters) {
        if (this.drawing) {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }

            if (this.points.length === 1) {
                this.drawPoint(new scope.QuadraticPoint({x: x, y: y}), context, params);
            } else if (this.points.length > 1) {
                var pA = this.points[this.points.length - 1];
                var pB = new scope.QuadraticPoint({x: x, y: y});
                var pAB = new scope.QuadraticPoint({
                    x: 0.5 * (pA.getX() + pB.getX()),
                    y: 0.5 * (pA.getY() + pB.getY())
                });
                computePointParameters(pA, pAB, params.getPressureType());
                computePointParameters(pAB, pB, params.getPressureType());

                computeControls(pA, pAB, params.getWidth());
                computeLastControls(pB, params.getWidth());

                this.points.push(pAB);
                this.points.push(pB);

                this.drawLastSegment(pAB, pB, context, params);
            }
            this.drawing = false;
        }
    };

    /**
     * Clear the context's canvas content to erase drawing strokes
     *
     * @method clear
     * @param {Object} context
     */
    AbstractRenderer.prototype.clear = function (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    };

    /**
     * Draw guidelines on the HTML5 canvas
     *
     * @method drawGuidelines
     * @param {Number} horizontalSpacing
     * @param {Number} verticalSpacing
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawGuidelines = function (horizontalSpacing, verticalSpacing, context, parameters) {

        context.save();
        try {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            context.fillStyle = params.getColor();
            context.strokeStyle = params.getColor();
            context.lineWidth = 0.5 * params.getWidth();
            context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);

            if (verticalSpacing) {
                for (var y = verticalSpacing; y < context.canvas.clientHeight - verticalSpacing; y += verticalSpacing) {
                    context.beginPath();
                    context.moveTo(horizontalSpacing, y);
                    context.lineTo(context.canvas.clientWidth - horizontalSpacing, y);
                    context.stroke();
                }
            }
            if (horizontalSpacing) {
                for (var x = horizontalSpacing; x < context.canvas.clientWidth - horizontalSpacing; x += horizontalSpacing) {
                    context.beginPath();
                    context.moveTo(x, verticalSpacing);
                    context.lineTo(x, context.canvas.clientHeight - verticalSpacing);
                    context.stroke();
                }
            }
        } finally {
            context.restore();
        }
    };

    /**
     * Trace line on context
     *
     * @method drawLineByCoordinates
     * @param {Number} lX
     * @param {Number} lY
     * @param {Number} cX
     * @param {Number} cY
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawLineByCoordinates = function (lX, lY, cX, cY, context, parameters) {
        context.save();
        try {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            context.fillStyle = params.getColor();
            context.strokeStyle = params.getColor();
            context.globalAlpha = params.getAlpha();
            context.lineWidth = 0.5 * params.getWidth();

            context.beginPath();
            // line from
            context.moveTo(lX, lY);
            // to
            context.lineTo(cX, cY);
            // draw it
            context.stroke();
        } finally {
            context.restore();
        }
    };

    /**
     * Draw a line on context
     *
     * @method drawLineByPoints
     * @param {QuadraticPoint} firstPoint
     * @param {QuadraticPoint} lastPoint
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawLineByPoints = function (firstPoint, lastPoint, context, parameters) {
        this.drawLineByCoordinates(firstPoint.getX(), firstPoint.getY(), lastPoint.getX(), lastPoint.getY(), context, parameters);
    };

    /**
     * Draw a rectangle on context
     *
     * @method drawRectangle
     * @param {Rectangle} rectangle
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawRectangle = function (rectangle, context, parameters) {

        context.save();
        try {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            context.fillStyle = params.getRectColor();
            context.strokeStyle = params.getColor();
            context.globalAlpha = params.getAlpha();
            context.lineWidth = 0.5 * params.getWidth();
            context.fillRect(rectangle.getX(), rectangle.getY(), rectangle.getWidth(), rectangle.getHeight());
        } finally {
            context.restore();
        }
    };

    /**
     * Draw strokes on context
     *
     * @method drawStrokes
     * @param {Stroke[]} strokes
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawStrokes = function (strokes, context, parameters) {
        for (var i in strokes) {
            this.drawStroke(strokes[i], context, parameters);
        }
    };

    /**
     * Draw a stroke on context
     *
     * @method drawStroke
     * @param {Stroke} stroke
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawStroke = function (stroke, context, parameters) {
        for (var i = 0; i < stroke.getLength(); i++) {
            if (i === 0) {
                this.drawStart(stroke.getX()[i], stroke.getY()[i]);
            } else if (i < stroke.getLength() - 1) {
                this.drawContinue(stroke.getX()[i], stroke.getY()[i], context, parameters);
            } else if (i > 1) {
                this.drawEnd(stroke.getX()[i], stroke.getY()[i], context, parameters);
            }
        }
    };

    /**
     * Draw character
     *
     * @private
     * @method drawCharacter
     * @param {CharacterInputComponent} character
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawCharacter = function (character, context, parameters) { // jshint ignore:line
        throw new Error('not implemented');
    };

    /**
     * Draw point on context
     *
     * @method drawPoint
     * @param {QuadraticPoint} point
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawPoint = function (point, context, parameters) {

        context.save();
        try {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            context.fillStyle = params.getColor();
            context.strokeStyle = params.getColor();
            context.globalAlpha = params.getAlpha();
            context.lineWidth = 1;

            context.beginPath();
            context.arc(point.getX(), point.getY(), 0.25 * params.getWidth(), 0, 2 * Math.PI);
            context.fill();
        } finally {
            context.restore();
        }

    };

    /**
     * Draw an arrow head on context
     *
     * @method drawArrowHead
     * @param {QuadraticPoint} headPoint
     * @param {Number} angle
     * @param {Number} length
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawArrowHead = function (headPoint, angle, length, context, parameters) {

        var alpha = phi(angle + Math.PI - (Math.PI / 8)),
            beta = phi(angle - Math.PI + (Math.PI / 8));

        context.save();
        try {
            var params = this.getParameters();
            if (parameters) {
                params = parameters;
            }
            context.fillStyle = params.getColor();
            context.strokeStyle = params.getColor();
            context.globalAlpha = params.getAlpha();
            context.lineWidth = 0.5 * params.getWidth();

            context.moveTo(headPoint.getX(), headPoint.getY());
            context.beginPath();
            context.lineTo(headPoint.getX() + (length * Math.cos(alpha)), headPoint.getY() + (length * Math.sin(alpha)));
            context.lineTo(headPoint.getX() + (length * Math.cos(beta)), headPoint.getY() + (length * Math.sin(beta)));
            context.lineTo(headPoint.getX(), headPoint.getY());
            context.fill();

        } finally {
            context.restore();
        }

    };

    /**
     * Get Strokes from inkRange
     *
     * @method extractStroke
     * @param {Stroke[]} strokes
     * @param {Object} inkRange
     * @result {Stroke[]} List of strokes from inkRange
     */
    AbstractRenderer.prototype.extractStroke = function (strokes, inkRange) {
        var result = [],
            firstPointIndex = Math.floor(inkRange.getFirstPoint()),
            lastPointIndex = Math.ceil(inkRange.getLastPoint());

        for (var strokeIndex = inkRange.getFirstStroke(); strokeIndex <= inkRange.getLastStroke(); strokeIndex++) {
            var currentStroke = strokes[strokeIndex];
            var currentStrokePointCount = currentStroke.getX().length;

            var newStroke = new scope.Stroke(), x = [], y = [];

            for (var pointIndex = firstPointIndex; (strokeIndex === inkRange.getLastStroke() && pointIndex <= lastPointIndex && pointIndex < currentStrokePointCount) || (strokeIndex !== inkRange.getLastStroke() && pointIndex < currentStrokePointCount); pointIndex++) {
                x.push(currentStroke.getX()[pointIndex]);
                y.push(currentStroke.getY()[pointIndex]);
            }

            newStroke.setX(x);
            newStroke.setY(y);
            result.push(newStroke);
        }
        return result;
    };

    /**
     * Draw the first stroke segment on context
     *
     * @private
     * @method drawFirstSegment
     * @param {QuadraticPoint} pA
     * @param {QuadraticPoint} pB
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawFirstSegment = function (pA, pB, context, parameters) {

        context.save();
        try {
            context.fillStyle = parameters.getColor();
            context.strokeStyle = parameters.getColor();
            context.globalAlpha = 1;
            context.lineWidth = 1;

            context.beginPath();
            context.moveTo(pA.getP1().getX(), pA.getP1().getY());
            context.lineTo(pB.getP1().getX(), pB.getP1().getY());
            context.lineTo(pB.getP2().getX(), pB.getP2().getY());
            context.lineTo(pA.getP2().getX(), pA.getP2().getY());
            context.closePath();
            context.fill();

        } finally {
            context.restore();
        }

    };

    /**
     * Draw middle stroke segment on context
     *
     * @private
     * @method drawSegment
     * @param {QuadraticPoint} pA
     * @param {QuadraticPoint} pB
     * @param {QuadraticPoint} pC
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawSegment = function (pA, pB, pC, context, parameters) {

        context.save();
        try {
            context.fillStyle = parameters.getColor();
            context.strokeStyle = parameters.getColor();
            context.globalAlpha = 1;
            context.lineWidth = 1;

            context.beginPath();
            context.moveTo(pA.getP1().getX(), pA.getP1().getY());
            context.quadraticCurveTo(pB.getP1().getX(), pB.getP1().getY(), pC.getP1().getX(), pC.getP1().getY());
            context.lineTo(pC.getP2().getX(), pC.getP2().getY());
            context.quadraticCurveTo(pB.getP2().getX(), pB.getP2().getY(), pA.getP2().getX(), pA.getP2().getY());
            context.closePath();
            context.fill();

        } finally {
            context.restore();
        }
    };

    /**
     * Draw the last stroke segment on context
     *
     * @private
     * @method drawLastSegment
     * @param {QuadraticPoint} pA
     * @param {QuadraticPoint} pB
     * @param {Object} context
     * @param {RenderingParameters} [parameters]
     */
    AbstractRenderer.prototype.drawLastSegment = function (pA, pB, context, parameters) {

        context.save();
        try {
            context.fillStyle = parameters.getColor();
            context.strokeStyle = parameters.getColor();
            context.globalAlpha = 1;
            context.lineWidth = 1;

            context.beginPath();
            context.moveTo(pA.getP1().getX(), pA.getP1().getY());
            context.lineTo(pB.getP1().getX(), pB.getP1().getY());
            context.lineTo(pB.getP2().getX(), pB.getP2().getY());
            context.lineTo(pA.getP2().getX(), pA.getP2().getY());
            context.closePath();
            context.fill();

        } finally {
            context.restore();
        }
    };

    /**
     * Clamp an angle into the range [-PI, +PI]
     *
     * @private
     * @method phi
     * @param {Number} angle
     * @returns {Number}
     */
    var phi = function (angle) {
        angle = ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (angle < -Math.PI) {
            angle += Math.PI * 2;
        }
        return angle;
    };

    /**
     * Compute distance and unit vector from the previous point.
     *
     * @private
     * @method computeDistance
     * @param {QuadraticPoint} previous
     * @param {QuadraticPoint} point
     * @param {String} pressureType
     */
    var computePointParameters = function (previous, point, pressureType) {
        var dx = point.getX() - previous.getX(),
            dy = point.getY() - previous.getY(),
            d = Math.sqrt((dx * dx) + (dy * dy));

        if (d !== 0) {
            point.setDistance(d);
            point.setCos(dx / d);
            point.setSin(dy / d);
        }
        point.setLength(previous.getLength() + point.getDistance());

        switch (pressureType) {
            case 'SIMULATED':
                computePressure(point);
                break;
            case 'CONSTANT':
                point.setPressure(1.0);
                break;
            case 'REAL':
                // keep the current pressure
                break;
            default:
                throw new Error('Unknown pressure type');
        }
    };

    /**
     * Compute simulated pressure of given point.
     *
     * @private
     * @method computePressure
     * @param {QuadraticPoint} point
     */
    var computePressure = function (point) {
        var k, pressure;
        if (point.getDistance() < 10) {
            k = 0.2 + Math.pow(0.1 * point.getDistance(), 0.4);
        } else if (point.getDistance() > point.getLength() - 10) {
            k = 0.2 + Math.pow(0.1 * (point.getLength() - point.getDistance()), 0.4);
        } else {
            k = 1.0;
        }

        pressure = k * Math.max(0.1, 1.0 - 0.1 * Math.sqrt(point.getDistance()));
        if (isNaN(parseFloat(pressure))) {
            pressure = 0.5;
        }
        point.setPressure(pressure);
    };

    /**
     * Compute control points of the first point.
     *
     * @private
     * @method computeFirstControls
     * @param {QuadraticPoint} first First point of the list to be computed
     * @param {QuadraticPoint} next Next point
     * @param {Number} penWidth Pen width
     */
    var computeFirstControls = function (first, next, penWidth) {
        var r = 0.5 * (penWidth * first.getPressure()),
            nx = r * next.getSin(),
            ny = r * next.getCos();

        first.getP1().setX(first.getX() - nx);
        first.getP1().setY(first.getY() + ny);
        first.getP2().setX(first.getX() + nx);
        first.getP2().setY(first.getY() - ny);
    };

    /**
     * Compute control points between two points.
     *
     * @private
     * @method computeControls
     * @param {QuadraticPoint} point Point to be computed
     * @param {QuadraticPoint} next Next point
     * @param {Number} penWidth Pen width
     */
    var computeControls = function (point, next, penWidth) {
        var cos = point.getCos() + next.getCos(),
            sin = point.getSin() + next.getSin(),
            u = Math.sqrt((cos * cos) + (sin * sin));

        if (u !== 0) {
            // compute control points
            var r = 0.5 * penWidth * point.getPressure();
            var nx = -r * sin / u;
            var ny = r * cos / u;
            point.getP1().setX(point.getX() + nx);
            point.getP1().setY(point.getY() + ny);
            point.getP2().setX(point.getX() - nx);
            point.getP2().setY(point.getY() - ny);
        }
    };

    /**
     * Compute control points of the last point.
     *
     * @private
     * @method computeLastControls
     * @param {QuadraticPoint} last Last point to be computed
     * @param {Number} penWidth Pen width
     */
    var computeLastControls = function (last, penWidth) {
        var r = 0.5 * penWidth * last.getPressure(),
            nx = -r * last.getSin(),
            ny = r * last.getCos();

        last.getP1().setX(last.getX() + nx);
        last.getP1().setY(last.getY() + ny);
        last.getP2().setX(last.getX() - nx);
        last.getP2().setY(last.getY() - ny);
    };


    // Export
    scope.AbstractRenderer = AbstractRenderer;
})(MyScript);