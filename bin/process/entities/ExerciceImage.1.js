"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ImageCompilable_1 = require("./ImageCompilable");
var Error_1 = require("../app/Error");
var ExerciceImage = (function (_super) {
    __extends(ExerciceImage, _super);
    function ExerciceImage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExerciceImage.fromDB = function (data) {
        var obj = data;
        if (obj.config)
            obj.configuration = JSON.parse(obj.config);
    };
    ExerciceImage.prototype.compile = function (options, callback) {
        var _this = this;
        ImageCompilable_1.ImageCompilable.compile(options, function (e, r) {
            if (r) {
                _this.configuration = r.configuration;
                _this.install_log = r.log;
                _this.docker_key = r.dockerKey;
                _this.config = JSON.stringify(r.configuration);
            }
            callback(e, r);
        });
    };
    ExerciceImage.prototype.execute = function (callback) {
        ImageCompilable_1.Image.execute({
            dockerKey: this.docker_key,
            timeout: 5,
            stdin: ''
        }, function (e, stdout) {
            if (e) {
                callback(e, null);
                return;
            }
            var result;
            try {
                result = JSON.parse(stdout);
            }
            catch (ex) {
                callback(new Error_1.default(ex, 'system.imageRuntime', "The result of the image execution is not a valid JSON string.", stdout));
                return;
            }
            result.success = result.success !== undefined ? result.success : true;
            callback(e, result);
        });
    };
    return ExerciceImage;
}(ImageCompilable_1.ImageCompilable));
exports.ExerciceImage = ExerciceImage;
//# sourceMappingURL=ExerciceImage.1.js.map