'use strict';

describe('MusicTupletBracket: output/music/MusicTupletBracket.js', function () {

    describe('Default construction', function () {

        var musicTupletBracket;
        before(function (done) {
            musicTupletBracket = new MyScript.MusicTupletBracket();
            done();
        });

        it('check initial state', function () {
            expect(musicTupletBracket).to.be.an('object');
            expect(musicTupletBracket).to.be.an.instanceof(MyScript.MusicElement);
            expect(musicTupletBracket).to.be.an.instanceof(MyScript.MusicTupletBracket);
        });

        it('Type getter', function () {
            expect(musicTupletBracket.getType()).to.be.undefined;
        });

    });

});