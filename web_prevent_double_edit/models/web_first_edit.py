# © 2018 Fekete Mihai
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class WebFirstEdit(models.Model):
    _name = 'web.first.edit'

    @api.model
    def _auto_init(self):
        # Truncate data from table in case there is some.
        res = super(WebFirstEdit, self)._auto_init()
        records = self.search([])
        if records:
            records.unlink()
        return res

    res_model = fields.Char(required=True)
    res_id = fields.Integer(required=True)
    user_id = fields.Many2one('res.users', required=True)
