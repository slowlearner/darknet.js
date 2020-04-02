/// <reference types="node" />
export interface IBufferImage {
    b: Buffer;
    w: number;
    h: number;
    c: number;
}
export interface IOpenCVFrame {
    channels: number;
    cols: number;
    rows: number;
    getData: () => Buffer;
}
export interface IDarknetConfig {
    weights: string;
    config: string;
    names?: string[];
    namefile?: string;
    processes?: number;
    batch?: boolean;
}
export interface IConfig {
    thresh?: number;
    hier_thresh?: number;
    nms?: number;
    relative?: boolean;
}
export interface Detection {
    name: string;
    prob: number;
    box: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}
export declare class Darknet {
    private detector;
    constructor(config: IDarknetConfig);
    private rgbBufferToDarknet;
    private formatIBufferImage;
    detect(input: string | IBufferImage | IOpenCVFrame, config?: IConfig): Detection[];
}
