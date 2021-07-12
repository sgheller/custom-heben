from odoo import models, fields

class ProductTemplate (models.Model):
    _inherit = 'product.template'

    product_seasons_id = fields.Many2one(string="Season", comodel_name='product.seasons', help="Select a season for this product")