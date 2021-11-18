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
    sku = fields.Char(string="SKU", compute="_compute_SKU")

    def _compute_SKU(self):
        for rec in self:
            dictionary = {}
            rec.sku = ''
            i = 0
            for code in rec.code_list:
                if code.name == 'Codigo Familia':
                    dictionary[code.sequence]=(self.env['product.family'].search([('id','>',0),('code','!=',False)], limit=1).code)
                if code.name == 'Codigo Material':
                    dictionary[code.sequence]=(self.env['product.material'].search([('id','>',0),('code','!=',False)], limit=1).code)
                if code.name == 'Codigo Temporada':
                    dictionary[code.sequence]=(self.env['product.seasons'].search([('id','>',0),('code','!=',False)], limit=1).code)
                if code.name == 'Codigo Proveedor':
                    dictionary[code.sequence]=(self.env['res.partner'].search([('id','>',0),('partner_code','!=',False)], limit=1).partner_code)
                if code.name == 'Modelo':
                    dictionary[code.sequence]=(self.env['product.product'].search([('id','>',0),('internal_code','!=',False)], limit=1).internal_code)
                if code.name == 'Codigo Variante Color':
                    dictionary[code.sequence]=(self.env['product.attribute.value'].search([('id','>',0),('code','!=',False),("display_type","=", "color")], limit=1).code)
                if code.name == 'Codigo Variante Talle':
                    dictionary[code.sequence]=(self.env['product.attribute.value'].search([('id','>',0),('code','!=',False),("display_type","=", "talle")], limit=1).code)
                if code.name == 'Separador':
                    dictionary[code.sequence]='-'
                i += 1
            if i != 0 :
                lista = list(dictionary)
                lista.sort()
                for key in lista:
                    rec.sku = rec.sku+dictionary.get(key)

class CodeList(models.Model):
    _name = "code.list"
    _description = "Code List"

    name = fields.Char('Name')
    sequence = fields.Integer(string='Sequence')
