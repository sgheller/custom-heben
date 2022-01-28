odoo.define('pos_seller.pos', function (require) {
var screens = require('point_of_sale.screens');

//Modifico la pantalla de pago
screens.ProductScreenWidget.include({
	start:function(){
        this._super();
        console.log('start');
    },
    show: function(reset){
        this._super();
        let body_seller = "<div class='div-seller'>" +
        	"<button>" +
        	"<i class='fa fa-id-card icon-seller' role='img' aria-label='Vendedor' title='Vendedor' ></i>" +
        	"Vendedor </button></div>"
        $('.actionpad').before(body_seller);
        console.log('show');
    },
});

});

