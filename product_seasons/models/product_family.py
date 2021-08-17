from odoo import api, fields, models

class ProductFamily(models.Model):
    _name = "product.family"
    _description = "Product Familia"
    _order = "name"

    name = fields.Char("Codigo Material", Required=True)
    code_family= fields.Char("Nombre Familia", Required=True)
    product_ids = fields.One2many(
    "product.template", "product_family_id", string="Familia"
    )
