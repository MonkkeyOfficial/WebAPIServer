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
var Error_1 = require("../../app/Error");
var APIResponse;
(function (APIResponse) {
    var Response = (function () {
        function Response(errorOrData, data) {
            if (data !== undefined) {
                this.error = errorOrData;
                this.data = data;
            }
            else {
                if (errorOrData.constructor === Error_1.default)
                    this.error = errorOrData;
                else
                    this.data = errorOrData;
            }
            this.success = !this.error;
        }
        return Response;
    }());
    APIResponse.Response = Response;
    var APIExoInformation = (function (_super) {
        __extends(APIExoInformation, _super);
        function APIExoInformation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return APIExoInformation;
    }(Response));
    APIResponse.APIExoInformation = APIExoInformation;
    var APIExoExecute = (function (_super) {
        __extends(APIExoExecute, _super);
        function APIExoExecute() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return APIExoExecute;
    }(Response));
    APIResponse.APIExoExecute = APIExoExecute;
    var APIExoCompile = (function (_super) {
        __extends(APIExoCompile, _super);
        function APIExoCompile() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return APIExoCompile;
    }(Response));
    APIResponse.APIExoCompile = APIExoCompile;
    var APIUser = (function (_super) {
        __extends(APIUser, _super);
        function APIUser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return APIUser;
    }(Response));
    APIResponse.APIUser = APIUser;
})(APIResponse = exports.APIResponse || (exports.APIResponse = {}));
exports.default = APIResponse;
//# sourceMappingURL=APIResponse.js.map