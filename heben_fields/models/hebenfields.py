from odoo import models, fields

class ProductTemplate (models.Model):
    _inherit = 'product.template'

    country_id = fields.Many2one(string="Country", comodel_name='res.country')
    # season_id = fields.Many2one(string="Season", comodel_name='product.coleccion')
    maker_id = fields.Many2one('res.partner', 'Marker', domain=[('customer_rank','=',0)])