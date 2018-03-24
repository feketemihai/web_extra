# © 2018 Fekete Mihai
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Web Prevent Double Edit',
    'summary': 'Web Prevent Double Edit',
    'version': '11.0.1.0.0',
    'author': 'Fekete Mihai',
    'category': 'Base',
    'depends': ['web'],
    'data': ['views/concurrent_edit.xml',
             'security/ir.model.access.csv'],
    'instalable': True,
}
