import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace babushkaproto. */
export namespace babushkaproto {

    /** Properties of a Response. */
    interface IResponse {

        /** Response slot */
        slot?: (babushkaproto.Response.ISlotRange[]|null);
    }

    /** Represents a Response. */
    class Response implements IResponse {

        /**
         * Constructs a new Response.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.IResponse);

        /** Response slot. */
        public slot: babushkaproto.Response.ISlotRange[];

        /**
         * Creates a new Response instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Response instance
         */
        public static create(properties?: babushkaproto.IResponse): babushkaproto.Response;

        /**
         * Encodes the specified Response message. Does not implicitly {@link babushkaproto.Response.verify|verify} messages.
         * @param message Response message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.IResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Response message, length delimited. Does not implicitly {@link babushkaproto.Response.verify|verify} messages.
         * @param message Response message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.IResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Response message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Response;

        /**
         * Decodes a Response message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Response;

        /**
         * Verifies a Response message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Response message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Response
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.Response;

        /**
         * Creates a plain object from a Response message. Also converts values to other types if specified.
         * @param message Response
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Response to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Response
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Response {

        /** Properties of a Node. */
        interface INode {

            /** Node address */
            address?: (string|null);
        }

        /** Represents a Node. */
        class Node implements INode {

            /**
             * Constructs a new Node.
             * @param [properties] Properties to set
             */
            constructor(properties?: babushkaproto.Response.INode);

            /** Node address. */
            public address: string;

            /**
             * Creates a new Node instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Node instance
             */
            public static create(properties?: babushkaproto.Response.INode): babushkaproto.Response.Node;

            /**
             * Encodes the specified Node message. Does not implicitly {@link babushkaproto.Response.Node.verify|verify} messages.
             * @param message Node message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: babushkaproto.Response.INode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Node message, length delimited. Does not implicitly {@link babushkaproto.Response.Node.verify|verify} messages.
             * @param message Node message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: babushkaproto.Response.INode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Node message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Response.Node;

            /**
             * Decodes a Node message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Response.Node;

            /**
             * Verifies a Node message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Node message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Node
             */
            public static fromObject(object: { [k: string]: any }): babushkaproto.Response.Node;

            /**
             * Creates a plain object from a Node message. Also converts values to other types if specified.
             * @param message Node
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: babushkaproto.Response.Node, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Node to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Node
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SlotRange. */
        interface ISlotRange {

            /** SlotRange startRange */
            startRange?: (number|null);

            /** SlotRange endRange */
            endRange?: (number|null);

            /** SlotRange node */
            node?: (babushkaproto.Response.INode[]|null);
        }

        /** Represents a SlotRange. */
        class SlotRange implements ISlotRange {

            /**
             * Constructs a new SlotRange.
             * @param [properties] Properties to set
             */
            constructor(properties?: babushkaproto.Response.ISlotRange);

            /** SlotRange startRange. */
            public startRange: number;

            /** SlotRange endRange. */
            public endRange: number;

            /** SlotRange node. */
            public node: babushkaproto.Response.INode[];

            /**
             * Creates a new SlotRange instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SlotRange instance
             */
            public static create(properties?: babushkaproto.Response.ISlotRange): babushkaproto.Response.SlotRange;

            /**
             * Encodes the specified SlotRange message. Does not implicitly {@link babushkaproto.Response.SlotRange.verify|verify} messages.
             * @param message SlotRange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: babushkaproto.Response.ISlotRange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SlotRange message, length delimited. Does not implicitly {@link babushkaproto.Response.SlotRange.verify|verify} messages.
             * @param message SlotRange message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: babushkaproto.Response.ISlotRange, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SlotRange message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SlotRange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Response.SlotRange;

            /**
             * Decodes a SlotRange message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SlotRange
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Response.SlotRange;

            /**
             * Verifies a SlotRange message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SlotRange message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SlotRange
             */
            public static fromObject(object: { [k: string]: any }): babushkaproto.Response.SlotRange;

            /**
             * Creates a plain object from a SlotRange message. Also converts values to other types if specified.
             * @param message SlotRange
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: babushkaproto.Response.SlotRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SlotRange to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SlotRange
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a NullResp. */
    interface INullResp {
    }

    /** Represents a NullResp. */
    class NullResp implements INullResp {

