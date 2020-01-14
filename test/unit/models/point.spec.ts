import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Point } from '../../../src/models/point';

describe('Point model', () => {

    it('should create', () => {
        expect(new Point(0, 0)).to.be.instanceOf(Point);
    });

    it('should have the correct keys', () => {
        expect(new Point(0, 0)).to.have.all.keys([ '_latitude', '_longitude', 'elevation' ]);
    });

    it('should return the correct values', () => {
        let p = new Point(1, 2, 3);
        expect(p).to.have.property('latitude', 1);
        expect(p).to.have.property('longitude', 2);
        expect(p).to.have.property('elevation', 3);
    });

    it('should throw an error on invalid latitude', () => {
        expect(() => new Point(-91, 0)).to.throw(Error, /Unable to set value/);
        expect(() => new Point(91, 0)).to.throw(Error, /Unable to set value/);
    });

    it('should throw an error on invalid longitude', () => {
        expect(() => new Point(0, -181)).to.throw(Error, /Unable to set value/);
        expect(() => new Point(0, 181)).to.throw(Error, /Unable to set value/);
    });

    it('should normalize correctly with elevation undefined', () => {
        expect(new Point(1, 2).normalize()).to.deep.equal({
            type: 'geo:json',
            value: {
                type: 'Point',
                coordinates: [2, 1]
            }
        });
    });

    it('should normalize correctly with elevation defined', () => {
        expect(new Point(1, 2, 3).normalize()).to.deep.equal({
            type: 'geo:json',
            value: {
                type: 'Point',
                coordinates: [2, 1, 3]
            }
        });
    });
});
