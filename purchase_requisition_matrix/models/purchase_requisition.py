from odoo import fields, models, _

class PurchaseRequisitionLine(models.Model):
    _inherit = "purchase.requisition.line"

    product_template_id = fields.Many2one('product.template', string='Product Template', related="product_id.product_tmpl_id", domain=[('purchase_ok', '=', True)])