        /**
         * Constructs a new NullResp.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.INullResp);

        /**
         * Creates a new NullResp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NullResp instance
         */
        public static create(properties?: babushkaproto.INullResp): babushkaproto.NullResp;

        /**
         * Encodes the specified NullResp message. Does not implicitly {@link babushkaproto.NullResp.verify|verify} messages.
         * @param message NullResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.INullResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified NullResp message, length delimited. Does not implicitly {@link babushkaproto.NullResp.verify|verify} messages.
         * @param message NullResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.INullResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NullResp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns NullResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.NullResp;

        /**
         * Decodes a NullResp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns NullResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.NullResp;

        /**
         * Verifies a NullResp message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NullResp message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NullResp
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.NullResp;

        /**
         * Creates a plain object from a NullResp message. Also converts values to other types if specified.
         * @param message NullResp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.NullResp, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NullResp to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for NullResp
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CommandReply. */
    interface ICommandReply {

        /** CommandReply callbackIdx */
        callbackIdx?: (number|null);

        /** CommandReply error */
        error?: (string|null);

        /** CommandReply resp1 */
        resp1?: (babushkaproto.IStrResponse|null);

        /** CommandReply resp2 */
        resp2?: (babushkaproto.INullResp|null);
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

        /** CommandReply error. */
        public error?: (string|null);

        /** CommandReply resp1. */
        public resp1?: (babushkaproto.IStrResponse|null);

        /** CommandReply resp2. */
        public resp2?: (babushkaproto.INullResp|null);

        /** CommandReply _error. */
        public _error?: "error";

        /** CommandReply response. */
        public response?: ("resp1"|"resp2");

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

    /** Properties of a RepStrResponse. */
    interface IRepStrResponse {

        /** RepStrResponse arg */
        arg?: (string[]|null);
    }

    /** Represents a RepStrResponse. */
    class RepStrResponse implements IRepStrResponse {

        /**
         * Constructs a new RepStrResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.IRepStrResponse);

        /** RepStrResponse arg. */
        public arg: string[];

        /**
         * Creates a new RepStrResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RepStrResponse instance
         */
        public static create(properties?: babushkaproto.IRepStrResponse): babushkaproto.RepStrResponse;

        /**
         * Encodes the specified RepStrResponse message. Does not implicitly {@link babushkaproto.RepStrResponse.verify|verify} messages.
         * @param message RepStrResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.IRepStrResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RepStrResponse message, length delimited. Does not implicitly {@link babushkaproto.RepStrResponse.verify|verify} messages.
         * @param message RepStrResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.IRepStrResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RepStrResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RepStrResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.RepStrResponse;

        /**
         * Decodes a RepStrResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RepStrResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.RepStrResponse;

        /**
         * Verifies a RepStrResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RepStrResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RepStrResponse
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.RepStrResponse;

        /**
         * Creates a plain object from a RepStrResponse message. Also converts values to other types if specified.
         * @param message RepStrResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.RepStrResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RepStrResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RepStrResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a StrResponse. */
    interface IStrResponse {

        /** StrResponse arg */
        arg?: (string|null);
    }

    /** Represents a StrResponse. */
    class StrResponse implements IStrResponse {

        /**
         * Constructs a new StrResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.IStrResponse);

        /** StrResponse arg. */
        public arg: string;

        /**
         * Creates a new StrResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns StrResponse instance
         */
        public static create(properties?: babushkaproto.IStrResponse): babushkaproto.StrResponse;

        /**
         * Encodes the specified StrResponse message. Does not implicitly {@link babushkaproto.StrResponse.verify|verify} messages.
         * @param message StrResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.IStrResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified StrResponse message, length delimited. Does not implicitly {@link babushkaproto.StrResponse.verify|verify} messages.
         * @param message StrResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.IStrResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a StrResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns StrResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.StrResponse;

        /**
         * Decodes a StrResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns StrResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.StrResponse;

        /**
         * Verifies a StrResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a StrResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns StrResponse
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.StrResponse;

        /**
         * Creates a plain object from a StrResponse message. Also converts values to other types if specified.
         * @param message StrResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.StrResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this StrResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for StrResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Node. */
    interface INode {

        /** Node address */
        address?: (string|null);

        /** Node port */
        port?: (number|null);

        /** Node nodeId */
        nodeId?: (string|null);

        /** Node hostname */
        hostname?: (string|null);
    }

