import * as tf from '@tensorflow/tfjs';

let model

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var LEGACY_VERSION = -1;
var SUPPORTED_VERSIONS = [LEGACY_VERSION, 1]; // use -1 for legacy Lobe exports without the version property
var ImageClassificationModel = /** @class */ (function () {
    function ImageClassificationModel(signaturePath, modelPath) {
        this.height = 224;
        this.width = 224;
        this.outputName = '';
        this.inputKey = "Image";
        this.outputKey = "Confidences";
        this.labelKey = "Label";
        this.labels = [];
        /* Construct our model from the path to Lobe's exported signature.json and model.json files */
        this.signaturePath = signaturePath;
        this.modelPath = modelPath;
    }
    ImageClassificationModel.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signatureFile, _a, versionMessage, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, fetch(this.signaturePath)];
                    case 1:
                        signatureFile = _d.sent();
                        _a = this;
                        return [4 /*yield*/, signatureFile.json()];
                    case 2:
                        _a.signature = _d.sent();
                        _c = this.signature.inputs[this.inputKey].shape.slice(1, 3), this.width = _c[0], this.height = _c[1];
                        this.outputName = this.signature.outputs[this.outputKey].name;
                        this.labels = this.signature.classes[this.labelKey];
                        this.version = this.signature.export_model_version || LEGACY_VERSION;
                        if (!this.version || !SUPPORTED_VERSIONS.includes(this.version)) {
                            versionMessage = "The model version " + this.version + " you are using for this starter project may not be compatible with the supported versions " + SUPPORTED_VERSIONS + ". Please update both this starter project and Lobe to latest versions, and try exporting your model again. If the issue persists, please contact us at lobesupport@microsoft.com";
                            console.error(versionMessage);
                            throw new Error(versionMessage);
                        }
                        _b = this;
                        return [4 /*yield*/, tf.loadGraphModel(this.modelPath)];
                    case 3:
                        _b.model = _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageClassificationModel.prototype.dispose = function () {
        /* Free up the memory used by the TensorFlow.js GraphModel */
        if (this.model) {
            this.model.dispose();
            this.model = undefined;
        }
    };
    ImageClassificationModel.prototype.predict = function (imageData) {
        return __awaiter(this, void 0, void 0, function () {
            var confidencesTensor, confidencesArray_1;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.model) return [3 /*break*/, 3];
                        confidencesTensor = tf.tidy(function () {
                            var _a;
                            // create a tensor from the canvas image data
                            var image = tf.browser.fromPixels(imageData);
                            var _b = image.shape.slice(0, 2), imgHeight = _b[0], imgWidth = _b[1];
                            // convert image to 0-1
                            var normalizedImage = tf.div(image, tf.scalar(255));
                            // make into a batch of 1 so it is shaped [1, height, width, 3]
                            var batchImage = tf.expandDims(normalizedImage);
                            // center crop and resize
                            /*
                            Instead of center cropping, you can use any number of methods for making the image square and the right shape.
                            You can resize (squeeze or expand height/width to fit), pad with 0's so that the whole image is square and has black bars,
                            or pad with different pixel values like mirroring. We recommend using the same resize function here that was used during
                            training or the creation of your dataset. Lobe by default with center crop to the square.
                             */
                            var top = 0;
                            var left = 0;
                            var bottom = 1;
                            var right = 1;
                            if (imgHeight !== imgWidth) {
                                // the crops are normalized 0-1 percentage of the image dimension
                                var size = Math.min(imgHeight, imgWidth);
                                left = (imgWidth - size) / 2 / imgWidth;
                                top = (imgHeight - size) / 2 / imgHeight;
                                right = (imgWidth + size) / 2 / imgWidth;
                                bottom = (imgHeight + size) / 2 / imgHeight;
                            }
                            // center crop our image and resize it to the size found in signature.json
                            var croppedImage = tf.image.cropAndResize(batchImage, [[top, left, bottom, right]], [0], [_this.height, _this.width]);
                            // run the model on our image and await the results as an array
                            if (_this.model) {
                                return _this.model.execute((_a = {}, _a[_this.signature.inputs[_this.inputKey].name] = croppedImage, _a), _this.outputName);
                            }
                        });
                        if (!confidencesTensor) return [3 /*break*/, 2];
                        return [4 /*yield*/, confidencesTensor.data()];
                    case 1:
                        confidencesArray_1 = _b.sent();
                        // now that we have the array values, we can dispose the tensor and free memory
                        confidencesTensor.dispose();
                        // return a map of [label]: confidence computed by the model
                        // the list of labels maps in the same index order as the outputs from the results
                        return [2 /*return*/, (_a = {},
                                _a[this.outputKey] = this.labels.reduce(function (returnConfidences, label, idx) {
                                    var _a;
                                    return __assign((_a = {}, _a[label] = confidencesArray_1[idx], _a), returnConfidences);
                                }, {}),
                                _a)];
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        console.error("Model not loaded, please await this.load() first.");
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ImageClassificationModel;
}());

const load = async (signaturePath, modelPath) => {
	dispose()
	model = new ImageClassificationModel(signaturePath, modelPath)
	await model.load()
}

const dispose = () => {
	if (model)
		model.dispose()
}

const predict = async data => {
	if (model)
		return await model.predict(data)
}

onmessage = data => {
	data = data.data
	switch (data[0]) {
		case "load": {
			load(data[1], data[2]).then(postMessage)
			break
		}
		case "dispose": {
			dispose()
			break
		}
		case "predict": {
			predict(data[1]).then(postMessage)
			break
		}
	}
}
