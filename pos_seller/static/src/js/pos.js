odoo.define('pos_seller.pos', function (require) {
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var PopupWidget = require('point_of_sale.popups');
var models = require('point_of_sale.models');
var rpc = require('web.rpc');

models.load_fields('pos.config', ['module_pos_seller', 'seller_ids']);

models.load_models([{
    model:  'hr.employee',
    fields: ['name', 'id', 'user_id'],
    domain: function(self){ return [['company_id', '=', self.config.company_id[0]]]; },
    loaded: function(self, sellers) {
        if (self.config.module_pos_seller) {
            if (self.config.seller_ids.length > 0) {
                self.sellers = sellers.filter(function(seller) {
                    return self.config.seller_ids.includes(seller.id) || seller.user_id[0] === self.user.id;
                });
            } else {
                self.sellers = seller;
            }
            self.sellers.forEach(function(seller) {
                var hasUser = self.users.some(function(user) {
                    if (user.id === seller.user_id[0]) {
                    	seller.role = user.role;
                        return true;
                    }
                    return false;
                });
                if (!hasUser) {
                	seller.role = 'seller';
                }
            });
        }
    }
}]);

//Modifico la pantalla de pago
screens.ProductScreenWidget.include({
    show: function(reset){
    	var self = this;
        this._super();
        let body_seller = "<div class='div-seller'>" +
        	"<button class='set-seller'>" +
        	"<i class='fa fa-id-card icon-seller' role='img' aria-label='Vendedor' title='Vendedor' ></i>" +
        	"Vendedor </button></div>"
        $('.actionpad').before(body_seller);
        
        this.$('.set-seller').click(function(){
            self.gui.show_popup('sellers', {
            	'module_pos_seller': self.pos.config.module_pos_seller,
            	'sellers': self.pos.sellers,
        		'obj': self,
        		'auto_close': false
        	})
        });
    },
});

var SellersPopupWidget = PopupWidget.extend({
    template: 'SellersPopupWidget',
    show: function (options) {
        var self = this;
        this._super(options);
        
        if (options) {
			if (options.auto_close) {
				setTimeout(function () {self.gui.close_popup();}, 2000);
			} else {
				self.close();
				self.$el.find('.popup').append('<div class="footer"><button class="button accept" id="btn-accept">Continuar</button><button class="button cancel">Cerrar</button></div>');
			}
			if (options.module_pos_seller == true){
				options.sellers.forEach(function (seller){
					if (seller['role'] == 'seller'){
						//self.$el.find("#selectPopupSellers").append('<option value="' + seller['id'] + '">' + seller['name'] + '</option>');
						self.$el.find(".seller-list-contents").append('<tr><td>'+ seller['name']+ '</td></tr>');
					}
				})
			}
        }
    	
        self.$el.find('#btn-accept').click(function(){
        	self.gui.close_popup();   
    	})
    }
});

gui.define_popup({name:'sellers', widget: SellersPopupWidget});


});

