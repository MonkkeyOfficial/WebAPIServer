"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = (function () {
    function User() {
    }
    User.fromDB = function (data) {
        var obj = new User();
        obj.last_edit_date = data.last_edit_date;
        obj.password_hash = data.password_hash;
        obj.creation_date = data.creation_date;
        obj.email = data.email;
        obj.name = data.name;
        obj.id = data.id;
        return obj;
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=User.js.map