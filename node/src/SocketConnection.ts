import { BabushkaInternal } from "../";
import * as net from "net";
import { Logger } from "./Logger";
import { valueFromPointer } from "babushka-rs-internal";
import { pb_message } from "./ProtobufMessage";
import { BufferWriter, Writer } from "protobufjs";

const {
    StartSocketConnection,
    HEADER_LENGTH_IN_BYTES,
    ResponseType,
    RequestType,
} = BabushkaInternal;

type RequestType = BabushkaInternal.RequestType;
type ResponseType = BabushkaInternal.ResponseType;
type PromiseFunction = (value?: any) => void;

type WriteRequest = {
    callbackIndex: number;
    args: string[];
    type: RequestType;
};

export class SocketConnection {
    private socket: net.Socket;
    private readonly promiseCallbackFunctions: [
        PromiseFunction,
        PromiseFunction
    ][] = [];
    private readonly availableCallbackSlots: number[] = [];
    private backingReadBuffer = new ArrayBuffer(1024);
    private backingRequestsWriteBuffer = new BufferWriter();
    private writeInProgress = false;
    private remainingReadData: Uint8Array | undefined;

    private handleReadData(data: Buffer) {
        const dataArray = this.remainingReadData
            ? this.concatBuffers(this.remainingReadData, data)
            : new Uint8Array(data.buffer, data.byteOffset, data.length);
        let counter = 0;
        while (counter <= dataArray.byteLength - HEADER_LENGTH_IN_BYTES) {
            const header = new DataView(dataArray.buffer, counter, HEADER_LENGTH_IN_BYTES);
            const response_length = header.getUint32(0, true);
            if (response_length === 0) {
                throw new Error("received response length 0");
            }
            if (counter + response_length + HEADER_LENGTH_IN_BYTES > dataArray.byteLength) {
                this.remainingReadData = new Uint8Array(
                    dataArray.buffer,
                    counter,
                    dataArray.byteLength - counter
                );
                break;
            }
            var message = pb_message.Response.decode(new Uint8Array(
                dataArray.buffer,
                counter + HEADER_LENGTH_IN_BYTES,
                response_length
            ));
            const [resolve, reject] =
                this.promiseCallbackFunctions[message.callbackIdx];
            this.availableCallbackSlots.push(message.callbackIdx);
            if (message.requestError !== null) {
                reject(message.requestError);
            } else if (message.closingError !== null) {
                reject(message.closingError);
                this.dispose();
            } else if (message.respPointer) {
                // let pointer_view = new DataView(message.respPointer.buffer, message.respPointer.byteOffset, message.respPointer.length);
                // const pointer = pointer_view.getBigUint64(0, true);
                // resolve(valueFromPointer(pointer));
                const pointer = message.respPointer;
                resolve(valueFromPointer(BigInt(pointer.toString())));
            } else {
                resolve(null);
            }
            counter = counter + response_length + HEADER_LENGTH_IN_BYTES;
        }

        if (counter == dataArray.byteLength) {
            this.remainingReadData = undefined;
        } else {
            this.remainingReadData = new Uint8Array(
                dataArray.buffer,
                counter,
                dataArray.byteLength - counter
            );
        }
    }

    private constructor(socket: net.Socket) {
        // if logger has been initialized by the external-user on info level this log will be shown
        Logger.instance.log("info", "connection", `construct socket`);

        this.socket = socket;
        this.socket
            .on("data", (data) => this.handleReadData(data))
            .on("error", (err) => {
                console.error(`Server closed: ${err}`);
                this.dispose();
            });
    }

    private concatBuffers(priorBuffer: Uint8Array, data: Buffer): Uint8Array {
        const requiredLength = priorBuffer.length + data.byteLength;

        if (this.backingReadBuffer.byteLength < requiredLength) {
            this.backingReadBuffer = new ArrayBuffer(requiredLength);
        }
        const array = new Uint8Array(this.backingReadBuffer, 0, requiredLength);
        array.set(priorBuffer);
        array.set(data, priorBuffer.byteLength);
        return array;
    }

    private getCallbackIndex(): number {
        return (
            this.availableCallbackSlots.pop() ??
            this.promiseCallbackFunctions.length + 1
        );
    }


    private writePbBufferedRequestsToSocket() {
        this.writeInProgress = true;
        const requests = this.backingRequestsWriteBuffer.finish();
        this.backingRequestsWriteBuffer.reset();

        this.socket.write(requests, undefined, () => {
            if (this.backingRequestsWriteBuffer.len > 0) {
                this.writePbBufferedRequestsToSocket();
            } else {
                this.writeInProgress = false;
            }
        });
    }

    private writeOrBufferRequest(callbackIdx: number, requestType: number, args: string[]) {
        var message = pb_message.Request.create({
            callbackIdx: callbackIdx,
            requestType: requestType,
            args: args
        });

        pb_message.Request.encodeDelimited(message, this.backingRequestsWriteBuffer);
        if (this.writeInProgress) {
            return;
        }
        this.writePbBufferedRequestsToSocket();
    }

    public get(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.GetString, [key]);
        });
    }

    public set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.SetString, [key, value]);
        });
    }

    private setServerAddress(address: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const callbackIndex = this.getCallbackIndex();
            this.promiseCallbackFunctions[callbackIndex] = [resolve, reject];
            this.writeOrBufferRequest(callbackIndex, RequestType.ServerAddress, [address]);
        });
    }

    public dispose(errorMessage?: string): void {
        this.promiseCallbackFunctions.forEach(([_resolve, reject], _index) => {
            reject(errorMessage);
        });
        this.socket.end();
    }

    static async __CreateConnection(
        address: string,
        connectedSocket: net.Socket
    ): Promise<SocketConnection> {
        const connection = new SocketConnection(connectedSocket);
        await connection.setServerAddress(address);
        return connection;
    }

    private static GetSocket(path: string): Promise<net.Socket> {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket
                .connect(path)
                .once("connect", () => resolve(socket))
                .once("error", reject);
        });
    }

    public static async CreateConnection(
        address: string
    ): Promise<SocketConnection> {
        const path = await StartSocketConnection();
        const socket = await this.GetSocket(path);
        return await this.__CreateConnection(address, socket);
    }
}