    /** Represents a Node. */
    class Node implements INode {

        /**
         * Constructs a new Node.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.INode);

        /** Node address. */
        public address: string;

        /** Node port. */
        public port: number;

        /** Node nodeId. */
        public nodeId: string;

        /** Node hostname. */
        public hostname: string;

        /**
         * Creates a new Node instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Node instance
         */
        public static create(properties?: babushkaproto.INode): babushkaproto.Node;

        /**
         * Encodes the specified Node message. Does not implicitly {@link babushkaproto.Node.verify|verify} messages.
         * @param message Node message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.INode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Node message, length delimited. Does not implicitly {@link babushkaproto.Node.verify|verify} messages.
         * @param message Node message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.INode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Node;

        /**
         * Decodes a Node message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Node;

        /**
         * Verifies a Node message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Node message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Node
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.Node;

        /**
         * Creates a plain object from a Node message. Also converts values to other types if specified.
         * @param message Node
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.Node, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Node to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Node
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Slot. */
    interface ISlot {

        /** Slot startRange */
        startRange?: (number|null);

        /** Slot endRange */
        endRange?: (number|null);

        /** Slot primary */
        primary?: (babushkaproto.INode|null);

        /** Slot replicas */
        replicas?: (babushkaproto.INode[]|null);
    }

    /** Represents a Slot. */
    class Slot implements ISlot {

        /**
         * Constructs a new Slot.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.ISlot);

        /** Slot startRange. */
        public startRange: number;

        /** Slot endRange. */
        public endRange: number;

        /** Slot primary. */
        public primary?: (babushkaproto.INode|null);

        /** Slot replicas. */
        public replicas: babushkaproto.INode[];

        /**
         * Creates a new Slot instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Slot instance
         */
        public static create(properties?: babushkaproto.ISlot): babushkaproto.Slot;

        /**
         * Encodes the specified Slot message. Does not implicitly {@link babushkaproto.Slot.verify|verify} messages.
         * @param message Slot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.ISlot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Slot message, length delimited. Does not implicitly {@link babushkaproto.Slot.verify|verify} messages.
         * @param message Slot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.ISlot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Slot message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Slot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.Slot;

        /**
         * Decodes a Slot message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Slot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.Slot;

        /**
         * Verifies a Slot message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Slot message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Slot
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.Slot;

        /**
         * Creates a plain object from a Slot message. Also converts values to other types if specified.
         * @param message Slot
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.Slot, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Slot to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Slot
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a clusterSlotsResp. */
    interface IclusterSlotsResp {

        /** clusterSlotsResp slots */
        slots?: (babushkaproto.ISlot[]|null);
    }

    /** Represents a clusterSlotsResp. */
    class clusterSlotsResp implements IclusterSlotsResp {

        /**
         * Constructs a new clusterSlotsResp.
         * @param [properties] Properties to set
         */
        constructor(properties?: babushkaproto.IclusterSlotsResp);

        /** clusterSlotsResp slots. */
        public slots: babushkaproto.ISlot[];

        /**
         * Creates a new clusterSlotsResp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns clusterSlotsResp instance
         */
        public static create(properties?: babushkaproto.IclusterSlotsResp): babushkaproto.clusterSlotsResp;

        /**
         * Encodes the specified clusterSlotsResp message. Does not implicitly {@link babushkaproto.clusterSlotsResp.verify|verify} messages.
         * @param message clusterSlotsResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: babushkaproto.IclusterSlotsResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified clusterSlotsResp message, length delimited. Does not implicitly {@link babushkaproto.clusterSlotsResp.verify|verify} messages.
         * @param message clusterSlotsResp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: babushkaproto.IclusterSlotsResp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a clusterSlotsResp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns clusterSlotsResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): babushkaproto.clusterSlotsResp;

        /**
         * Decodes a clusterSlotsResp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns clusterSlotsResp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): babushkaproto.clusterSlotsResp;

        /**
         * Verifies a clusterSlotsResp message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a clusterSlotsResp message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns clusterSlotsResp
         */
        public static fromObject(object: { [k: string]: any }): babushkaproto.clusterSlotsResp;

        /**
         * Creates a plain object from a clusterSlotsResp message. Also converts values to other types if specified.
         * @param message clusterSlotsResp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: babushkaproto.clusterSlotsResp, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this clusterSlotsResp to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for clusterSlotsResp
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
