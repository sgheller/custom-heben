# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    'name': 'Purchase Request Matrix',
    'summary': """
        Can create purchase request based on employee's equipment""",
    'author': 'Calyx Servicios S.A., Odoo Community Association (OCA)',
    'maintainers': ['paradisorcristian'],
    'website': 'http://odoo.calyx-cloud.com.ar/',
    'license': 'AGPL-3',
    'category': 'Purchase Request',
    'version': '13.0.1.1.0',
    'development_status': 'Production/Stable',
    'application': False,
    'installable': True,
    'external_dependencies': {
        'python': [],
        'bin': [],
    },
    'depends': ['purchase_requisition', 'purchase_stock'],
    'data': [
        'views/assets.xml',
    ],
}
