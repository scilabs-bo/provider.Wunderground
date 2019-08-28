export class ProviderResponse {
    public contextResponses : ContextResponse[] = [];
}

export class ContextResponse {
    public contextElement : ContextElement = new ContextElement();
    public statusCode : StatusCode = new StatusCode();
}

export class ContextElement {
    public id : string = "";
    public isPattern : boolean = false;
    public type : string = "";
    public attributes : Attribute[] = [];
}

export class Attribute {
    public name : string = "";
    public type : string = "";
    public value : any;
}

export class StatusCode {
    public code : string = "";
    public reasonPhrase : string = "";
}