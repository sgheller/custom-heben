from odoo import models, fields, api, _
from odoo.exceptions import Warning

class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    display_type = fields.Selection(selection_add=[('talle','Talle')])

class ProductSKU(models.Model):
    _name = "product.sku"
    _description = "Product SKU"

    name = fields.Char(string="Name", required=True)

    code_list = fields.Many2many('code.list')
    sku = fields.Char(string="SKU")

    def write(self, vals):
        res = super(ProductSKU, self).write(vals)
        if 'code_list' in vals:
            sku_name = ''
            for rule in self.code_list:
                sku_name += '[%s]' % rule.rule.name
            self.sku = sku_name
        return res

    @api.model_create_multi
    def create(self, vals):
        res = super(ProductSKU, self).create(vals)
        # import wdb
        # wdb.set_trace()
        sku_name = ''
        for rule in res.code_list:
            sku_name += '[%s]' % rule.rule.name
        res.sku = sku_name

        return res

class CodeList(models.Model):
    _name = "code.list"
    _description = "Code List"

    rule = fields.Many2one('rule.sku', 'Rule Sku')
    sequence = fields.Integer(string='Sequence')

class RuleSku(models.Model):
    _name = "rule.sku"

    name  = fields.Char('Name')
    model = fields.Char('Model')
