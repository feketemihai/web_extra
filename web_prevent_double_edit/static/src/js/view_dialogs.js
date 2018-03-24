odoo.define("web_prevent_double_edit.FormViewDialog", function (require) {

    var FormViewDialog = require("web.view_dialogs").FormViewDialog;
    var core = require("web.core");
    var NotificationManager = require("web.notification").Notification;
    var session = require("web.session");
    var _t = core._t;
    FormViewDialog.include({
        init: function (parent, options) {
            var self = this;
            var multi_select = !_.isNumber(options.res_id) && !options.disable_multiple_selection;
            var readonly = _.isNumber(options.res_id) && options.readonly;
            options.buttons = []

            options.buttons = [{
                text: (readonly ? _t("Close") : _t("Discard")),
                classes: "btn-default o_form_button_cancel",
                close: true,
                click: function () {
                    this._discard();
                }
            }];

            if (!readonly) {
                options.buttons.unshift({
                    text: _t("Save") + ((multi_select)? " " + _t(" & Close") : ""),
                    classes: "btn-primary",
                    click: function () {
                        this._save().then(self.close.bind(self));
                    }
                });

                if (multi_select) {
                    options.buttons.splice(1, 0, {
                        text: _t("Save & New"),
                        classes: "btn-primary",
                        click: function () {
                            this._save().then(self.form_view.createRecord.bind(self.form_view, self.parentID));
                        },
                    });
                }
            }
            this._super(parent, options);
        },

        open: function () {
            var self = this;
            var mode = self.res_id && self.options.readonly ? "readonly" : "edit"
            if (mode === "edit" && self.res_id && !self.on_saved.res_id) {
                var domain = [["res_model", "=", self.res_model], ["res_id", "=", self.res_id], ["user_id", "!=", session.uid]];
                var fields = ["user_id"];
                var def_user = this._rpc({
                        model: "web.first.edit",
                        method: "search_read",
                        args: [domain, fields],
                    })
                    .then(function (found) {
                        if (!_.isEmpty(found)) {
                                self.do_warn("Concurrent Edit. User " + found[0].user_id[1] + " is already editing the same record.");
                            } else {
                                var def = self._rpc({
                                        model: "web.first.edit",
                                        method: "create",
                                        args: [{"res_model": self.res_model, "res_id": self.res_id, "user_id": session.uid}],
                                    });
                                return this._super();
                            }
                        }
                    );
            }
            return self.close.bind(self);

        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        _save: function () {
            var self = this;
            var res = this._super();
            var domain = [["res_model", "=", self.res_model], ["res_id", "=", self.res_id], ["user_id", "=", session.uid]];
            var fields = ["id"];
            var def_user = this._rpc({
                    model: "web.first.edit",
                    method: "search_read",
                    args: [domain, fields],
                })
                .then(function (found) {
                    if (!_.isEmpty(found)) {
                        self.form_view.model._rpc({
                                model: "web.first.edit",
                                method: "unlink",
                                args: [_.pluck(found, "id")],
                            });
                        }
                    }
                );
            return res;
        },

        _discard: function () {
            var self = this;
            var readonly = _.isNumber(self.options.res_id) && self.options.readonly;
            if (!readonly) {
                self.form_view.model.discardChanges(self.form_view.handle, {
                    rollback: self.shouldSaveLocally,
                });
            }
            var domain = [["res_model", "=", self.res_model], ["res_id", "=", self.res_id], ["user_id", "=", session.uid]];
            var fields = ["id"];
            var def_user = self.form_view.model._rpc({
                    model: "web.first.edit",
                    method: "search_read",
                    args: [domain, fields],
                })
                .then(function (found) {
                    if (!_.isEmpty(found)) {
                        self.form_view.model._rpc({
                                model: "web.first.edit",
                                method: "unlink",
                                args: [_.pluck(found, "id")],
                            });
                        }
                    }
                );
        },
    });

return FormViewDialog;
});

