jQuery(document).ready(function() {
    Metronic.init(); // init metronic core components
    Layout.init(); // init current layout
    Demo.init(); // init demo features

    function validNull (selector) {
        if ($(selector).length > 0) {
            if ($(selector).prop("tagName").toLowerCase() == "select") {
                return ($(selector).val() > 0) ? true : false;
            } else {
                return ($(selector).val().length > 0) ? true : false;
            }
        } else {
            return false;
        }
    }

    $('#portlet-config').on('hidden.bs.modal', function() {
        $('.portlet-config .modal-title').html('Tạo mới');
        $('input[name=txt_act]').val('skucreate');
        $('input[name=txt_sku]').val('');
        $('input[name=txt_min]').val('');
        $('input[name=txt_max]').val('');
        $('input[name=txt_stp]').val('');
        $('input[name=txt_seq]').val('');
        $('select[name=txt_stt]').val('active');
    });

    $(".btnmodalsubmit").click(function() {
        var txt_sku = $('input[name=txt_sku]').val();
        var txt_min = $('input[name=txt_min]').val();
        var txt_max = $('input[name=txt_max]').val();
        var txt_stp = $('input[name=txt_stp]').val();
        var txt_seq = $('input[name=txt_seq]').val();
        var error = "";
        if(!validNull('input[name=txt_sku]')) {
            error += "Seller SKU không được bỏ trống.\n";
            $('input[name=txt_sku]').addClass('has-error');
        } else {
            $.ajax({
                async:false,
                method:'POST',
                url: '?act=skuvalid&q=' + $('input[name=txt_sku]').val(),
                success: function(data) {
                    if(data === 0) {
                        error += "Seller SKU không hợp lệ.\n";
                        $('input[name=txt_sku]').addClass('has-error');
                    } else {
                        $('input[name=txt_sku]').removeClass('has-error');
                    }
                }
            });
        }
        if(validNull('input[name=txt_min]')) {
            $('input[name=txt_min]').removeClass('has-error');
        } else {
            error += "Mức giá tối thiểu không được bỏ trống.\n";
            $('input[name=txt_min]').addClass('has-error');
        }
        if(validNull('input[name=txt_max]')) {
            $('input[name=txt_max]').removeClass('has-error');
        } else {
            error += "Mức giá tối đa không được bỏ trống.\n";
            $('input[name=txt_max]').addClass('has-error');
        }
        if($('input[name=txt_min]').hasClass('has-error') == false && $('input[name=txt_max]').hasClass('has-error') == false) {
            var min = parseInt($('input[name=txt_min]').val());
            var max = parseInt($('input[name=txt_max]').val());
            if(min < max) {
                $('input[name=txt_min]').removeClass('has-error');
                $('input[name=txt_max]').removeClass('has-error');
            } else {
                error += "Mức giá tối thiểu phải nhỏ hơn mức giá tối đa.\n";
                $('input[name=txt_min]').addClass('has-error');
                $('input[name=txt_max]').addClass('has-error');
            }
        }
        if(validNull('input[name=txt_stp]')) {
            $('input[name=txt_stp]').removeClass('has-error');
        } else {
            error += "Mức giá thấp hơn đối thủ không được bỏ trống.\n";
            $('input[name=txt_stp]').addClass('has-error');
        }
        if(!validNull('input[name=txt_seq]')) {
            error += "Tầng suất kiểm tra giá không được bỏ trống.\n";
            $('input[name=txt_seq]').addClass('has-error');
        } else if($('input[name=txt_seq]').val() < 120) {
            error += "Tầng suất kiểm tra giá phải lớn hơn 120.\n";
            $('input[name=txt_seq]').addClass('has-error');
        } else {
            $('input[name=txt_seq]').removeClass('has-error');
        }

        if(error.length > 0) {
            swal("Không hợp lệ", error, "error");
        } else {
            $.ajax({
                method:'POST',
                url: '',
                data: {
                    id: $('input[name=id]').val(),
                    act: $('input[name=txt_act]').val(),
                    txt_sku:$('input[name=txt_sku]').val(),
                    txt_min:$('input[name=txt_min]').val(),
                    txt_max:$('input[name=txt_max]').val(),
                    txt_stp:$('input[name=txt_stp]').val(),
                    txt_seq:$('input[name=txt_seq]').val(),
                    txt_stt:$('select[name=txt_stt]').val()
                },
                success: function(data) {
                    if(data == 'true') {
                        swal("Success", "", "success");
                    } else {
                        swal("Failure", "", "error");
                    }
                    $('#portlet-config').modal('hide');
                }
            });
        }
    });

    if($('.btntab1submit').length > 0) {
        $('.btntab1submit').click(function() {
            $(this).parents('form').submit();
        });
    }

    if($('.btnnew').length > 0) {
        $(".btnnew").click(function() {
            $('#portlet-config').modal('show');
        });
    }

    if($('.btnedt').length > 0) {
        $(".btnedt").click(function() {
            var id = $(this).parents('tr').data('id');
            $.ajax({
                method: 'GET',
                url: '?act=skugetitm&id=' + id,
                success: function(data) {
                    data = $.parseJSON(data);
                    $('.portlet-config .modal-title').html('Chỉnh sửa ' + data['name']);
                    $('input[name=id]').val(data['id_sku_data']);
                    $('input[name=txt_act]').val('skuupdate');
                    $('input[name=txt_sku]').val(data['seller_sku']);
                    $('input[name=txt_min]').val(data['min_price']);
                    $('input[name=txt_max]').val(data['max_price']);
                    $('input[name=txt_stp]').val(data['delta_value']);
                    $('input[name=txt_seq]').val(data['frequency']);
                    $('input[name=txt_stt]').val(data['status']);
                    $('#portlet-config').modal('show');
                }
            });
        });
    }

    if($('.btndel').length > 0) {
        $('.btndel').click(function() {
            var id = $(this).parents('tr').data('id');
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this SKU!",
                type: "warning",
                showReloadButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function () {
                $.ajax({
                    url: "?act=skudelete&id=" + id,
                    method: "POST",
                    success: function (data) {
                        if (data) {
                            swal({
                                title: "Deleted!",
                                text: "",
                                type: "success",
                                confirmButtonText: "OK! Redirect to list",
                            }, function () {
                                window.location.href = "";
                            });
                        } else {
                            swal("Failure", "Something wrong with server.", "error");
                        }
                    }
                });
            });
        });
    }

    if($('.btnstatus').length > 0) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
        elems.forEach(function(html) {
            var switchery = new Switchery(html);
        });
        $('.btnstatus').change(function() {
            var id = $(this).parents('tr').data('id');
            var _parent = $(this).parents("tr");
            var status = 'deactive';
            if($(this).is(':checked')) {
                status = 'active';
            }
            $.ajax({
                url: "?act=skustatus&id=" + id + "&s=" + status,
                method: "POST",
                success: function (data) {
                    if(data == -1) {
                        swal("Record " + $(_parent).data("id"), "Cập nhật trạng thái thất bại.\n Bạn đã kích hoạt vượt qua số lượng SKU cho phép", "warning");
                    } else if (data) {
                        if(status == 'active')
                            swal("Record " + $(_parent).data("id"), "Trạng thái đã được bật", "success");
                        else
                            swal("Record " + $(_parent).data("id"), "Trạng thái đã được tắt", "success");
                    } else {
                        swal("Record " + $(_parent).data("id"), "Cập nhật trạng thái thất bại", "error");
                    }
                }
            });
        });
    }

    if($('.btnstt').length > 0) {
        $(".btnstt").each(function () {
            if ($(this).data("bit") == 'active') {
                $(this).find(".bit-like").addClass("green");
            } else {
                $(this).find(".bit-nope").addClass("red");
            }
        });

        $(".btnstt .bit-like").click(function () {
            var id = $(this).parents('tr').data('id');
            if (!$(this).hasClass("green")) {
                var _this = $(this);
                var _parent = $(this).parents("tr");
                $.ajax({
                    url: "?act=skustatus&id=" + id + "&s=" + $(this).data("bit"),
                    method: "POST",
                    success: function (data) {
                        if(data == -1) {
                            swal("Record " + $(_parent).data("id"), "Update status failure.\n Bạn đã kích hoạt vượt qua số lượng SKU cho phép", "warning");
                        } else if (data) {
                            $(_this).addClass("green").siblings().removeClass("red").parent().data("bit", $(_this).data("bit"));
                            swal("Record " + $(_parent).data("id"), "Status changed to Active", "success");
                        } else {
                            swal("Record " + $(_parent).data("id"), "Update status failure", "error");
                        }
                    }
                });
            }
        });
        $(".btnstt .bit-nope").click(function () {
            var id = $(this).parents('tr').data('id');
            if (!$(this).hasClass("red")) {
                var _this = $(this);
                var _parent = $(this).parents("tr");
                $.ajax({
                    url: "?act=skustatus&id=" + id + "&s=" + $(this).data("bit"),
                    method: "POST",
                    success: function (data) {
                        if (data) {
                            $(_this).addClass("red").siblings().removeClass("green").parent().data("bit", $(_this).data("bit"));
                            swal("Record " + $(_parent).data("id"), "Status changed to Deactive", "success");
                        } else {
                            swal("Record " + $(_parent).data("id"), "Update status failure", "error");
                        }
                    }
                });
            }
        });
    }

    if($('.sltfiltersku').length > 0) {
        $('.sltfiltersku').change(function() {
            $(this).parents('form').submit();
        });
    }
});



