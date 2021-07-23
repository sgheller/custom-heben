from odoo import models, fields

class ProductTemplate (models.Model):
    _inherit = 'product.template'

    country_id = fields.Many2one(string="País", comodel_name='res.country')
    maker_id = fields.Many2one('res.partner', 'Fabricante', domain=[('customer_rank','=',0)])