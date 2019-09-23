import { Normalizable } from "./context";

export class Point implements Normalizable {
    private _latitude : number = 0;
    private _longitude : number = 0;
    public elevation? : number;
    
    get latitude() : number {
        return this._latitude;
    }
    set latitude(value : number) {
        if(value < -90 || value > 90)
            throw new Error("Unable to set value due to invalid latitude value. Valid latitude range is -90 ... 90.");
        this._latitude = value;
    }
    get longitude() : number {
        return this._longitude;
    }
    set longitude(value : number) {
        if(value < -180 || value > 180)
            throw new Error("Unable to set value due to invalid longitude value. Valid longitude range is -180 ... 180.");
        this._longitude = value;
    }

    constructor(latitude : number, longitude : number, elevation? : number) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.elevation = elevation;
    }

    normalize() : any {
        return {
            type: "geo:json",
            value: {
                type: "Point",
                coordinates: this.elevation === undefined ?
                    [ this.latitude, this.longitude ] :
                    [ this.latitude, this.longitude, this.elevation ]
            }
        };
    }
}