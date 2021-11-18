from odoo import models, fields, api

class ProductProduct (models.Model):
    _inherit = 'product.product'

    product_sku_id = fields.Many2one('product.sku',string="Internal Reference", help="Select a rule sku for this product")
    use_sku = fields.Boolean('Use Sku')
    # def _compute_SKU(self):
    #     for record in self:
    #         for rec in record.product_sku_id:
    #             dictionary = {}
    #             record.sku = ''
    #             i = 0
    #             for code in rec.code_list:
    #                 if code.name == 'Codigo Familia':
    #                     dictionary[code.sequence]=record.product_family_id.code
    #                 if code.name == 'Codigo Material':
    #                     dictionary[code.sequence]=record.product_material_id.code
    #                 if code.name == 'Codigo Temporada':
    #                     dictionary[code.sequence]= record.product_seasons_id.code
    #                 if code.name == 'Codigo Proveedor':
    #                     dictionary[code.sequence]=record.message_partner_ids.partner_code
    #                 if code.name == 'Modelo':
    #                     dictionary[code.sequence]=record.internal_code
    #                 # if code.name == 'Codigo Variante Color':
    #                 #     dictionary[code.sequence]=record.product_template_attribute_value_ids.code
    #                 # if code.name == 'Codigo Variante Talle':
    #                 #     dictionary[code.sequence]=record.product_template_attribute_value_ids.code
    #                 if code.name == 'Separador':
    #                     dictionary[code.sequence]='-'
    #                 i += 1
    #             if i != 0 :
    #                 lista = list(dictionary)
    #                 lista.sort()
    #                 for key in lista:
    #                     record.sku = record.sku+dictionary.get(key)