var endpoint = new EndpointConfig();
var cookie = new CookieConfig();
var additional = new Additional();

jQuery(document).ready(function() {
    // Validate Token
    if (!cookie.validateLocalToken()) {
        window.location.href = "../login";
    }
    // Load menu left
    $("#menuContent").load("../menuleft.html");
    // Fill user name
    if (cookie.getUsername() === undefined) {
        $('#username-on-header').html("User info");
    } else {
        $('#username-on-header').html(cookie.getUsername());
    }
    $("#header_content").load("../header.html");
    // Init data
    getAndFillOutProduct();
});

function clearErrorLog() {
    $("#errorLog").html("");
}

//------------------------------------------------------------------------------
// Get top selling products
//------------------------------------------------------------------------------
$("#btnGetTopSellingProducts").click(function() {
    $.ajax({
        method: 'GET',
        url: endpoint.getTopSellingProductUrl(),
        contentType: "application/json",
        success: function(data) {
            $('#tbody_product').empty();
            var template = $("#product-content-template").html();
            var contentHtml = Handlebars.compile(template);
            $("#tbody_product").html(contentHtml(data));
            additional.initMoneyInput();
        },
        error: function(error) {
            console.log(error);
        }
    });
})

//------------------------------------------------------------------------------
// Update product quantity and original price
//------------------------------------------------------------------------------
$(".btnUpdate").click(function() {
    var body = document.getElementById("tbody_product");
    var length = body.rows.length;

    for (var i = 0; i < length; i += 1) {
        var row = body.rows[i];

        var id = $(row).data("id");
        var oriQuantity = $(row).data("quantity");
        var oriPrice = $(row).data("price");

        var quantity = row.cells[3].children[0].value.replace(/\,/g, '');
        var price = row.cells[4].children[0].value.replace(/\,/g, '');

        if (oriQuantity != quantity && oriPrice != price) {
            updateProduct(quantity, price, id);
        } else if (oriPrice != price) {
            updateProductPrice(price, id);
        } else if (oriQuantity != quantity) {
            updateProductQuantity(quantity, id);
        }
    }
});

//------------------------------------------------------------------------------
// Search products and fill out products into product template
//------------------------------------------------------------------------------
$('#search').on('keydown', function(e) {
    if (e.which == 13) {
        $('#btnsearch').trigger('click');
    }
});

$("#btnsearch").click(function() {
    clearErrorLog();
    var searchKey = $('input[name=search_key]').val();
    if (searchKey == '' || searchKey == null) {
        return;
    }
    var temp = searchKey.replace(/\ /g, "");
    if (temp == '' || temp == null) {
        return;
    }

    $.ajax({
        method: 'POST',
        url: endpoint.getSearchProductUrl(),
        async: false,
        contentType: "application/json",
        data: JSON.stringify({
            search_key: searchKey
        }),
        success: function(data) {
            console.log(data.data);
            $('#tbody_product').empty();
            var template = $("#product-content-template").html();
            var contentHtml = Handlebars.compile(template);
            $("#tbody_product").html(contentHtml(data));
            $('input[name=search_key]').val("");
            additional.initMoneyInput();
        },
        error: function(error) {
            console.log(error);
        }
    });
});

//-------------------------------------------------------------------------------------
// Update product for new quantity and new price
//-------------------------------------------------------------------------------------
function updateProduct(quantity, price, id) {
    $.ajax({
        method: 'POST',
        url: endpoint.generateUpdateProduct(),
        contentType: "application/json",
        data: JSON.stringify({
            id: id,
            quantity: quantity,
            price: price
        }),
        success: function(data) {
            swal({
                title: "Update Successfully!",
                text: "",
                type: "success",
                confirmButtonText: "OK! Redirect to list",
            }, function() {
                window.location.href = "";
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

//-------------------------------------------------------------------------------------
// Update price
//-------------------------------------------------------------------------------------
function updateProductPrice(price, id) {
    $.ajax({
        method: 'POST',
        url: endpoint.generateUpdateProductPrice(),
        contentType: "application/json",
        data: JSON.stringify({
            id: id,
            price: price
        }),
        success: function(data) {
            swal({
                title: "Update Successfully!",
                text: "",
                type: "success",
                confirmButtonText: "OK! Redirect to list",
            }, function() {
                window.location.href = "";
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

//-------------------------------------------------------------------------------------
// Update quantity
//-------------------------------------------------------------------------------------
function updateProductQuantity(quantity, id) {
    $.ajax({
        method: 'POST',
        url: endpoint.generateUpdateProductQuantity(),
        contentType: "application/json",
        data: JSON.stringify({
            id: id,
            quantity: quantity
        }),
        success: function(data) {
            swal({
                title: "Update Successfully!",
                text: "",
                type: "success",
                confirmButtonText: "OK! Redirect to list",
            }, function() {
                window.location.href = "";
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}
//-------------------------------------------------------------------------------------
// Get and fill out all Product
//-------------------------------------------------------------------------------------
function getAndFillOutProduct() {
    $.ajax({
        method: 'GET',
        url: endpoint.getProductsUrl(),
        contentType: "application/json",
        success: function(data) {
            console.log(data.data);
            var template = $("#product-content-template").html();
            var contentHtml = Handlebars.compile(template);
            $("#tbody_product").html(contentHtml(data));
            additional.initMoneyInput();
        },
        error: function(error) {
            console.log(error);
        }
    });
};

function focusSearchInput() {
    $('input[name=search_key]').focus();
}



















