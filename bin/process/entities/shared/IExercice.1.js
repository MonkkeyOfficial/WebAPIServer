"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IExercice = (function () {
    function IExercice() {
    }
    IExercice.copyTo = function (data, obj) {
        obj.docker_framework_id = data.docker_framework_id;
        obj.last_compilation = data.last_compilation;
        obj.creation_date = data.creation_date;
        obj.description = data.description;
        obj.install_log = data.install_log;
        obj.docker_key = data.docker_key;
        obj.last_edit = data.last_edit;
        obj.config = data.config;
        obj.title = data.title;
        obj.id = data.id;
        if (obj.config)
            obj.configuration = JSON.parse(obj.config);
    };
    return IExercice;
}());
exports.IExercice = IExercice;
//# sourceMappingURL=IExercice.1.js.map