'use strict';

describe('AnalyzerStrokeType: output/analyzer/analyzerStrokeType.js', function () {

    describe('Default construction', function () {

        var analyzerStrokeType;
        before(function (done) {
            analyzerStrokeType = new MyScript.AnalyzerStrokeType();
            done();
        });

        it('check initial state', function () {
            expect(analyzerStrokeType).to.be.an('object');
            expect(analyzerStrokeType).to.be.an.instanceof(MyScript.AnalyzerStrokeType);
        });

        it('Ink Range getter', function () {
            expect(analyzerStrokeType.getInkRange()).to.be.undefined;
        });

        it('Type getter', function () {
            expect(analyzerStrokeType.getType()).to.be.undefined;
        });

    });

    describe('JSON construction', function () {

        var analyzerStrokeType;
        before(function (done) {
            analyzerStrokeType = new MyScript.AnalyzerStrokeType({
                type: 'test',
                inkRange: [0, 1]
            });
            done();
        });

        it('check initial state', function () {
            expect(analyzerStrokeType).to.be.an('object');
            expect(analyzerStrokeType).to.be.an.instanceof(MyScript.AnalyzerStrokeType);
        });
        it('Test AnalyzerStrokeType object construction: AnalyzerInkRange construction', function () {
            expect(analyzerStrokeType.getInkRange()).to.be.an.instanceof(MyScript.AnalyzerInkRange);
        });

        it('Type getter', function () {
            expect(analyzerStrokeType.getType()).to.not.be.undefined;
        });

    });

});