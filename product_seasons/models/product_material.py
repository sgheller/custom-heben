from odoo import api, fields, models

class ProductMaterial(models.Model):
    _name = "product.material"
    _description = "Product Material"
    _order = "name"

    name = fields.Char("Codigo Material", Required=True)
    code_material= fields.Char("Nombre Material", Required=True)
    product_ids = fields.One2many(
    "product.template", "product_material_id", string="Material"
    )
    products_count = fields.Integer(
        string="Numero de productos", compute="_compute_products_count_material"
    )

    @api.depends("product_ids")
    def _compute_products_count_material(self):
        product_model = self.env["product.template"]
        groups = product_model.read_group(
            [("product_material_id", "in", self.ids)],
            ["product_material_id"],
            ["product_material_id"],
            lazy=False,
        )
        data = {group["product_material_id"][0]: group["__count"] for group in groups}
        for material in self:
            material.products_count = data.get(material.id, 0)
