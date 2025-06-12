// Shared/errors/models/errors.ts
export abstract class BaseError extends Error {
    public readonly code: number;
    public readonly rawMessage: any;

    protected constructor(message?: any) {
        const stringMessage = typeof message === 'string' ? message : 'Error interno';
        super(message || 'Error interno');
        this.name = this.constructor.name;
        //para que capture el error a partir de este punto
        Error.captureStackTrace(this, this.constructor);
        this.code = this.defaultCode();
        this.rawMessage = message;
    }

    protected abstract defaultCode(): number;
}

export class NOT_FOUND extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 404;
    }
}

export class MAIL_ERROR_SENDER extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 535;
    }
}

export class UNAUTHORIZED extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 401;
    }
}

export class SchemaError extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 400;
    }
}

export class BAD_REQUEST extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 400;
    }
}

export class Token_Not_Found extends BaseError {
    constructor(message: any) {
        super(message);
    }

    protected defaultCode(): number {
        return 401;
    }
}

export class Token_Expired extends BaseError {
    constructor(message: any) {
        super(message);
    }

    protected defaultCode(): number {
        return 401;
    }
}

export class JWT_TokenError extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 401;
    }
}

export class FORBIDDEN extends BaseError {
    constructor(message: any) {
        super(message);
    }
    protected defaultCode(): number {
        return 403;
    }
}

export class ALREADY_EXISTS extends BaseError {
    constructor(message: any) {
        super(message);
    }

    protected defaultCode(): number {
        return 409;
    }
}

export class INTERNAL_ERROR extends BaseError{
    constructor(message: any) {
        super(message);
    }

    protected defaultCode(): number {
        return 500;
    }
}
