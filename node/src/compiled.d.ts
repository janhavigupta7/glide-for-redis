import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace babushkaproto. */
export namespace babushkaproto {

    /** Properties of a CommandReply. */
    interface ICommandReply {

        /** CommandReply callbackIdx */
        callbackIdx?: (number|null);

        /** CommandReply response */
        response?: (string|null);

        /** CommandReply error */
        error?: (string|null);
    }

    /** Represents a CommandReply. */
    class CommandReply implements ICommandReply {

        /**
         * Constructs a new CommandReply.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.ICommandReply);

        /** CommandReply callbackIdx. */
        public callbackIdx: number;

        /** CommandReply response. */
        public response?: (string|null);

        /** CommandReply error. */
        public error?: (string|null);

        /** CommandReply _response. */
        public _response?: "response";

        /** CommandReply _error. */
        public _error?: "error";

        /**
         * Creates a new CommandReply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommandReply instance
         */
        public static create(properties?: babushkaproto.ICommandReply): babushkaproto.CommandReply;

        /**
         * Encodes the specified CommandReply message. Does not implicitly {@link babushkaproto.CommandReply.verify|verify} messages.
         * @param message CommandReply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.ICommandReply, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CommandReply message, length delimited. Does not implicitly {@link babushkaproto.CommandReply.verify|verify} messages.
         * @param message CommandReply message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.ICommandReply, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CommandReply message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CommandReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.CommandReply;

        /**
         * Decodes a CommandReply message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CommandReply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.CommandReply;

        /**
         * Verifies a CommandReply message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CommandReply message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CommandReply
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.CommandReply;

        /**
         * Creates a plain object from a CommandReply message. Also converts values to other types if specified.
         * @param message CommandReply
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.CommandReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CommandReply to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CommandReply
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Request. */
    interface IRequest {

        /** Request callbackIdx */
        callbackIdx?: (number|null);

        /** Request requestType */
        requestType?: (number|null);

        /** Request arg */
        arg?: (string[]|null);
    }

    /** Represents a Request. */
    class Request implements IRequest {

        /**
         * Constructs a new Request.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.IRequest);

        /** Request callbackIdx. */
        public callbackIdx: number;

        /** Request requestType. */
        public requestType: number;

        /** Request arg. */
        public arg: string[];

        /**
         * Creates a new Request instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Request instance
         */
        public static create(properties?: babushkaproto.IRequest): babushkaproto.Request;

        /**
         * Encodes the specified Request message. Does not implicitly {@link babushkaproto.Request.verify|verify} messages.
         * @param message Request message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Request message, length delimited. Does not implicitly {@link babushkaproto.Request.verify|verify} messages.
         * @param message Request message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Request message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Request;

        /**
         * Decodes a Request message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Request
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Request;

        /**
         * Verifies a Request message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Request message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Request
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.Request;

        /**
         * Creates a plain object from a Request message. Also converts values to other types if specified.
         * @param message Request
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Request to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Request
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
