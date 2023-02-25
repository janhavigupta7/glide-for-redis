import { BabushkaInternal } from "../";
import * as net from "net";
import { Logger } from "./Logger";
import { valueFromPointer } from "babushka-rs-internal";
import { pb_message } from "./ProtobufMessage";
import { BufferWriter, Buffer, Reader } from "protobufjs";

const {
    StartSocketConnection,
    RequestType,
} = BabushkaInternal;

type RequestType = BabushkaInternal.RequestType;
type PromiseFunction = (value?: any) => void;

export class SocketConnection {
    private socket: net.Socket;
    private readonly promiseCallbackFunctions: [
        PromiseFunction,
        PromiseFunction
    ][] = [];
    private readonly availableCallbackSlots: number[] = [];
    private backingRequestsWriteBuffer = new BufferWriter();
    private writeInProgress = false;
    private remainingReadData: Uint8Array | undefined;

    private handleReadData(data: Buffer) {
        const buf = this.remainingReadData ? Buffer.concat([this.remainingReadData, data]) : data;

        let lastPos = 0;
        const reader = Reader.create(buf);
        try {
          while (reader.pos < reader.len) {
            lastPos = reader.pos;
            const message = pb_message.Response.decodeDelimited(reader);
            const [resolve, reject] =
                this.promiseCallbackFunctions[message.callbackIdx];
            this.availableCallbackSlots.push(message.callbackIdx);
            if (message.requestError !== null) {
                reject(message.requestError);
            } else if (message.closingError !== null) {
                this.dispose(message.closingError);
            } else if (message.respPointer) {
                const pointer = message.respPointer;
                resolve(valueFromPointer(BigInt(pointer.toString())));
            } else {
                resolve(null);
            }
          }
          this.remainingReadData = undefined;
        } catch (err) {
          this.remainingReadData = buf.slice(lastPos);
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
