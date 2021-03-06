'use strict';

describe('MathTerminalNode: output/math/mathTerminalNode.js', function () {

    describe('Default construction', function () {

        var mathTerminalNode;
        before(function (done) {
            mathTerminalNode = new MyScript.MathTerminalNode();
            done();
        });

        it('Check initial state', function () {
            expect(mathTerminalNode).to.be.an('object');
            expect(mathTerminalNode).to.be.an.instanceof(MyScript.MathNode);
            expect(mathTerminalNode).to.be.an.instanceof(MyScript.MathTerminalNode);
            expect(mathTerminalNode).to.have.ownProperty('candidates');
            expect(mathTerminalNode).to.have.ownProperty('inkRanges');
        });

        it('Get candidates', function () {
            expect(mathTerminalNode.getCandidates()).to.be.empty;
        });

        it('Get ink ranges', function () {
            expect(mathTerminalNode.getInkRanges()).to.be.empty;
        });

        it('Get selected candidate index', function () {
            expect(mathTerminalNode.getSelectedCandidateIdx()).to.be.undefined;
        });

        it('Get selected candidate', function () {
            expect(mathTerminalNode.getSelectedCandidate()).to.be.undefined;
        });

    });

    describe('JSON construction', function () {

        var mathTerminalNode;
        before(function (done) {
            mathTerminalNode = new MyScript.MathTerminalNode({
                selectedCandidate: 0,
                inkRanges: [{
                    type: 'inkRange'
                }],
                candidates: [{
                    type: 'candidate'
                }]
            });
            done();
        });

        it('Check initial state', function () {
            expect(mathTerminalNode).to.be.an('object');
            expect(mathTerminalNode).to.be.an.instanceof(MyScript.MathNode);
            expect(mathTerminalNode).to.be.an.instanceof(MyScript.MathTerminalNode);
            expect(mathTerminalNode).to.have.ownProperty('candidates');
            expect(mathTerminalNode).to.have.ownProperty('inkRanges');
        });

        it('Get candidates', function () {
            expect(mathTerminalNode.getCandidates()[0]).not.to.be.empty;
        });

        it('Get ink ranges', function () {
            expect(mathTerminalNode.getInkRanges()[0]).to.be.an.instanceof(MyScript.MathInkRange);
        });

        it('Get selected candidate index', function () {
            expect(mathTerminalNode.getSelectedCandidateIdx()).to.equal(0);
        });

        it('Get selected candidate', function () {
            expect(mathTerminalNode.getSelectedCandidate()).to.be.an.instanceof(MyScript.MathTerminalNodeCandidate);
        });

    });

});