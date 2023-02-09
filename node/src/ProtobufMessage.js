/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.pb_message = (function() {
    
        /**
         * Namespace pb_message.
         * @exports pb_message
         * @namespace
         */
        var pb_message = {};
    
        pb_message.Request = (function() {
    
            /**
             * Properties of a Request.
             * @memberof pb_message
             * @interface IRequest
             * @property {number|null} [callbackIdx] Request callbackIdx
             * @property {number|null} [requestType] Request requestType
             * @property {Array.<string>|null} [args] Request args
             */
    
            /**
             * Constructs a new Request.
             * @memberof pb_message
             * @classdesc Represents a Request.
             * @implements IRequest
             * @constructor
             * @param {pb_message.IRequest=} [properties] Properties to set
             */
            function Request(properties) {
                this.args = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Request callbackIdx.
             * @member {number} callbackIdx
             * @memberof pb_message.Request
             * @instance
             */
            Request.prototype.callbackIdx = 0;
    
            /**
             * Request requestType.
             * @member {number} requestType
             * @memberof pb_message.Request
             * @instance
             */
            Request.prototype.requestType = 0;
    
            /**
             * Request args.
             * @member {Array.<string>} args
             * @memberof pb_message.Request
             * @instance
             */
            Request.prototype.args = $util.emptyArray;
    
            /**
             * Creates a new Request instance using the specified properties.
             * @function create
             * @memberof pb_message.Request
             * @static
             * @param {pb_message.IRequest=} [properties] Properties to set
             * @returns {pb_message.Request} Request instance
             */
            Request.create = function create(properties) {
                return new Request(properties);
            };
    
            /**
             * Encodes the specified Request message. Does not implicitly {@link pb_message.Request.verify|verify} messages.
             * @function encode
             * @memberof pb_message.Request
             * @static
             * @param {pb_message.IRequest} message Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.callbackIdx != null && Object.hasOwnProperty.call(message, "callbackIdx"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.callbackIdx);
                if (message.requestType != null && Object.hasOwnProperty.call(message, "requestType"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.requestType);
                if (message.args != null && message.args.length)
                    for (var i = 0; i < message.args.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.args[i]);
                return writer;
            };
    
            /**
             * Encodes the specified Request message, length delimited. Does not implicitly {@link pb_message.Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb_message.Request
             * @static
             * @param {pb_message.IRequest} message Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Request message from the specified reader or buffer.
             * @function decode
             * @memberof pb_message.Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb_message.Request} Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_message.Request();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.callbackIdx = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.requestType = reader.uint32();
                            break;
                        }
                    case 3: {
                            if (!(message.args && message.args.length))
                                message.args = [];
                            message.args.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Request message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb_message.Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb_message.Request} Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Request message.
             * @function verify
             * @memberof pb_message.Request
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Request.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    if (!$util.isInteger(message.callbackIdx))
                        return "callbackIdx: integer expected";
                if (message.requestType != null && message.hasOwnProperty("requestType"))
                    if (!$util.isInteger(message.requestType))
                        return "requestType: integer expected";
                if (message.args != null && message.hasOwnProperty("args")) {
                    if (!Array.isArray(message.args))
                        return "args: array expected";
                    for (var i = 0; i < message.args.length; ++i)
                        if (!$util.isString(message.args[i]))
                            return "args: string[] expected";
                }
                return null;
            };
    
            /**
             * Creates a Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb_message.Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb_message.Request} Request
             */
            Request.fromObject = function fromObject(object) {
                if (object instanceof $root.pb_message.Request)
                    return object;
                var message = new $root.pb_message.Request();
                if (object.callbackIdx != null)
                    message.callbackIdx = object.callbackIdx >>> 0;
                if (object.requestType != null)
                    message.requestType = object.requestType >>> 0;
                if (object.args) {
                    if (!Array.isArray(object.args))
                        throw TypeError(".pb_message.Request.args: array expected");
                    message.args = [];
                    for (var i = 0; i < object.args.length; ++i)
                        message.args[i] = String(object.args[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb_message.Request
             * @static
             * @param {pb_message.Request} message Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.args = [];
                if (options.defaults) {
                    object.callbackIdx = 0;
                    object.requestType = 0;
                }
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    object.callbackIdx = message.callbackIdx;
                if (message.requestType != null && message.hasOwnProperty("requestType"))
                    object.requestType = message.requestType;
                if (message.args && message.args.length) {
                    object.args = [];
                    for (var j = 0; j < message.args.length; ++j)
                        object.args[j] = message.args[j];
                }
                return object;
            };
    
            /**
             * Converts this Request to JSON.
             * @function toJSON
             * @memberof pb_message.Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Request
             * @function getTypeUrl
             * @memberof pb_message.Request
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Request.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/pb_message.Request";
            };
    
            return Request;
        })();
    
        pb_message.Response = (function() {
    
            /**
             * Properties of a Response.
             * @memberof pb_message
             * @interface IResponse
             * @property {number|null} [callbackIdx] Response callbackIdx
             * @property {number|Long|null} [respPointer] Response respPointer
             * @property {string|null} [requestError] Response requestError
             * @property {string|null} [closingError] Response closingError
             */
    
            /**
             * Constructs a new Response.
             * @memberof pb_message
             * @classdesc Represents a Response.
             * @implements IResponse
             * @constructor
             * @param {pb_message.IResponse=} [properties] Properties to set
             */
            function Response(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Response callbackIdx.
             * @member {number} callbackIdx
             * @memberof pb_message.Response
             * @instance
             */
            Response.prototype.callbackIdx = 0;
    
            /**
             * Response respPointer.
             * @member {number|Long|null|undefined} respPointer
             * @memberof pb_message.Response
             * @instance
             */
            Response.prototype.respPointer = null;
    
            /**
             * Response requestError.
             * @member {string|null|undefined} requestError
             * @memberof pb_message.Response
             * @instance
             */
            Response.prototype.requestError = null;
    
            /**
             * Response closingError.
             * @member {string|null|undefined} closingError
             * @memberof pb_message.Response
             * @instance
             */
            Response.prototype.closingError = null;
    
            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;
    
            /**
             * Response value.
             * @member {"respPointer"|"requestError"|"closingError"|undefined} value
             * @memberof pb_message.Response
             * @instance
             */
            Object.defineProperty(Response.prototype, "value", {
                get: $util.oneOfGetter($oneOfFields = ["respPointer", "requestError", "closingError"]),
                set: $util.oneOfSetter($oneOfFields)
            });
    
            /**
             * Creates a new Response instance using the specified properties.
             * @function create
             * @memberof pb_message.Response
             * @static
             * @param {pb_message.IResponse=} [properties] Properties to set
             * @returns {pb_message.Response} Response instance
             */
            Response.create = function create(properties) {
                return new Response(properties);
            };
    
            /**
             * Encodes the specified Response message. Does not implicitly {@link pb_message.Response.verify|verify} messages.
             * @function encode
             * @memberof pb_message.Response
             * @static
             * @param {pb_message.IResponse} message Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Response.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.callbackIdx != null && Object.hasOwnProperty.call(message, "callbackIdx"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.callbackIdx);
                if (message.respPointer != null && Object.hasOwnProperty.call(message, "respPointer"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.respPointer);
                if (message.requestError != null && Object.hasOwnProperty.call(message, "requestError"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.requestError);
                if (message.closingError != null && Object.hasOwnProperty.call(message, "closingError"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.closingError);
                return writer;
            };
    
            /**
             * Encodes the specified Response message, length delimited. Does not implicitly {@link pb_message.Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb_message.Response
             * @static
             * @param {pb_message.IResponse} message Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Response message from the specified reader or buffer.
             * @function decode
             * @memberof pb_message.Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb_message.Response} Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Response.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_message.Response();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.callbackIdx = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.respPointer = reader.uint64();
                            break;
                        }
                    case 4: {
                            message.requestError = reader.string();
                            break;
                        }
                    case 5: {
                            message.closingError = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Response message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb_message.Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb_message.Response} Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Response.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Response message.
             * @function verify
             * @memberof pb_message.Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Response.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    if (!$util.isInteger(message.callbackIdx))
                        return "callbackIdx: integer expected";
                if (message.respPointer != null && message.hasOwnProperty("respPointer")) {
                    properties.value = 1;
                    if (!$util.isInteger(message.respPointer) && !(message.respPointer && $util.isInteger(message.respPointer.low) && $util.isInteger(message.respPointer.high)))
                        return "respPointer: integer|Long expected";
                }
                if (message.requestError != null && message.hasOwnProperty("requestError")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isString(message.requestError))
                        return "requestError: string expected";
                }
                if (message.closingError != null && message.hasOwnProperty("closingError")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isString(message.closingError))
                        return "closingError: string expected";
                }
                return null;
            };
    
            /**
             * Creates a Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb_message.Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb_message.Response} Response
             */
            Response.fromObject = function fromObject(object) {
                if (object instanceof $root.pb_message.Response)
                    return object;
                var message = new $root.pb_message.Response();
                if (object.callbackIdx != null)
                    message.callbackIdx = object.callbackIdx >>> 0;
                if (object.respPointer != null)
                    if ($util.Long)
                        (message.respPointer = $util.Long.fromValue(object.respPointer)).unsigned = true;
                    else if (typeof object.respPointer === "string")
                        message.respPointer = parseInt(object.respPointer, 10);
                    else if (typeof object.respPointer === "number")
                        message.respPointer = object.respPointer;
                    else if (typeof object.respPointer === "object")
                        message.respPointer = new $util.LongBits(object.respPointer.low >>> 0, object.respPointer.high >>> 0).toNumber(true);
                if (object.requestError != null)
                    message.requestError = String(object.requestError);
                if (object.closingError != null)
                    message.closingError = String(object.closingError);
                return message;
            };
    
            /**
             * Creates a plain object from a Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb_message.Response
             * @static
             * @param {pb_message.Response} message Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Response.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.callbackIdx = 0;
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    object.callbackIdx = message.callbackIdx;
                if (message.respPointer != null && message.hasOwnProperty("respPointer")) {
                    if (typeof message.respPointer === "number")
                        object.respPointer = options.longs === String ? String(message.respPointer) : message.respPointer;
                    else
                        object.respPointer = options.longs === String ? $util.Long.prototype.toString.call(message.respPointer) : options.longs === Number ? new $util.LongBits(message.respPointer.low >>> 0, message.respPointer.high >>> 0).toNumber(true) : message.respPointer;
                    if (options.oneofs)
                        object.value = "respPointer";
                }
                if (message.requestError != null && message.hasOwnProperty("requestError")) {
                    object.requestError = message.requestError;
                    if (options.oneofs)
                        object.value = "requestError";
                }
                if (message.closingError != null && message.hasOwnProperty("closingError")) {
                    object.closingError = message.closingError;
                    if (options.oneofs)
                        object.value = "closingError";
                }
                return object;
            };
    
            /**
             * Converts this Response to JSON.
             * @function toJSON
             * @memberof pb_message.Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Response
             * @function getTypeUrl
             * @memberof pb_message.Response
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Response.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/pb_message.Response";
            };
    
            return Response;
        })();
    
        return pb_message;
    })();

    return $root;
});
