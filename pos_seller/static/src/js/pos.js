odoo.define('pos_seller.pos', function (require) {
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var PopupWidget = require('point_of_sale.popups');
var models = require('point_of_sale.models');
var core = require('web.core');
var _t = core._t;

models.load_fields('pos.config', ['module_pos_seller', 'seller_ids']);

models.load_models([{
    model:  'hr.employee',
    fields: ['name', 'id', 'user_id'],
    domain: function(self){ return [['company_id', '=', self.config.company_id[0]]]; },
    loaded: function(self, sellers) {
        if (self.config.module_pos_seller) {
        	self.seller = false;
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

screens.ProductScreenWidget.include({
    show: function(reset){
    	var self = this;
        this._super();
        let body_seller = "<div class='div-seller'>" +
        	"<button class='set-seller'>" +
        	"<i class='fa fa-id-card icon-seller' role='img' aria-label='Vendedor' title='Vendedor' ></i>" +
        	"<span class='ml-seller'>Vendedor</span></button></div>"
        if ($("div.div-seller").length == 0){        	
        	$('.actionpad').before(body_seller);
        }
        if (self.pos.seller != false) {
        	$('button.set-seller span').text(self.pos.seller['name']);
        }
        
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
						self.$el.find(".seller-list").append("<li><input type='radio' name='sellers' value='" + seller['id'] + "'><span>"+ seller['name']+ "</span></li>");
					}
				})
				if(self.pos.seller != false){
					var seller_id = self.pos.seller['id'];
					self.$el.find("input[value=" + seller_id + "]").attr('checked','checked');
				}
			}
        }
    	
        self.$el.find('#btn-accept').click(function(){
        	var seller_id = false;
        	$.each($('input[name=sellers]'), function(){
        		if ($(this).is(":checked")){        			
        			seller_id = $(this).val();
        		}
        	})
    		
    		options.sellers.forEach(function (seller){
    			if (seller_id != false) {    				
    				if (seller['id'] == seller_id){
    					self.pos.seller = seller;
    					options.obj.show();
    					self.gui.close_popup();
    				}
    			} else {
    				self.gui.show_popup('confirm',{
    	                'title': _t('Please select the seller'),
    	                'body': _t('You need to select the seller before you can invoice an order.'),
    	                confirm: function(){
    	                    self.gui.show_popup('sellers', {
    	                    	'module_pos_seller': options.module_pos_seller,
    	                    	'sellers': options.sellers,
    	                		'obj': self,
    	                		'auto_close': false
    	                    })
    	                }
    				})
    			}
    		})
    	})
    }
});

gui.define_popup({name:'sellers', widget: SellersPopupWidget});


});

