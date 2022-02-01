odoo.define('pos_product_name.pos', function (require) {
	var screens = require('point_of_sale.screens');
    
	screens.ProductListWidget.include({
		init: function(parent, options){
			var self = this;
	        this._super(parent,options);
	        $.each(self.product_list, function(key,value){
	        	value['display_name'] = "[" + value['default_code'] + "] " + value['display_name'];
	        })
	    }
	})

});

