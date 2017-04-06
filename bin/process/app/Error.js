"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Error = (function () {
    function Error(exception, type, message, details) {
        this.message = message;
        this.details = details;
        this.type = type;
    }
    return Error;
}());
exports.default = Error;
//# sourceMappingURL=Error.js.map