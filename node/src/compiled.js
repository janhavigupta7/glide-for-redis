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
    
    $root.babushkaproto = (function() {
    
        /**
         * Namespace babushkaproto.
         * @exports babushkaproto
         * @namespace
         */
        var babushkaproto = {};
    
        babushkaproto.CommandReply = (function() {
    
            /**
             * Properties of a CommandReply.
             * @memberof babushkaproto
             * @interface ICommandReply
             * @property {number|null} [callbackIdx] CommandReply callbackIdx
             * @property {string|null} [response] CommandReply response
             * @property {string|null} [error] CommandReply error
             */
    
            /**
             * Constructs a new CommandReply.
             * @memberof babushkaproto
             * @classdesc Represents a CommandReply.
             * @implements ICommandReply
             * @constructor
             * @param {babushkaproto.ICommandReply=} [properties] Properties to set
             */
            function CommandReply(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * CommandReply callbackIdx.
             * @member {number} callbackIdx
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.callbackIdx = 0;
    
            /**
             * CommandReply response.
             * @member {string|null|undefined} response
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.response = null;
    
            /**
             * CommandReply error.
             * @member {string|null|undefined} error
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.error = null;
    
            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;
    
            /**
             * CommandReply _response.
             * @member {"response"|undefined} _response
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            Object.defineProperty(CommandReply.prototype, "_response", {
                get: $util.oneOfGetter($oneOfFields = ["response"]),
                set: $util.oneOfSetter($oneOfFields)
            });
    
            /**
             * CommandReply _error.
             * @member {"error"|undefined} _error
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            Object.defineProperty(CommandReply.prototype, "_error", {
                get: $util.oneOfGetter($oneOfFields = ["error"]),
                set: $util.oneOfSetter($oneOfFields)
            });
    
            /**
             * Creates a new CommandReply instance using the specified properties.
             * @function create
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {babushkaproto.ICommandReply=} [properties] Properties to set
             * @returns {babushkaproto.CommandReply} CommandReply instance
             */
            CommandReply.create = function create(properties) {
                return new CommandReply(properties);
            };
    
            /**
             * Encodes the specified CommandReply message. Does not implicitly {@link babushkaproto.CommandReply.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {babushkaproto.ICommandReply} message CommandReply message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CommandReply.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.callbackIdx != null && Object.hasOwnProperty.call(message, "callbackIdx"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.callbackIdx);
                if (message.response != null && Object.hasOwnProperty.call(message, "response"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.response);
                if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
                return writer;
            };
    
            /**
             * Encodes the specified CommandReply message, length delimited. Does not implicitly {@link babushkaproto.CommandReply.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {babushkaproto.ICommandReply} message CommandReply message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CommandReply.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a CommandReply message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.CommandReply} CommandReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CommandReply.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.CommandReply();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.callbackIdx = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.response = reader.string();
                            break;
                        }
                    case 3: {
                            message.error = reader.string();
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
             * Decodes a CommandReply message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.CommandReply} CommandReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CommandReply.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a CommandReply message.
             * @function verify
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CommandReply.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    if (!$util.isInteger(message.callbackIdx))
                        return "callbackIdx: integer expected";
                if (message.response != null && message.hasOwnProperty("response")) {
                    properties._response = 1;
                    if (!$util.isString(message.response))
                        return "response: string expected";
                }
                if (message.error != null && message.hasOwnProperty("error")) {
                    properties._error = 1;
                    if (!$util.isString(message.error))
                        return "error: string expected";
                }
                return null;
            };
    
            /**
             * Creates a CommandReply message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.CommandReply} CommandReply
             */
            CommandReply.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.CommandReply)
                    return object;
                var message = new $root.babushkaproto.CommandReply();
                if (object.callbackIdx != null)
                    message.callbackIdx = object.callbackIdx >>> 0;
                if (object.response != null)
                    message.response = String(object.response);
                if (object.error != null)
                    message.error = String(object.error);
                return message;
            };
    
            /**
             * Creates a plain object from a CommandReply message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {babushkaproto.CommandReply} message CommandReply
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CommandReply.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.callbackIdx = 0;
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    object.callbackIdx = message.callbackIdx;
                if (message.response != null && message.hasOwnProperty("response")) {
                    object.response = message.response;
                    if (options.oneofs)
                        object._response = "response";
                }
                if (message.error != null && message.hasOwnProperty("error")) {
                    object.error = message.error;
                    if (options.oneofs)
                        object._error = "error";
                }
                return object;
            };
    
            /**
             * Converts this CommandReply to JSON.
             * @function toJSON
             * @memberof babushkaproto.CommandReply
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CommandReply.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for CommandReply
             * @function getTypeUrl
             * @memberof babushkaproto.CommandReply
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CommandReply.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.CommandReply";
            };
    
            return CommandReply;
        })();
    
        babushkaproto.Request = (function() {
    
            /**
             * Properties of a Request.
             * @memberof babushkaproto
             * @interface IRequest
             * @property {number|null} [callbackIdx] Request callbackIdx
             * @property {number|null} [requestType] Request requestType
             * @property {Array.<string>|null} [arg] Request arg
             */
    
            /**
             * Constructs a new Request.
             * @memberof babushkaproto
             * @classdesc Represents a Request.
             * @implements IRequest
             * @constructor
             * @param {babushkaproto.IRequest=} [properties] Properties to set
             */
            function Request(properties) {
                this.arg = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Request callbackIdx.
             * @member {number} callbackIdx
             * @memberof babushkaproto.Request
             * @instance
             */
            Request.prototype.callbackIdx = 0;
    
            /**
             * Request requestType.
             * @member {number} requestType
             * @memberof babushkaproto.Request
             * @instance
             */
            Request.prototype.requestType = 0;
    
            /**
             * Request arg.
             * @member {Array.<string>} arg
             * @memberof babushkaproto.Request
             * @instance
             */
            Request.prototype.arg = $util.emptyArray;
    
            /**
             * Creates a new Request instance using the specified properties.
             * @function create
             * @memberof babushkaproto.Request
             * @static
             * @param {babushkaproto.IRequest=} [properties] Properties to set
             * @returns {babushkaproto.Request} Request instance
             */
            Request.create = function create(properties) {
                return new Request(properties);
            };
    
            /**
             * Encodes the specified Request message. Does not implicitly {@link babushkaproto.Request.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.Request
             * @static
             * @param {babushkaproto.IRequest} message Request message or plain object to encode
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
                if (message.arg != null && message.arg.length)
                    for (var i = 0; i < message.arg.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.arg[i]);
                return writer;
            };
    
            /**
             * Encodes the specified Request message, length delimited. Does not implicitly {@link babushkaproto.Request.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.Request
             * @static
             * @param {babushkaproto.IRequest} message Request message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Request.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Request message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.Request} Request
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Request.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Request();
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
                            if (!(message.arg && message.arg.length))
                                message.arg = [];
                            message.arg.push(reader.string());
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
             * @memberof babushkaproto.Request
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.Request} Request
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
             * @memberof babushkaproto.Request
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
                if (message.arg != null && message.hasOwnProperty("arg")) {
                    if (!Array.isArray(message.arg))
                        return "arg: array expected";
                    for (var i = 0; i < message.arg.length; ++i)
                        if (!$util.isString(message.arg[i]))
                            return "arg: string[] expected";
                }
                return null;
            };
    
            /**
             * Creates a Request message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.Request
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.Request} Request
             */
            Request.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.Request)
                    return object;
                var message = new $root.babushkaproto.Request();
                if (object.callbackIdx != null)
                    message.callbackIdx = object.callbackIdx >>> 0;
                if (object.requestType != null)
                    message.requestType = object.requestType >>> 0;
                if (object.arg) {
                    if (!Array.isArray(object.arg))
                        throw TypeError(".babushkaproto.Request.arg: array expected");
                    message.arg = [];
                    for (var i = 0; i < object.arg.length; ++i)
                        message.arg[i] = String(object.arg[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Request message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.Request
             * @static
             * @param {babushkaproto.Request} message Request
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Request.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.arg = [];
                if (options.defaults) {
                    object.callbackIdx = 0;
                    object.requestType = 0;
                }
                if (message.callbackIdx != null && message.hasOwnProperty("callbackIdx"))
                    object.callbackIdx = message.callbackIdx;
                if (message.requestType != null && message.hasOwnProperty("requestType"))
                    object.requestType = message.requestType;
                if (message.arg && message.arg.length) {
                    object.arg = [];
                    for (var j = 0; j < message.arg.length; ++j)
                        object.arg[j] = message.arg[j];
                }
                return object;
            };
    
            /**
             * Converts this Request to JSON.
             * @function toJSON
             * @memberof babushkaproto.Request
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Request.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Request
             * @function getTypeUrl
             * @memberof babushkaproto.Request
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Request.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.Request";
            };
    
            return Request;
        })();
    
        return babushkaproto;
    })();

    return $root;
});
