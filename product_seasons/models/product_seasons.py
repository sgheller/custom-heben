from odoo import api, fields, models


class ProductSeasons(models.Model):
    _name = "product.seasons"
    _description = "Product Seasons"
    _order = "name"

    name = fields.Char("Nombre Temporada", Required=True)
    description = fields.Text(translate=True)
    product_ids = fields.One2many(
    "product.template", "product_seasons_id", string="Temporadas"
    )
    products_count = fields.Integer(
        string="Number of products", compute="_compute_products_count"
    )

    @api.depends("product_ids")
    def _compute_products_count(self):
        product_model = self.env["product.template"]
        groups = product_model.read_group(
            [("product_seasons_id", "in", self.ids)],
            ["product_seasons_id"],
            ["product_seasons_id"],
            lazy=False,
        )
        data = {group["product_seasons_id"][0]: group["__count"] for group in groups}
        for seasons in self:
            seasons.products_count = data.get(seasons.id, 0)

    logo = fields.Binary("Logo File")