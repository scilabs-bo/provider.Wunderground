export class WeatherObserved {
    public id : string = "";
    public type : string = "WeatherObserved";
    public dataProvider : string | undefined;
    public name : string | undefined;
    public location : { type : string, coordinates : number[] } = { type: "Point", coordinates: [] };
    public address : string | undefined;
    public dateObserved : Date = new Date();
}