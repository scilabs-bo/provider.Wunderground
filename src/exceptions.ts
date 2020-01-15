export class ValueError extends Error { }
export class WundergroundAPIError extends Error {
    constructor(
        public statusCode: number = 0,
        public message: string
    ) { super(message); }
}
