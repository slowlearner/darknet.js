"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var darknet_node_1 = require("./build/Release/darknet.node");
var fs_1 = require("fs");
function isIOpenCVFrame(input) {
    return ('channels' in input &&
        'cols' in input &&
        'rows' in input &&
        'getData' in input &&
        typeof input.channels === 'number' &&
        typeof input.cols === 'number' &&
        typeof input.rows === 'number' &&
        typeof input.getData === 'function');
}
function isIBufferImage(input) {
    return ('b' in input &&
        'w' in input &&
        'h' in input &&
        'c' in input &&
        typeof input.c === 'number' &&
        typeof input.w === 'number' &&
        typeof input.h === 'number' &&
        input.b instanceof Buffer);
}
var Darknet = /** @class */ (function () {
    function Darknet(config) {
        if (!config)
            throw new Error("A config file is required");
        if (!config.names && !config.namefile)
            throw new Error("Config must include detection class names");
        if (!config.names && config.namefile)
            config.names = fs_1.readFileSync(config.namefile, 'utf8').split('\n').filter(function (x) { return !!x; });
        if (!config.names)
            throw new Error("No names detected.");
        if (!config.config)
            throw new Error("Config must include location to yolo config file");
        if (!config.weights)
            throw new Error("config must include the path to trained weights");
        this.detector = new darknet_node_1.Detector(config.weights, config.config, config.names.join('\n'), config.batch ? 1 : 0);
    }
    Darknet.prototype.rgbBufferToDarknet = function (buffer, w, h, c) {
        var imageElements = w * h * c;
        var floatBuff = new Float32Array(imageElements);
        var step = w * c;
        var i, k, j;
        for (i = 0; i < h; ++i) {
            for (k = 0; k < c; ++k) {
                for (j = 0; j < w; ++j) {
                    floatBuff[k * w * h + i * w + j] = buffer[i * step + j * c + k] / 255;
                }
            }
        }
        return floatBuff;
    };
    Darknet.prototype.formatIBufferImage = function (image) {
        var b = image.b, w = image.w, h = image.h, c = image.c;
        var floatBuff = this.rgbBufferToDarknet(b, w, h, c);
        return {
            w: w, h: h, c: c,
            buffer: new Uint8Array(floatBuff.buffer, 0, floatBuff.length * Float32Array.BYTES_PER_ELEMENT)
        };
    };
    Darknet.prototype.detect = function (input, config) {
        if (config === void 0) { config = {}; }
        var thresh = (config.thresh !== undefined) ? config.thresh : 0.5;
        var hier = (config.hier_thresh !== undefined) ? config.hier_thresh : 0.5;
        var nms = (config.nms !== undefined) ? config.nms : 0.5;
        var rel = config.relative ? 1 : 0;
        if (typeof input === 'string') {
            return this.detector.detectImagePath(input, thresh, hier, nms, rel);
        }
        else {
            var image = void 0;
            if (isIBufferImage(input)) {
                image = this.formatIBufferImage(input);
            }
            else if (isIOpenCVFrame(input)) {
                var buffer = input.getData();
                if (buffer instanceof Buffer) {
                    image = this.formatIBufferImage({
                        w: input.cols,
                        h: input.rows,
                        c: input.channels,
                        b: buffer
                    });
                }
                else {
                    throw new Error('getData did not return buffer!');
                }
            }
            if (image) {
                var buffer = image.buffer, w = image.w, h = image.h, c = image.c;
                return this.detector.detectImageBuffer(buffer, w, h, c, thresh, hier, nms, rel);
            }
            else {
                throw new Error('Could not get valid image from input!');
            }
        }
    };
    return Darknet;
}());
exports.Darknet = Darknet;
