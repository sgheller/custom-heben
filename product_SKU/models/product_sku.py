from odoo import models, fields, api, _
from odoo.exceptions import Warning

class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    display_type = fields.Selection(selection_add=[('talle','Talle')])


class ProductSKU(models.Model):
    _name = "product.sku"
    _description = "Product SKU"

    name = fields.Char(string="Name", required=True)

    # SKU creation fields
    separator = fields.Selection([("-", "-")], string="Separator")
    season_id = fields.Many2one(
        comodel_name="product.seasons", string="Season", required=True
    )
    product_id = fields.Many2one(
        comodel_name="product.product", string="Product", required=True
    )
    partner_id = fields.Many2one(
        comodel_name="res.partner", string="Provider", required=True
    )
    family_id = fields.Many2one(
        comodel_name="product.family", string="Family", required=True
    )
    material_id = fields.Many2one(
        comodel_name="product.material", string="Material", required=True
    )
    color_id = fields.Many2one(
        comodel_name="product.attribute.value",
        string="Color",
        domain=[("display_type","=", "color")],
    )
    color_view = fields.Char(related="color_id.html_color")
    size_id = fields.Many2one(
        comodel_name="product.attribute.value",
        string="Size",
        domain=[("display_type","=", "talle")],
    )
    
    sku = fields.Char(string="SKU", compute="_compute_SKU")

    def _compute_SKU(self):
        for rec in self:
            separator = rec.separator if rec.separator else ""
            sku = f"{rec.family_id.code}{rec.partner_id.partner_code}{separator}{rec.product_id.internal_code}{rec.season_id.code}{rec.material_id.code}"
            if rec.color_id:
                sku += str(rec.color_id.code)
                if rec.size_id:
                    sku += str(rec.size_id.code)
            rec.sku = sku
