odoo.define('pos_seller.pos', function (require) {
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var PopupWidget = require('point_of_sale.popups');
var models = require('point_of_sale.models');
var core = require('web.core');
var _t = core._t;

models.load_fields('pos.config', ['module_pos_seller', 'seller_ids']);

models.load_fields('pos.order', ['seller_id']);

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

var _super_Order = models.Order.prototype;
models.Order = models.Order.extend({
	init_from_JSON: function(json) {
        var client;
        if (json.pos_session_id !== this.pos.pos_session.id) {
            this.sequence_number = this.pos.pos_session.sequence_number++;
        } else {
            this.sequence_number = json.sequence_number;
            this.pos.pos_session.sequence_number = Math.max(this.sequence_number+1,this.pos.pos_session.sequence_number);
        }
        this.session_id = this.pos.pos_session.id;
        this.uid = json.uid;
        this.name = _.str.sprintf(_t("Order %s"), this.uid);
        this.validation_date = json.creation_date;
        this.server_id = json.server_id ? json.server_id : false;
        this.user_id = json.user_id;

        if (json.fiscal_position_id) {
            var fiscal_position = _.find(this.pos.fiscal_positions, function (fp) {
                return fp.id === json.fiscal_position_id;
            });

            if (fiscal_position) {
                this.fiscal_position = fiscal_position;
            } else {
                console.error('ERROR: trying to load a fiscal position not available in the pos');
            }
        }

        if (json.pricelist_id) {
            this.pricelist = _.find(this.pos.pricelists, function (pricelist) {
                return pricelist.id === json.pricelist_id;
            });
        } else {
            this.pricelist = this.pos.default_pricelist;
        }

        if (json.partner_id) {
            client = this.pos.db.get_partner_by_id(json.partner_id);
            if (!client) {
                console.error('ERROR: trying to load a partner not available in the pos');
            }
        } else {
            client = null;
        }
        this.set_client(client);

        this.seller_id = false;
        this.pos.seller = false;
        
        this.temporary = false;     // FIXME
        this.to_invoice = false;    // FIXME

        var orderlines = json.lines;
        for (var i = 0; i < orderlines.length; i++) {
            var orderline = orderlines[i][2];
            this.add_orderline(new exports.Orderline({}, {pos: this.pos, order: this, json: orderline}));
        }

        var paymentlines = json.statement_ids;
        for (var i = 0; i < paymentlines.length; i++) {
            var paymentline = paymentlines[i][2];
            var newpaymentline = new exports.Paymentline({},{pos: this.pos, order: this, json: paymentline});
            this.paymentlines.add(newpaymentline);

            if (i === paymentlines.length - 1) {
                this.select_paymentline(newpaymentline);
            }
        }
    },
    export_as_JSON: function() {
        var orderLines, paymentLines;
        orderLines = [];
        this.orderlines.each(_.bind( function(item) {
            return orderLines.push([0, 0, item.export_as_JSON()]);
        }, this));
        paymentLines = [];
        this.paymentlines.each(_.bind( function(item) {
            return paymentLines.push([0, 0, item.export_as_JSON()]);
        }, this));
        var json = {
            name: this.get_name(),
            amount_paid: this.get_total_paid() - this.get_change(),
            amount_total: this.get_total_with_tax(),
            amount_tax: this.get_total_tax(),
            amount_return: this.get_change(),
            lines: orderLines,
            statement_ids: paymentLines,
            pos_session_id: this.pos_session_id,
            pricelist_id: this.pricelist ? this.pricelist.id : false,
            partner_id: this.get_client() ? this.get_client().id : false,
            user_id: this.pos.user.id,
            employee_id: this.pos.get_cashier().id,
            uid: this.uid,
            sequence_number: this.sequence_number,
            creation_date: this.validation_date || this.creation_date, // todo: rename creation_date in master
            fiscal_position_id: this.fiscal_position ? this.fiscal_position.id : false,
            server_id: this.server_id ? this.server_id : false,
            to_invoice: this.to_invoice ? this.to_invoice : false,
            seller_id: this.seller_id,
        };
        if (!this.is_paid && this.user_id) {
            json.user_id = this.user_id;
        }
        return json;
    },
});

screens.ActionpadWidget.include({
	renderElement: function() {
	    var self = this;
	    this._super();
	    this.$('.pay').click(function(){
	        var order = self.pos.get_order();
	        var has_valid_product_lot = _.every(order.orderlines.models, function(line){
	            return line.has_valid_product_lot();
	        });

	        if (self.pos.seller == false){
	        	self.gui.show_popup('confirm',{
	                'title': _t('Empty Seller'),
	                'body':  _t('You need to select the seller before you can invoice an order.'),
	                confirm: function(){
	                	self.gui.show_popup('sellers', {
	                    	'module_pos_seller': self.pos.config.module_pos_seller,
	                    	'sellers': self.pos.sellers,
	                		'obj': self,
	                		'auto_close': false
	                	});
	                },
	            });
	        } else {            	
	        	if(!has_valid_product_lot){
	        		self.gui.show_popup('confirm',{
	        			'title': _t('Empty Serial/Lot Number'),
	        			'body':  _t('One or more product(s) required serial/lot number.'),
	        			confirm: function(){
	        				self.gui.show_screen('payment');
	        			},
	        		});
	        	}else{
	        		self.gui.show_screen('payment');
	        	}
	        }
		});
	    this.$('.set-customer').click(function(){
	        self.gui.show_screen('clientlist');
	    });
	}
});

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
        } else {
        	$('button.set-seller span').text(_t('Seller'));
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
						self.$el.find(".seller-list").append("<li><label><input type='radio' name='sellers' value='" + seller['id'] + "'><span>"+ seller['name']+ "</span></label></li>");
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
    					options.obj.pos.seller = seller;
    					let order = options.obj.pos.get_order();
    					order.seller_id = seller['id'];
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

