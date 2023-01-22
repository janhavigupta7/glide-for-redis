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
    
        babushkaproto.Response = (function() {
    
            /**
             * Properties of a Response.
             * @memberof babushkaproto
             * @interface IResponse
             * @property {Array.<babushkaproto.Response.ISlotRange>|null} [slot] Response slot
             */
    
            /**
             * Constructs a new Response.
             * @memberof babushkaproto
             * @classdesc Represents a Response.
             * @implements IResponse
             * @constructor
             * @param {babushkaproto.IResponse=} [properties] Properties to set
             */
            function Response(properties) {
                this.slot = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Response slot.
             * @member {Array.<babushkaproto.Response.ISlotRange>} slot
             * @memberof babushkaproto.Response
             * @instance
             */
            Response.prototype.slot = $util.emptyArray;
    
            /**
             * Creates a new Response instance using the specified properties.
             * @function create
             * @memberof babushkaproto.Response
             * @static
             * @param {babushkaproto.IResponse=} [properties] Properties to set
             * @returns {babushkaproto.Response} Response instance
             */
            Response.create = function create(properties) {
                return new Response(properties);
            };
    
            /**
             * Encodes the specified Response message. Does not implicitly {@link babushkaproto.Response.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.Response
             * @static
             * @param {babushkaproto.IResponse} message Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Response.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.slot != null && message.slot.length)
                    for (var i = 0; i < message.slot.length; ++i)
                        $root.babushkaproto.Response.SlotRange.encode(message.slot[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified Response message, length delimited. Does not implicitly {@link babushkaproto.Response.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.Response
             * @static
             * @param {babushkaproto.IResponse} message Response message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Response.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Response message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.Response} Response
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Response.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Response();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.slot && message.slot.length))
                                message.slot = [];
                            message.slot.push($root.babushkaproto.Response.SlotRange.decode(reader, reader.uint32()));
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
             * @memberof babushkaproto.Response
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.Response} Response
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
             * @memberof babushkaproto.Response
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Response.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.slot != null && message.hasOwnProperty("slot")) {
                    if (!Array.isArray(message.slot))
                        return "slot: array expected";
                    for (var i = 0; i < message.slot.length; ++i) {
                        var error = $root.babushkaproto.Response.SlotRange.verify(message.slot[i]);
                        if (error)
                            return "slot." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a Response message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.Response
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.Response} Response
             */
            Response.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.Response)
                    return object;
                var message = new $root.babushkaproto.Response();
                if (object.slot) {
                    if (!Array.isArray(object.slot))
                        throw TypeError(".babushkaproto.Response.slot: array expected");
                    message.slot = [];
                    for (var i = 0; i < object.slot.length; ++i) {
                        if (typeof object.slot[i] !== "object")
                            throw TypeError(".babushkaproto.Response.slot: object expected");
                        message.slot[i] = $root.babushkaproto.Response.SlotRange.fromObject(object.slot[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Response message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.Response
             * @static
             * @param {babushkaproto.Response} message Response
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Response.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.slot = [];
                if (message.slot && message.slot.length) {
                    object.slot = [];
                    for (var j = 0; j < message.slot.length; ++j)
                        object.slot[j] = $root.babushkaproto.Response.SlotRange.toObject(message.slot[j], options);
                }
                return object;
            };
    
            /**
             * Converts this Response to JSON.
             * @function toJSON
             * @memberof babushkaproto.Response
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Response.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Response
             * @function getTypeUrl
             * @memberof babushkaproto.Response
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Response.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.Response";
            };
    
            Response.Node = (function() {
    
                /**
                 * Properties of a Node.
                 * @memberof babushkaproto.Response
                 * @interface INode
                 * @property {string|null} [address] Node address
                 */
    
                /**
                 * Constructs a new Node.
                 * @memberof babushkaproto.Response
                 * @classdesc Represents a Node.
                 * @implements INode
                 * @constructor
                 * @param {babushkaproto.Response.INode=} [properties] Properties to set
                 */
                function Node(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * Node address.
                 * @member {string} address
                 * @memberof babushkaproto.Response.Node
                 * @instance
                 */
                Node.prototype.address = "";
    
                /**
                 * Creates a new Node instance using the specified properties.
                 * @function create
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {babushkaproto.Response.INode=} [properties] Properties to set
                 * @returns {babushkaproto.Response.Node} Node instance
                 */
                Node.create = function create(properties) {
                    return new Node(properties);
                };
    
                /**
                 * Encodes the specified Node message. Does not implicitly {@link babushkaproto.Response.Node.verify|verify} messages.
                 * @function encode
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {babushkaproto.Response.INode} message Node message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Node.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.address);
                    return writer;
                };
    
                /**
                 * Encodes the specified Node message, length delimited. Does not implicitly {@link babushkaproto.Response.Node.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {babushkaproto.Response.INode} message Node message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Node.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a Node message from the specified reader or buffer.
                 * @function decode
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {babushkaproto.Response.Node} Node
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Node.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Response.Node();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.address = reader.string();
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
                 * Decodes a Node message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {babushkaproto.Response.Node} Node
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Node.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a Node message.
                 * @function verify
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Node.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.address != null && message.hasOwnProperty("address"))
                        if (!$util.isString(message.address))
                            return "address: string expected";
                    return null;
                };
    
                /**
                 * Creates a Node message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {babushkaproto.Response.Node} Node
                 */
                Node.fromObject = function fromObject(object) {
                    if (object instanceof $root.babushkaproto.Response.Node)
                        return object;
                    var message = new $root.babushkaproto.Response.Node();
                    if (object.address != null)
                        message.address = String(object.address);
                    return message;
                };
    
                /**
                 * Creates a plain object from a Node message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {babushkaproto.Response.Node} message Node
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Node.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.address = "";
                    if (message.address != null && message.hasOwnProperty("address"))
                        object.address = message.address;
                    return object;
                };
    
                /**
                 * Converts this Node to JSON.
                 * @function toJSON
                 * @memberof babushkaproto.Response.Node
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Node.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                /**
                 * Gets the default type url for Node
                 * @function getTypeUrl
                 * @memberof babushkaproto.Response.Node
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Node.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/babushkaproto.Response.Node";
                };
    
                return Node;
            })();
    
            Response.SlotRange = (function() {
    
                /**
                 * Properties of a SlotRange.
                 * @memberof babushkaproto.Response
                 * @interface ISlotRange
                 * @property {number|null} [startRange] SlotRange startRange
                 * @property {number|null} [endRange] SlotRange endRange
                 * @property {Array.<babushkaproto.Response.INode>|null} [node] SlotRange node
                 */
    
                /**
                 * Constructs a new SlotRange.
                 * @memberof babushkaproto.Response
                 * @classdesc Represents a SlotRange.
                 * @implements ISlotRange
                 * @constructor
                 * @param {babushkaproto.Response.ISlotRange=} [properties] Properties to set
                 */
                function SlotRange(properties) {
                    this.node = [];
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }
    
                /**
                 * SlotRange startRange.
                 * @member {number} startRange
                 * @memberof babushkaproto.Response.SlotRange
                 * @instance
                 */
                SlotRange.prototype.startRange = 0;
    
                /**
                 * SlotRange endRange.
                 * @member {number} endRange
                 * @memberof babushkaproto.Response.SlotRange
                 * @instance
                 */
                SlotRange.prototype.endRange = 0;
    
                /**
                 * SlotRange node.
                 * @member {Array.<babushkaproto.Response.INode>} node
                 * @memberof babushkaproto.Response.SlotRange
                 * @instance
                 */
                SlotRange.prototype.node = $util.emptyArray;
    
                /**
                 * Creates a new SlotRange instance using the specified properties.
                 * @function create
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {babushkaproto.Response.ISlotRange=} [properties] Properties to set
                 * @returns {babushkaproto.Response.SlotRange} SlotRange instance
                 */
                SlotRange.create = function create(properties) {
                    return new SlotRange(properties);
                };
    
                /**
                 * Encodes the specified SlotRange message. Does not implicitly {@link babushkaproto.Response.SlotRange.verify|verify} messages.
                 * @function encode
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {babushkaproto.Response.ISlotRange} message SlotRange message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SlotRange.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.startRange != null && Object.hasOwnProperty.call(message, "startRange"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.startRange);
                    if (message.endRange != null && Object.hasOwnProperty.call(message, "endRange"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.endRange);
                    if (message.node != null && message.node.length)
                        for (var i = 0; i < message.node.length; ++i)
                            $root.babushkaproto.Response.Node.encode(message.node[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };
    
                /**
                 * Encodes the specified SlotRange message, length delimited. Does not implicitly {@link babushkaproto.Response.SlotRange.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {babushkaproto.Response.ISlotRange} message SlotRange message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SlotRange.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
    
                /**
                 * Decodes a SlotRange message from the specified reader or buffer.
                 * @function decode
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {babushkaproto.Response.SlotRange} SlotRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SlotRange.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Response.SlotRange();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.startRange = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.endRange = reader.uint32();
                                break;
                            }
                        case 3: {
                                if (!(message.node && message.node.length))
                                    message.node = [];
                                message.node.push($root.babushkaproto.Response.Node.decode(reader, reader.uint32()));
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
                 * Decodes a SlotRange message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {babushkaproto.Response.SlotRange} SlotRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SlotRange.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
    
                /**
                 * Verifies a SlotRange message.
                 * @function verify
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SlotRange.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.startRange != null && message.hasOwnProperty("startRange"))
                        if (!$util.isInteger(message.startRange))
                            return "startRange: integer expected";
                    if (message.endRange != null && message.hasOwnProperty("endRange"))
                        if (!$util.isInteger(message.endRange))
                            return "endRange: integer expected";
                    if (message.node != null && message.hasOwnProperty("node")) {
                        if (!Array.isArray(message.node))
                            return "node: array expected";
                        for (var i = 0; i < message.node.length; ++i) {
                            var error = $root.babushkaproto.Response.Node.verify(message.node[i]);
                            if (error)
                                return "node." + error;
                        }
                    }
                    return null;
                };
    
                /**
                 * Creates a SlotRange message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {babushkaproto.Response.SlotRange} SlotRange
                 */
                SlotRange.fromObject = function fromObject(object) {
                    if (object instanceof $root.babushkaproto.Response.SlotRange)
                        return object;
                    var message = new $root.babushkaproto.Response.SlotRange();
                    if (object.startRange != null)
                        message.startRange = object.startRange >>> 0;
                    if (object.endRange != null)
                        message.endRange = object.endRange >>> 0;
                    if (object.node) {
                        if (!Array.isArray(object.node))
                            throw TypeError(".babushkaproto.Response.SlotRange.node: array expected");
                        message.node = [];
                        for (var i = 0; i < object.node.length; ++i) {
                            if (typeof object.node[i] !== "object")
                                throw TypeError(".babushkaproto.Response.SlotRange.node: object expected");
                            message.node[i] = $root.babushkaproto.Response.Node.fromObject(object.node[i]);
                        }
                    }
                    return message;
                };
    
                /**
                 * Creates a plain object from a SlotRange message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {babushkaproto.Response.SlotRange} message SlotRange
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SlotRange.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.arrays || options.defaults)
                        object.node = [];
                    if (options.defaults) {
                        object.startRange = 0;
                        object.endRange = 0;
                    }
                    if (message.startRange != null && message.hasOwnProperty("startRange"))
                        object.startRange = message.startRange;
                    if (message.endRange != null && message.hasOwnProperty("endRange"))
                        object.endRange = message.endRange;
                    if (message.node && message.node.length) {
                        object.node = [];
                        for (var j = 0; j < message.node.length; ++j)
                            object.node[j] = $root.babushkaproto.Response.Node.toObject(message.node[j], options);
                    }
                    return object;
                };
    
                /**
                 * Converts this SlotRange to JSON.
                 * @function toJSON
                 * @memberof babushkaproto.Response.SlotRange
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SlotRange.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
    
                /**
                 * Gets the default type url for SlotRange
                 * @function getTypeUrl
                 * @memberof babushkaproto.Response.SlotRange
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SlotRange.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/babushkaproto.Response.SlotRange";
                };
    
                return SlotRange;
            })();
    
            return Response;
        })();
    
        babushkaproto.NullResp = (function() {
    
            /**
             * Properties of a NullResp.
             * @memberof babushkaproto
             * @interface INullResp
             */
    
            /**
             * Constructs a new NullResp.
             * @memberof babushkaproto
             * @classdesc Represents a NullResp.
             * @implements INullResp
             * @constructor
             * @param {babushkaproto.INullResp=} [properties] Properties to set
             */
            function NullResp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Creates a new NullResp instance using the specified properties.
             * @function create
             * @memberof babushkaproto.NullResp
             * @static
             * @param {babushkaproto.INullResp=} [properties] Properties to set
             * @returns {babushkaproto.NullResp} NullResp instance
             */
            NullResp.create = function create(properties) {
                return new NullResp(properties);
            };
    
            /**
             * Encodes the specified NullResp message. Does not implicitly {@link babushkaproto.NullResp.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.NullResp
             * @static
             * @param {babushkaproto.INullResp} message NullResp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NullResp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };
    
            /**
             * Encodes the specified NullResp message, length delimited. Does not implicitly {@link babushkaproto.NullResp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.NullResp
             * @static
             * @param {babushkaproto.INullResp} message NullResp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NullResp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a NullResp message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.NullResp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.NullResp} NullResp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NullResp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.NullResp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a NullResp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.NullResp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.NullResp} NullResp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NullResp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a NullResp message.
             * @function verify
             * @memberof babushkaproto.NullResp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NullResp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };
    
            /**
             * Creates a NullResp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.NullResp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.NullResp} NullResp
             */
            NullResp.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.NullResp)
                    return object;
                return new $root.babushkaproto.NullResp();
            };
    
            /**
             * Creates a plain object from a NullResp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.NullResp
             * @static
             * @param {babushkaproto.NullResp} message NullResp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NullResp.toObject = function toObject() {
                return {};
            };
    
            /**
             * Converts this NullResp to JSON.
             * @function toJSON
             * @memberof babushkaproto.NullResp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NullResp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for NullResp
             * @function getTypeUrl
             * @memberof babushkaproto.NullResp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NullResp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.NullResp";
            };
    
            return NullResp;
        })();
    
        babushkaproto.CommandReply = (function() {
    
            /**
             * Properties of a CommandReply.
             * @memberof babushkaproto
             * @interface ICommandReply
             * @property {number|null} [callbackIdx] CommandReply callbackIdx
             * @property {string|null} [error] CommandReply error
             * @property {babushkaproto.IStrResponse|null} [resp1] CommandReply resp1
             * @property {babushkaproto.INullResp|null} [resp2] CommandReply resp2
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
             * CommandReply error.
             * @member {string|null|undefined} error
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.error = null;
    
            /**
             * CommandReply resp1.
             * @member {babushkaproto.IStrResponse|null|undefined} resp1
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.resp1 = null;
    
            /**
             * CommandReply resp2.
             * @member {babushkaproto.INullResp|null|undefined} resp2
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            CommandReply.prototype.resp2 = null;
    
            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;
    
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
             * CommandReply response.
             * @member {"resp1"|"resp2"|undefined} response
             * @memberof babushkaproto.CommandReply
             * @instance
             */
            Object.defineProperty(CommandReply.prototype, "response", {
                get: $util.oneOfGetter($oneOfFields = ["resp1", "resp2"]),
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
                if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
                if (message.resp1 != null && Object.hasOwnProperty.call(message, "resp1"))
                    $root.babushkaproto.StrResponse.encode(message.resp1, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.resp2 != null && Object.hasOwnProperty.call(message, "resp2"))
                    $root.babushkaproto.NullResp.encode(message.resp2, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
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
                            message.error = reader.string();
                            break;
                        }
                    case 3: {
                            message.resp1 = $root.babushkaproto.StrResponse.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.resp2 = $root.babushkaproto.NullResp.decode(reader, reader.uint32());
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
                if (message.error != null && message.hasOwnProperty("error")) {
                    properties._error = 1;
                    if (!$util.isString(message.error))
                        return "error: string expected";
                }
                if (message.resp1 != null && message.hasOwnProperty("resp1")) {
                    properties.response = 1;
                    {
                        var error = $root.babushkaproto.StrResponse.verify(message.resp1);
                        if (error)
                            return "resp1." + error;
                    }
                }
                if (message.resp2 != null && message.hasOwnProperty("resp2")) {
                    if (properties.response === 1)
                        return "response: multiple values";
                    properties.response = 1;
                    {
                        var error = $root.babushkaproto.NullResp.verify(message.resp2);
                        if (error)
                            return "resp2." + error;
                    }
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
                if (object.error != null)
                    message.error = String(object.error);
                if (object.resp1 != null) {
                    if (typeof object.resp1 !== "object")
                        throw TypeError(".babushkaproto.CommandReply.resp1: object expected");
                    message.resp1 = $root.babushkaproto.StrResponse.fromObject(object.resp1);
                }
                if (object.resp2 != null) {
                    if (typeof object.resp2 !== "object")
                        throw TypeError(".babushkaproto.CommandReply.resp2: object expected");
                    message.resp2 = $root.babushkaproto.NullResp.fromObject(object.resp2);
                }
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
                if (message.error != null && message.hasOwnProperty("error")) {
                    object.error = message.error;
                    if (options.oneofs)
                        object._error = "error";
                }
                if (message.resp1 != null && message.hasOwnProperty("resp1")) {
                    object.resp1 = $root.babushkaproto.StrResponse.toObject(message.resp1, options);
                    if (options.oneofs)
                        object.response = "resp1";
                }
                if (message.resp2 != null && message.hasOwnProperty("resp2")) {
                    object.resp2 = $root.babushkaproto.NullResp.toObject(message.resp2, options);
                    if (options.oneofs)
                        object.response = "resp2";
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
    
        babushkaproto.RepStrResponse = (function() {
    
            /**
             * Properties of a RepStrResponse.
             * @memberof babushkaproto
             * @interface IRepStrResponse
             * @property {Array.<string>|null} [arg] RepStrResponse arg
             */
    
            /**
             * Constructs a new RepStrResponse.
             * @memberof babushkaproto
             * @classdesc Represents a RepStrResponse.
             * @implements IRepStrResponse
             * @constructor
             * @param {babushkaproto.IRepStrResponse=} [properties] Properties to set
             */
            function RepStrResponse(properties) {
                this.arg = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * RepStrResponse arg.
             * @member {Array.<string>} arg
             * @memberof babushkaproto.RepStrResponse
             * @instance
             */
            RepStrResponse.prototype.arg = $util.emptyArray;
    
            /**
             * Creates a new RepStrResponse instance using the specified properties.
             * @function create
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {babushkaproto.IRepStrResponse=} [properties] Properties to set
             * @returns {babushkaproto.RepStrResponse} RepStrResponse instance
             */
            RepStrResponse.create = function create(properties) {
                return new RepStrResponse(properties);
            };
    
            /**
             * Encodes the specified RepStrResponse message. Does not implicitly {@link babushkaproto.RepStrResponse.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {babushkaproto.IRepStrResponse} message RepStrResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RepStrResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.arg != null && message.arg.length)
                    for (var i = 0; i < message.arg.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.arg[i]);
                return writer;
            };
    
            /**
             * Encodes the specified RepStrResponse message, length delimited. Does not implicitly {@link babushkaproto.RepStrResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {babushkaproto.IRepStrResponse} message RepStrResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RepStrResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a RepStrResponse message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.RepStrResponse} RepStrResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RepStrResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.RepStrResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
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
             * Decodes a RepStrResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.RepStrResponse} RepStrResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RepStrResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a RepStrResponse message.
             * @function verify
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RepStrResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
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
             * Creates a RepStrResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.RepStrResponse} RepStrResponse
             */
            RepStrResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.RepStrResponse)
                    return object;
                var message = new $root.babushkaproto.RepStrResponse();
                if (object.arg) {
                    if (!Array.isArray(object.arg))
                        throw TypeError(".babushkaproto.RepStrResponse.arg: array expected");
                    message.arg = [];
                    for (var i = 0; i < object.arg.length; ++i)
                        message.arg[i] = String(object.arg[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a RepStrResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {babushkaproto.RepStrResponse} message RepStrResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RepStrResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.arg = [];
                if (message.arg && message.arg.length) {
                    object.arg = [];
                    for (var j = 0; j < message.arg.length; ++j)
                        object.arg[j] = message.arg[j];
                }
                return object;
            };
    
            /**
             * Converts this RepStrResponse to JSON.
             * @function toJSON
             * @memberof babushkaproto.RepStrResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RepStrResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for RepStrResponse
             * @function getTypeUrl
             * @memberof babushkaproto.RepStrResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RepStrResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.RepStrResponse";
            };
    
            return RepStrResponse;
        })();
    
        babushkaproto.StrResponse = (function() {
    
            /**
             * Properties of a StrResponse.
             * @memberof babushkaproto
             * @interface IStrResponse
             * @property {string|null} [arg] StrResponse arg
             */
    
            /**
             * Constructs a new StrResponse.
             * @memberof babushkaproto
             * @classdesc Represents a StrResponse.
             * @implements IStrResponse
             * @constructor
             * @param {babushkaproto.IStrResponse=} [properties] Properties to set
             */
            function StrResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * StrResponse arg.
             * @member {string} arg
             * @memberof babushkaproto.StrResponse
             * @instance
             */
            StrResponse.prototype.arg = "";
    
            /**
             * Creates a new StrResponse instance using the specified properties.
             * @function create
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {babushkaproto.IStrResponse=} [properties] Properties to set
             * @returns {babushkaproto.StrResponse} StrResponse instance
             */
            StrResponse.create = function create(properties) {
                return new StrResponse(properties);
            };
    
            /**
             * Encodes the specified StrResponse message. Does not implicitly {@link babushkaproto.StrResponse.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {babushkaproto.IStrResponse} message StrResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StrResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.arg != null && Object.hasOwnProperty.call(message, "arg"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.arg);
                return writer;
            };
    
            /**
             * Encodes the specified StrResponse message, length delimited. Does not implicitly {@link babushkaproto.StrResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {babushkaproto.IStrResponse} message StrResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StrResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a StrResponse message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.StrResponse} StrResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StrResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.StrResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 3: {
                            message.arg = reader.string();
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
             * Decodes a StrResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.StrResponse} StrResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StrResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a StrResponse message.
             * @function verify
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            StrResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.arg != null && message.hasOwnProperty("arg"))
                    if (!$util.isString(message.arg))
                        return "arg: string expected";
                return null;
            };
    
            /**
             * Creates a StrResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.StrResponse} StrResponse
             */
            StrResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.StrResponse)
                    return object;
                var message = new $root.babushkaproto.StrResponse();
                if (object.arg != null)
                    message.arg = String(object.arg);
                return message;
            };
    
            /**
             * Creates a plain object from a StrResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {babushkaproto.StrResponse} message StrResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StrResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.arg = "";
                if (message.arg != null && message.hasOwnProperty("arg"))
                    object.arg = message.arg;
                return object;
            };
    
            /**
             * Converts this StrResponse to JSON.
             * @function toJSON
             * @memberof babushkaproto.StrResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            StrResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for StrResponse
             * @function getTypeUrl
             * @memberof babushkaproto.StrResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            StrResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.StrResponse";
            };
    
            return StrResponse;
        })();
    
        babushkaproto.Node = (function() {
    
            /**
             * Properties of a Node.
             * @memberof babushkaproto
             * @interface INode
             * @property {string|null} [address] Node address
             * @property {number|null} [port] Node port
             * @property {string|null} [nodeId] Node nodeId
             * @property {string|null} [hostname] Node hostname
             */
    
            /**
             * Constructs a new Node.
             * @memberof babushkaproto
             * @classdesc Represents a Node.
             * @implements INode
             * @constructor
             * @param {babushkaproto.INode=} [properties] Properties to set
             */
            function Node(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Node address.
             * @member {string} address
             * @memberof babushkaproto.Node
             * @instance
             */
            Node.prototype.address = "";
    
            /**
             * Node port.
             * @member {number} port
             * @memberof babushkaproto.Node
             * @instance
             */
            Node.prototype.port = 0;
    
            /**
             * Node nodeId.
             * @member {string} nodeId
             * @memberof babushkaproto.Node
             * @instance
             */
            Node.prototype.nodeId = "";
    
            /**
             * Node hostname.
             * @member {string} hostname
             * @memberof babushkaproto.Node
             * @instance
             */
            Node.prototype.hostname = "";
    
            /**
             * Creates a new Node instance using the specified properties.
             * @function create
             * @memberof babushkaproto.Node
             * @static
             * @param {babushkaproto.INode=} [properties] Properties to set
             * @returns {babushkaproto.Node} Node instance
             */
            Node.create = function create(properties) {
                return new Node(properties);
            };
    
            /**
             * Encodes the specified Node message. Does not implicitly {@link babushkaproto.Node.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.Node
             * @static
             * @param {babushkaproto.INode} message Node message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Node.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.address);
                if (message.port != null && Object.hasOwnProperty.call(message, "port"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.port);
                if (message.nodeId != null && Object.hasOwnProperty.call(message, "nodeId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.nodeId);
                if (message.hostname != null && Object.hasOwnProperty.call(message, "hostname"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.hostname);
                return writer;
            };
    
            /**
             * Encodes the specified Node message, length delimited. Does not implicitly {@link babushkaproto.Node.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.Node
             * @static
             * @param {babushkaproto.INode} message Node message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Node.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Node message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.Node
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.Node} Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Node.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Node();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.address = reader.string();
                            break;
                        }
                    case 2: {
                            message.port = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.nodeId = reader.string();
                            break;
                        }
                    case 4: {
                            message.hostname = reader.string();
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
             * Decodes a Node message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.Node
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.Node} Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Node.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Node message.
             * @function verify
             * @memberof babushkaproto.Node
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Node.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.address != null && message.hasOwnProperty("address"))
                    if (!$util.isString(message.address))
                        return "address: string expected";
                if (message.port != null && message.hasOwnProperty("port"))
                    if (!$util.isInteger(message.port))
                        return "port: integer expected";
                if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                    if (!$util.isString(message.nodeId))
                        return "nodeId: string expected";
                if (message.hostname != null && message.hasOwnProperty("hostname"))
                    if (!$util.isString(message.hostname))
                        return "hostname: string expected";
                return null;
            };
    
            /**
             * Creates a Node message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.Node
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.Node} Node
             */
            Node.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.Node)
                    return object;
                var message = new $root.babushkaproto.Node();
                if (object.address != null)
                    message.address = String(object.address);
                if (object.port != null)
                    message.port = object.port >>> 0;
                if (object.nodeId != null)
                    message.nodeId = String(object.nodeId);
                if (object.hostname != null)
                    message.hostname = String(object.hostname);
                return message;
            };
    
            /**
             * Creates a plain object from a Node message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.Node
             * @static
             * @param {babushkaproto.Node} message Node
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Node.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.address = "";
                    object.port = 0;
                    object.nodeId = "";
                    object.hostname = "";
                }
                if (message.address != null && message.hasOwnProperty("address"))
                    object.address = message.address;
                if (message.port != null && message.hasOwnProperty("port"))
                    object.port = message.port;
                if (message.nodeId != null && message.hasOwnProperty("nodeId"))
                    object.nodeId = message.nodeId;
                if (message.hostname != null && message.hasOwnProperty("hostname"))
                    object.hostname = message.hostname;
                return object;
            };
    
            /**
             * Converts this Node to JSON.
             * @function toJSON
             * @memberof babushkaproto.Node
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Node.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Node
             * @function getTypeUrl
             * @memberof babushkaproto.Node
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Node.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.Node";
            };
    
            return Node;
        })();
    
        babushkaproto.Slot = (function() {
    
            /**
             * Properties of a Slot.
             * @memberof babushkaproto
             * @interface ISlot
             * @property {number|null} [startRange] Slot startRange
             * @property {number|null} [endRange] Slot endRange
             * @property {babushkaproto.INode|null} [primary] Slot primary
             * @property {Array.<babushkaproto.INode>|null} [replicas] Slot replicas
             */
    
            /**
             * Constructs a new Slot.
             * @memberof babushkaproto
             * @classdesc Represents a Slot.
             * @implements ISlot
             * @constructor
             * @param {babushkaproto.ISlot=} [properties] Properties to set
             */
            function Slot(properties) {
                this.replicas = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Slot startRange.
             * @member {number} startRange
             * @memberof babushkaproto.Slot
             * @instance
             */
            Slot.prototype.startRange = 0;
    
            /**
             * Slot endRange.
             * @member {number} endRange
             * @memberof babushkaproto.Slot
             * @instance
             */
            Slot.prototype.endRange = 0;
    
            /**
             * Slot primary.
             * @member {babushkaproto.INode|null|undefined} primary
             * @memberof babushkaproto.Slot
             * @instance
             */
            Slot.prototype.primary = null;
    
            /**
             * Slot replicas.
             * @member {Array.<babushkaproto.INode>} replicas
             * @memberof babushkaproto.Slot
             * @instance
             */
            Slot.prototype.replicas = $util.emptyArray;
    
            /**
             * Creates a new Slot instance using the specified properties.
             * @function create
             * @memberof babushkaproto.Slot
             * @static
             * @param {babushkaproto.ISlot=} [properties] Properties to set
             * @returns {babushkaproto.Slot} Slot instance
             */
            Slot.create = function create(properties) {
                return new Slot(properties);
            };
    
            /**
             * Encodes the specified Slot message. Does not implicitly {@link babushkaproto.Slot.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.Slot
             * @static
             * @param {babushkaproto.ISlot} message Slot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Slot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.startRange != null && Object.hasOwnProperty.call(message, "startRange"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.startRange);
                if (message.endRange != null && Object.hasOwnProperty.call(message, "endRange"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.endRange);
                if (message.primary != null && Object.hasOwnProperty.call(message, "primary"))
                    $root.babushkaproto.Node.encode(message.primary, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.replicas != null && message.replicas.length)
                    for (var i = 0; i < message.replicas.length; ++i)
                        $root.babushkaproto.Node.encode(message.replicas[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified Slot message, length delimited. Does not implicitly {@link babushkaproto.Slot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.Slot
             * @static
             * @param {babushkaproto.ISlot} message Slot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Slot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Slot message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.Slot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.Slot} Slot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Slot.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.Slot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.startRange = reader.uint32();
                            break;
                        }
                    case 2: {
                            message.endRange = reader.uint32();
                            break;
                        }
                    case 3: {
                            message.primary = $root.babushkaproto.Node.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            if (!(message.replicas && message.replicas.length))
                                message.replicas = [];
                            message.replicas.push($root.babushkaproto.Node.decode(reader, reader.uint32()));
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
             * Decodes a Slot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.Slot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.Slot} Slot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Slot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Slot message.
             * @function verify
             * @memberof babushkaproto.Slot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Slot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.startRange != null && message.hasOwnProperty("startRange"))
                    if (!$util.isInteger(message.startRange))
                        return "startRange: integer expected";
                if (message.endRange != null && message.hasOwnProperty("endRange"))
                    if (!$util.isInteger(message.endRange))
                        return "endRange: integer expected";
                if (message.primary != null && message.hasOwnProperty("primary")) {
                    var error = $root.babushkaproto.Node.verify(message.primary);
                    if (error)
                        return "primary." + error;
                }
                if (message.replicas != null && message.hasOwnProperty("replicas")) {
                    if (!Array.isArray(message.replicas))
                        return "replicas: array expected";
                    for (var i = 0; i < message.replicas.length; ++i) {
                        var error = $root.babushkaproto.Node.verify(message.replicas[i]);
                        if (error)
                            return "replicas." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a Slot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.Slot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.Slot} Slot
             */
            Slot.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.Slot)
                    return object;
                var message = new $root.babushkaproto.Slot();
                if (object.startRange != null)
                    message.startRange = object.startRange >>> 0;
                if (object.endRange != null)
                    message.endRange = object.endRange >>> 0;
                if (object.primary != null) {
                    if (typeof object.primary !== "object")
                        throw TypeError(".babushkaproto.Slot.primary: object expected");
                    message.primary = $root.babushkaproto.Node.fromObject(object.primary);
                }
                if (object.replicas) {
                    if (!Array.isArray(object.replicas))
                        throw TypeError(".babushkaproto.Slot.replicas: array expected");
                    message.replicas = [];
                    for (var i = 0; i < object.replicas.length; ++i) {
                        if (typeof object.replicas[i] !== "object")
                            throw TypeError(".babushkaproto.Slot.replicas: object expected");
                        message.replicas[i] = $root.babushkaproto.Node.fromObject(object.replicas[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Slot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.Slot
             * @static
             * @param {babushkaproto.Slot} message Slot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Slot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.replicas = [];
                if (options.defaults) {
                    object.startRange = 0;
                    object.endRange = 0;
                    object.primary = null;
                }
                if (message.startRange != null && message.hasOwnProperty("startRange"))
                    object.startRange = message.startRange;
                if (message.endRange != null && message.hasOwnProperty("endRange"))
                    object.endRange = message.endRange;
                if (message.primary != null && message.hasOwnProperty("primary"))
                    object.primary = $root.babushkaproto.Node.toObject(message.primary, options);
                if (message.replicas && message.replicas.length) {
                    object.replicas = [];
                    for (var j = 0; j < message.replicas.length; ++j)
                        object.replicas[j] = $root.babushkaproto.Node.toObject(message.replicas[j], options);
                }
                return object;
            };
    
            /**
             * Converts this Slot to JSON.
             * @function toJSON
             * @memberof babushkaproto.Slot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Slot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Slot
             * @function getTypeUrl
             * @memberof babushkaproto.Slot
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Slot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.Slot";
            };
    
            return Slot;
        })();
    
        babushkaproto.clusterSlotsResp = (function() {
    
            /**
             * Properties of a clusterSlotsResp.
             * @memberof babushkaproto
             * @interface IclusterSlotsResp
             * @property {Array.<babushkaproto.ISlot>|null} [slots] clusterSlotsResp slots
             */
    
            /**
             * Constructs a new clusterSlotsResp.
             * @memberof babushkaproto
             * @classdesc Represents a clusterSlotsResp.
             * @implements IclusterSlotsResp
             * @constructor
             * @param {babushkaproto.IclusterSlotsResp=} [properties] Properties to set
             */
            function clusterSlotsResp(properties) {
                this.slots = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * clusterSlotsResp slots.
             * @member {Array.<babushkaproto.ISlot>} slots
             * @memberof babushkaproto.clusterSlotsResp
             * @instance
             */
            clusterSlotsResp.prototype.slots = $util.emptyArray;
    
            /**
             * Creates a new clusterSlotsResp instance using the specified properties.
             * @function create
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {babushkaproto.IclusterSlotsResp=} [properties] Properties to set
             * @returns {babushkaproto.clusterSlotsResp} clusterSlotsResp instance
             */
            clusterSlotsResp.create = function create(properties) {
                return new clusterSlotsResp(properties);
            };
    
            /**
             * Encodes the specified clusterSlotsResp message. Does not implicitly {@link babushkaproto.clusterSlotsResp.verify|verify} messages.
             * @function encode
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {babushkaproto.IclusterSlotsResp} message clusterSlotsResp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            clusterSlotsResp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.slots != null && message.slots.length)
                    for (var i = 0; i < message.slots.length; ++i)
                        $root.babushkaproto.Slot.encode(message.slots[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified clusterSlotsResp message, length delimited. Does not implicitly {@link babushkaproto.clusterSlotsResp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {babushkaproto.IclusterSlotsResp} message clusterSlotsResp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            clusterSlotsResp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a clusterSlotsResp message from the specified reader or buffer.
             * @function decode
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {babushkaproto.clusterSlotsResp} clusterSlotsResp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            clusterSlotsResp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.babushkaproto.clusterSlotsResp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.slots && message.slots.length))
                                message.slots = [];
                            message.slots.push($root.babushkaproto.Slot.decode(reader, reader.uint32()));
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
             * Decodes a clusterSlotsResp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {babushkaproto.clusterSlotsResp} clusterSlotsResp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            clusterSlotsResp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a clusterSlotsResp message.
             * @function verify
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            clusterSlotsResp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.slots != null && message.hasOwnProperty("slots")) {
                    if (!Array.isArray(message.slots))
                        return "slots: array expected";
                    for (var i = 0; i < message.slots.length; ++i) {
                        var error = $root.babushkaproto.Slot.verify(message.slots[i]);
                        if (error)
                            return "slots." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a clusterSlotsResp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {babushkaproto.clusterSlotsResp} clusterSlotsResp
             */
            clusterSlotsResp.fromObject = function fromObject(object) {
                if (object instanceof $root.babushkaproto.clusterSlotsResp)
                    return object;
                var message = new $root.babushkaproto.clusterSlotsResp();
                if (object.slots) {
                    if (!Array.isArray(object.slots))
                        throw TypeError(".babushkaproto.clusterSlotsResp.slots: array expected");
                    message.slots = [];
                    for (var i = 0; i < object.slots.length; ++i) {
                        if (typeof object.slots[i] !== "object")
                            throw TypeError(".babushkaproto.clusterSlotsResp.slots: object expected");
                        message.slots[i] = $root.babushkaproto.Slot.fromObject(object.slots[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a clusterSlotsResp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {babushkaproto.clusterSlotsResp} message clusterSlotsResp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            clusterSlotsResp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.slots = [];
                if (message.slots && message.slots.length) {
                    object.slots = [];
                    for (var j = 0; j < message.slots.length; ++j)
                        object.slots[j] = $root.babushkaproto.Slot.toObject(message.slots[j], options);
                }
                return object;
            };
    
            /**
             * Converts this clusterSlotsResp to JSON.
             * @function toJSON
             * @memberof babushkaproto.clusterSlotsResp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            clusterSlotsResp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for clusterSlotsResp
             * @function getTypeUrl
             * @memberof babushkaproto.clusterSlotsResp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            clusterSlotsResp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/babushkaproto.clusterSlotsResp";
            };
    
            return clusterSlotsResp;
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
