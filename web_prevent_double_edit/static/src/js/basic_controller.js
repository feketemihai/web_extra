odoo.define("web_prevent_double_edit.BasicController", function (require) {

    var BasicController = require("web.BasicController");
    var core = require("web.core");
    var NotificationManager = require("web.notification").Notification;
    var session = require("web.session");
    var _t = core._t;
    BasicController.include({
        _setMode: function (mode, recordID) {
            var self = this;
            var record = this.model.get(this.handle, {raw: true}).res_id;
            if (mode === "edit") {
                var domain = [["res_model", "=", this.modelName], ["res_id", "=", record], ["user_id", "!=", session.uid]];
                var fields = ["user_id"];
                var def_user = this._rpc({
                        model: "web.first.edit",
                        method: "search_read",
                        args: [domain, fields],
                    })
                    .then(function (found) {
                        if (!_.isEmpty(found)) {
                                self._setMode("readonly", recordID)
                                    .then( function () {
                                            self.do_warn("Concurrent Edit. User " + found[0].user_id[1] + " is already editing the same record.");
                                        });
                            } else {
                                var def = self._rpc({
                                        model: "web.first.edit",
                                        method: "create",
                                        args: [{"res_model": self.modelName, "res_id": record, "user_id": session.uid}],
                                    });
                            }
                        }
                    );
            }
            if (mode === "readonly") {
                var domain = [["res_model", "=", this.modelName], ["res_id", "=", record], ["user_id", "=", session.uid]];
                var fields = ["id"];
                var def_user = this._rpc({
                        model: "web.first.edit",
                        method: "search_read",
                        args: [domain, fields],
                    })
                    .then(function (found) {
                        if (!_.isEmpty(found)) {
                                self._rpc({
                                        model: "web.first.edit",
                                        method: "unlink",
                                        args: [_.pluck(found, "id")],
                                    });
                            }
                        }
                    );
                }
            return this._super(mode, recordID);
        },
    });
return BasicController;
});
