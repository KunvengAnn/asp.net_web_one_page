
$(document).ready(function () {
    $('#cmdLogin').removeClass("not-show");
    var isLoggedIn = false;


    // Function to show the "Please login" message
    function showPleaseLogin() {
        var dialogShowLogin = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: 'Please Login',
            content: 'Login để có thể dùng các chức năng',
            buttons: {
                OK: {
                    text: 'OK',
                    btnClass: 'btn-blue',
                    action: function () {    
                    }
                },
                cancel: {
                    text: 'cancel',
                    btnClass: 'btn-default',
                    action: function () {
                        
                    }
                }
            }
        });
        //setTimeout(function () {
        //    dialogShowLogin.close();
        //}, 3000);
    }

    //get all Nv for camboBox Nhanvien
    function getNV() {
        $.post("api.aspx",
            {
                action: "get_allNV"
            },
            function (data) {
                var json = JSON.parse(data); //to json obj
                if (json) {
                    var selectNhanVien = document.getElementById("idNhanVienID");
                    // Clear existing options
                    selectNhanVien.innerHTML = '';

                    // Create and add the default option
                    var defaultOption = document.createElement("option");
                    defaultOption.value = ''; // Set an empty value for the default option
                    defaultOption.text = 'Please select'; // Set the text for the default option
                    selectNhanVien.appendChild(defaultOption);

                    // Add a focus event listener to hide the default option when the dropdown is clicked
                    selectNhanVien.addEventListener("focus", function () {
                        this.querySelector("option[value='']").style.display = "none";
                    });

                    // Add a blur event listener to show the default option when the dropdown is not focused
                    selectNhanVien.addEventListener("blur", function () {
                        if (this.value === "") {
                            this.querySelector("option[value='']").style.display = "block";
                        }
                    });

                    // Loop through the data and add options to the select element
                    for (var i = 0; i < json.length; i++) {
                        var option = document.createElement("option");
                        option.value = json[i].NhanVienID;
                        option.text = json[i].TenNV;
                        selectNhanVien.appendChild(option);
                    }

                } else {
                    // thông báo lỗi
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: "Loi Load NV roi",
                        autoClose: 'OK|5000', //5000milisecond
                        escapeKey: 'OK',
                    });
                }
            });
    }

    //dach sach hoa don nhap
    function GetDsHDNhap() {
        $.post("api.aspx", {
            action: "ds_HDNhap"
        }, function (data) {
            var json = JSON.parse(data);
            if (json.reply.ok) {
                var s = "<div class='table-responsive'><table id='id-Ds-HDNhap' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>MaNCC</th>` +
                    `<th>TenSPNCC</th>` +
                    `<th>DVT</th>` +
                    `<th>Soluong</th>` +
                    `<th>GiaNhap</th>` +
                    `<th>NgayNhap</th>` +
                    `<th>TongTien</th>` +
                    `<th>Action</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                for (var item of json.LHDNhap) {
                    stt++;
                    s += "<tr align=center>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + item.MaNCC + "</td>";
                    s += "<td>" + item.TenSPNCC + "</td>";
                    s += "<td>" + item.DVT + "</td>";
                    s += "<td>" + item.Soluong + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.GiaNhap.toFixed(2) + "$" + `</span></td>`;
                    dateNhap = formatDateToYYYYMMDD(new Date(item.NgayNhap));
                    s += "<td>" + dateNhap + "</td>";
                    s += "<td>" + item.TongTien.toFixed(2) + "$" + "</td>";
                    var action = '<button class="btn btn-sm btn-primary btn-action-SanPham" data-action="update_HDNhap" data-idhdnhap="' + item.idNCC + '" data-mancc="' + item.MaNCC + '"  data-tenspncc="' + item.TenSPNCC + '" data-dvthdnhap="' + item.DVT + '" data-gianhap="' + item.GiaNhap + '" data-soluonghdnhap="' + item.Soluong + '" data-ngaynhap="' + item.NgayNhap + '" title="Update hoadonnhap"><i class="fa-solid fa-pen"></i></button>';
                    action += ' <button class="btn btn-sm btn-danger btn-action-SanPham" data-action="delete_HDNhap" data-idhdnhap="' + item.idNCC + '" data-mancc="' + item.MaNCC + '" title="Delete hoadonnhap"><i class="fa-solid fa-trash"></i></button>';
                    s += '<td>' + action + '</td>';
                    s += "</tr>";
                }
                s += '</tbody></table></div>';
                $('#id-Ds-HDNhap').html(s);

                // Handle row actions (update, delete) using event delegation.
                $('#id-Ds-HDNhap').on('click', 'button[data-action="update_HDNhap"]', function (e) {
                    e.stopPropagation();
                    var idHDNhap = $(this).data('idhdnhap');
                    var MaNCC = $(this).data('mancc');
                    var TenSpNhap = $(this).data('tenspncc');
                    var DvtNhap = $(this).data('dvthdnhap');
                    var GiaNhap = $(this).data('gianhap');
                    var SoluongNhap = $(this).data('soluonghdnhap');
                    var NgayNhap = $(this).data('ngaynhap');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true
                    update_HDNhap(idHDNhap, MaNCC, TenSpNhap, DvtNhap, GiaNhap, SoluongNhap, NgayNhap);
                });

                $('#id-Ds-HDNhap').on('click', 'button[data-action="delete_HDNhap"]', function (e) {
                    e.stopPropagation();
                    var idHDNhap = $(this).data('idhdnhap');
                    var MaNCC = $(this).data('mancc');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true
                    Delete_HDNHap(idHDNhap, MaNCC);
                });

            } else {
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    //update HdNhap
    function update_HDNhap(idHDNhap, MaNCC, TenSpNhap, DvtNhap, GiaNhap, SoluongNhap, NgayNhap)
    {
        var dialog_updateHDNhap = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Update HoaDon Nhap 👉 ${MaNCC}`,
            content: '<form class="needs-validate" novalidate>' +
                'TenSP:' +
                '<input type="text" id="id-tensp-nhap" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap Ten san Pham Nhap!!</div>' +

                'DVT:' +
                '<input type="text" id="id-dvt-nhap" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DVT!!</div>' +

                'GiaNhap:' +
                `<input type="number" id="id-gianhap-nhap" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap GiaNhap!!</div>' +
                'SoLuong:' +
                `<input type="number" id="id-soluonghd-nhap" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap Soluong!!</div>' +
                'NgayNhap:' +
                `<input type="date" id="id-ngayNhap-nhap" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap Soluong!!</div>' +
                '</form>' +
                `<hr>` ,
            buttons: {
                add: {
                    text: 'Update HDNhap',
                    btnClass: 'btn-info',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "edit_HDNhap",
                                idHDNhap: idHDNhap, //id need to updae
                                tenspNhap: $('#id-tensp-nhap').val() ,
                                dvt: $('#id-dvt-nhap').val(),
                                giaNhap: $('#id-gianhap-nhap').val(),
                                soluong: $('#id-soluonghd-nhap').val(),
                                ngayNhap: $('#id-ngayNhap-nhap').val(),
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsHDNhap();
                                    dialog_updateHDNhap.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_updateHDNhap.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {
                dateNhap = formatDateToYYYYMMDD(new Date(NgayNhap));
                document.getElementById("id-ngayNhap-nhap").value = dateNhap;
                document.getElementById("id-gianhap-nhap").value = GiaNhap;
                document.getElementById("id-dvt-nhap").value = DvtNhap;
                document.getElementById("id-soluonghd-nhap").value = SoluongNhap;
                document.getElementById("id-tensp-nhap").value = TenSpNhap;
            }
        });
    }

    //delete HDNhap
    function Delete_HDNHap(idHDNhap, MaNCC) {
        var dialog_DeleteHDNhap = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Delete HoaDon Nhap`,
            content: `Bạn có Chắn xóa Mã này 👉 ${MaNCC} ko? `,
            buttons: {
                add: {
                    text: 'Delete HDNhap',
                    btnClass: 'btn-dark',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "delet_HDNhap",
                                idHDNhap: idHDNhap, //id need to delte
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsHDNhap();
                                    dialog_DeleteHDNhap.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_DeleteHDNhap.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {
                console.log(idHDNhap);
            }
        });
    }
    //add hoa don nhap
    function addHDNhapNCC(MaNCC) {
        GetDsHDNhap();
        var dialog_HDNhapNCC = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'l',
            title: `Add Hoa Don Nhap`,
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'MaNCC:' +
                '<input type="text" id="id-mahd-ncc" class="form-control" readonly />' +
                '<div class="invalid-feedback">Hay Nhap MANCC!!</div>' +
                'TenSP:' +
                '<input type="text" id="id-tensp-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap Ten san Pham Nhap!!</div>' +

                'DVT:' +
                '<input type="text" id="id-dvt-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DVT!!</div>' +

                'GiaNhap:' +
                `<input type="number" id="id-gianhap-ncc" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap GiaNhap!!</div>' +
                'SoLuong:' +
                `<input type="number" id="id-soluonghd-ncc" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap Soluong!!</div>' +
                '</form>' +
                `<hr>` +
                `<div id="id-Ds-HDNhap"></div>`,

            buttons: {
                add: {
                    text: 'Add HDNhap',
                    btnClass: 'btn-warning',
                    action: function () {
                        //this for validate form
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation failss
                        } else {
                            var sendData = {
                                action: "them_HDNhap",
                                mancc: $('#id-mahd-ncc').val(),
                                TenSP: $('#id-tensp-ncc').val(),
                                DVT: $('#id-dvt-ncc').val(),
                                GiaNhap: $('#id-gianhap-ncc').val(),
                                SoLuong: $('#id-soluonghd-ncc').val(),
                            }
                            $.post("api.aspx",
                                sendData,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.ok) {
                                        //success
                                        $('#idsuccess').removeClass('d-none');
                                        setTimeout(function () {
                                            $('#idsuccess').addClass('d-none');
                                        }, 1000); //1000milisecond = 1s
                                        GetDsHDNhap();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //error
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                        });
                                    }
                                });
                            return false; //not close 
                        }
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_HDNhapNCC.close();
                    }
                },
            },
            onContentReady: function () {
                document.getElementById('id-mahd-ncc').value = MaNCC;
                document.getElementById("id-dvt-ncc").value = "Cai";
            }
        });
    }

    //add Nha cung cap
    function addNCC() {
        var dialog_AddNCC = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: `Add Nha Cung Cap`,
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'MaNCC:' +
                '<input type="text" id="id-ma-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap MANCC!!</div>' +
                'TenNCC:' +
                '<input type="text" id="id-ten-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap TenNCC!!</div>' + 

                'DiaChi:' +
                '<input type="text" id="id-diachi-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DiaChi!!</div>' + 

                'SDT NCC:' +
                `<input type="number" id="id-sdt-ncc" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap SDT NCC!!</div>' +
                '</form>' +
                `<hr>`,

            buttons: {
                add: {
                    text: 'Add NCC',
                    btnClass: 'btn-warning',
                    action: function () {
                        //this for validate form
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation failss
                        } else {
                            var sendData = {
                                action: "themNCC",
                                mancc: $('#id-ma-ncc').val(),
                                tenncc: $('#id-ten-ncc').val(),
                                diachi: $('#id-diachi-ncc').val(),
                                Sdt: $('#id-sdt-ncc').val(),
                            }
                            $.post("api.aspx",
                                sendData,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.ok) {
                                        ////success
                                        //$('#idsuccess').removeClass('d-none');
                                        //setTimeout(function () {
                                        //    $('#idsuccess').addClass('d-none');
                                        //}, 1000); //1000milisecond = 1s
                                        var MaNCC = $('#id-ma-ncc').val();
                                        addHDNhapNCC(MaNCC);
                                        GetDsNhaCungCap();
                                        dialog_AddNCC.close();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //error
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                        });
                                    }
                                });
                            return false; //not close 
                        }
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_AddNCC.close();
                    }
                },
            },
            onContentReady: function () {
                
            }
        });
    }
    //show ds NCC
    function dialogNCC() {
        GetDsNhaCungCap();
        var dialog_ShowDsNhaCC = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'l',
            title: `<i class="fa-brands fa-skyatlas"></i> Danh Sach Nha cung cap`,
            content: '<div id="idDsNhaCC"></div>', 
            buttons: {
                add: {
                    text: 'add',
                    btnClass: 'btn-warning',
                    action: function () {
                        addNCC();
                        return false;
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                },
            },
            onContentReady: function () {
                
            }

        });
    }

    function GetDsNhaCungCap() {
        $.post("api.aspx", {
            action: "ds_NCC"
        }, function (data) {
            var json = JSON.parse(data);
            if (json.reply.ok) {
                //console.log(json.reply.ok);
                //console.log(json.LNCC);
                var s = "<div class='table-responsive'><table id='idDsNhaCC' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>MaNCC</th>` +
                    `<th>TenNCC</th>` +
                    `<th>DiaChi</th>` +
                    `<th>SoDienThoai</th>` +
                    `<th>Sửa/Xóa</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                for (var item of json.LNCC) {
                    stt++;
                    s += "<tr align=center data-mncc='"+item.MaNCC+"'>";
                    s += "<td>" + stt + "</td>";
                    s += `<td>` + item.MaNCC + `</td>`;
                    s += "<td>" + item.TenNCC + "</td>";
                    s += "<td>" + item.DiaChi + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.Sdt + `</span></td>`;
                    var action = '<button class="btn btn-sm btn-primary btn-action-HDB" data-action="update_NCC" data-mancc="' + item.MaNCC + '" data-tenncc="' + item.TenNCC + '" data-diachincc="' + item.DiaChi + '" data-sdtncc="' + item.Sdt + '" title="Update HoadonBan"><i class="fa-solid fa-pen"></i></button>';
                    action += ' <button class="btn btn-sm btn-danger btn-action-HDB" data-action="delete_NCC" data-mancc="' + item.MaNCC + '" data-tenncc="' + item.TenNCC + '" title="Delete HoadonBan"><i class="fa-solid fa-trash"></i></button>';
                    s += '<td>' + action + '</td>';
                    s += "</tr>";
                }

                s += '</tbody></table></div>';
                $('#idDsNhaCC').html(s);

                // Attach the click tbody tr
                $('#idDsNhaCC').on('click', 'tbody tr', function () {
                    var MaNCC = $(this).data('mncc');
                    //console.log(MaNCC);

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true;
                    showDetailsNCCC(MaNCC);
                });

                // Handle row actions (update, delete) using event delegation.
                $('#idDsNhaCC').on('click', 'button[data-action="update_NCC"]', function (e) {
                    e.stopPropagation();
                    var MaNCC = $(this).data('mancc');
                    var TenNCC = $(this).data('tenncc');
                    var DiaChiNCC = $(this).data('diachincc');
                    var SdtNCC = $(this).data('sdtncc');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true;
                    update_NCC(MaNCC, TenNCC, DiaChiNCC, SdtNCC);
                });

                $('#idDsNhaCC').on('click', 'button[data-action="delete_NCC"]', function (e) {
                    e.stopPropagation();
                    var MaNCC = $(this).data('mancc');
                    var TenNCC = $(this).data('tenncc');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true;
                    Delete_NCC(MaNCC, TenNCC);
                });
            } else {
                //dialog_ShowDsNhaCC.close(); // Close the dialog
                // Show error message
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    //show detail Nha Cung Cap
    function showDetailsNCCC(MaNCC) {
        $.post("api.aspx", {
            action:"showDetailNCC",
            manccct: MaNCC,
        }, function (data) {
            var json = JSON.parse(data);
            if (json.reply.ok) {
                
                var s = "<div class='table-responsive'><table id='idDsDetailNCC' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>TenSPNCC</th>` +
                    `<th>DVT</th>` +
                    `<th>Soluong</th>` +
                    `<th>GiaNhap</th>` +
                    `<th>NgayNhap</th>` +
                    `<th>ThanhTien</th>` +
                    //`<th>Action</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                var TotalTongTien = 0;
                for (var item of json.LNCCCT) {
                    stt++;
                    TotalTongTien += item.TongTien;
                    s += "<tr align=center>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + item.TenSPNCC + "</td>";
                    s += "<td>" + item.DVT + "</td>";
                    s += "<td>" + item.Soluong + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.GiaNhap.toFixed(2) + "$" + `</span></td>`;
                    dateNhap = formatDateToYYYYMMDD(new Date(item.NgayNhap));
                    s += "<td>" + dateNhap + "</td>";
                    s += "<td>" + item.TongTien.toFixed(2) + "$" + "</td>";
                    //var action = '<button class="btn btn-sm btn-primary btn-action-SanPham" data-action="update_HDNhap" data-idhdnhap="' + item.idNCC + '" data-mancc="' + item.MaNCC + '"  data-tenspncc="' + item.TenSPNCC + '" data-dvthdnhap="' + item.DVT + '" data-gianhap="' + item.GiaNhap + '" data-soluonghdnhap="' + item.Soluong + '" data-ngaynhap="' + item.NgayNhap + '" title="Update hoadonnhap"><i class="fa-solid fa-pen"></i></button>';
                    //action += ' <button class="btn btn-sm btn-danger btn-action-SanPham" data-action="delete_HDNhap" data-idhdnhap="' + item.idNCC + '" data-mancc="' + item.MaNCC + '" title="Delete hoadonnhap"><i class="fa-solid fa-trash"></i></button>';
                    //s += '<td>' + action + '</td>';
                    s += "</tr>";
                }
           /*     console.log(TotalTongTien);*/
                s += '<tr class="table-warning fw-bold"><td align=center>' + (++stt) + '<td align=center></td><td align=center></td><td align=center></td><td align=center></td> </td><td align=center>Tổng Tiền:</td><td align=center><span class="badge rounded-pill bg-warning">' + TotalTongTien.toFixed(2) + "$" + '</span></td></tr>';
                s += '</tbody></table></div>';
              
                DialogSD = $.confirm({
                    type: 'blue',
                    typeAnimated: true,
                    draggable: true,
                    columnClass: 'l',
                    title: `Show Detail Nha Cung Cap => ${MaNCC}`,
                    content: s,
                    buttons: {
                        close: {
                            text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                            btnClass: 'btn-blue',
                            action: function () {
                                DialogSD.close();
                                isDialogOpen = false;
                            }
                        }
                    },
                    onContentReady: function () {
                        sort_table("#idDsDetailNCC", "CHỉ TIết Hóa Đơn Nhâp NCC", 10, `${MaNCC}`);
                        isDialogOpen = true;
                    }
                });
            } else {
                isDialogOpen = false; //close on each row
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }


    //update Nha Cung cup 
    function update_NCC(MaNCC, TenNCC, DiaChiNCC, SdtNCC) {
        var dialog_updateNCC = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Update San Pham`,
            content: '<form class="needs-validate" novalidate>' +                
                'TenNCC:' +
                '<input type="text" id="id-ten-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap TenNCC!!</div>' +

                'DiaChi:' +
                '<input type="text" id="id-diachi-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DiaChi!!</div>' +

                'SDT NCC:' +
                `<input type="number" id="id-sdt-ncc" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap SDT NCC!!</div>' +
                '</form>' +
                `<hr>`,
            buttons: {
                add: {
                    text: 'Update Nha cung cap',
                    btnClass: 'btn-dark',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "edit_NCC",
                                mancc: MaNCC, //mã need to update
                                tenncc: $('#id-ten-ncc').val(),
                                diachi: $('#id-diachi-ncc').val(),
                                Sdt: $('#id-sdt-ncc').val(),  
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsNhaCungCap();
                                    dialog_updateNCC.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_updateNCC.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {
                document.getElementById("id-ten-ncc").value = TenNCC;
                document.getElementById("id-diachi-ncc").value = DiaChiNCC ;
                document.getElementById("id-sdt-ncc").value = SdtNCC;

            }
        });
    }

    //delete nha cung cap
    function Delete_NCC(MaNCC, TenNCC) {
        var dialog_DeleteNCC = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: `Delete NCC`,
            content: `Bạn có Chắc Chắn xóa Không 👉 ${MaNCC} và tên nay ${TenNCC}?`,
            buttons: {
                add: {
                    text: 'Delete',
                    btnClass: 'btn-info',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "delete_NCC",
                                mancc: MaNCC, //mã need to delete
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsNhaCungCap();
                                    dialog_DeleteNCC.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_DeleteNCC.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {

            }
        });
    }

    function dialogSanPham() {
        GetDsSanPham();
        var dialog_ShowSP = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: `<i class="fa-brands fa-itch-io"></i> Danh Sach San Pham`,
            content: '<div id="id-Ds-SanPham"></div>',
            buttons: {
                add: {
                    text: 'Add San Pham',
                    btnClass: 'btn-warning',
                    action: function () {
                        ///add san pham
                        AddSP();
                        return false;
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                },
            },
            onContentReady: function () {

            }
        });
    }
    //SanPham
    function GetDsSanPham() {
        $.post("api.aspx", {
            action: "dsSanpham"
        }, function (data) {
            var json = JSON.parse(data);
            //console.log(json);
            if (json.reply.ok) {
               // console.log(json.reply.ok);
               var s = "<div class='table-responsive'><table id='id-Ds-SanPham' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>`+
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>TenSanPham</th>` +
                    `<th>DonViTinh</th>` +
                    `<th>GiaBan</th>` +
                    `<th>Action</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                for (var item of json.LSP) {
                    stt++;
                    s += "<tr align=center>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + item.TenSP + "</td>";
                    s += "<td>" + item.DVT + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.GiaBan.toFixed(2) + "$" + `</span></td>`;

                    var action = '<button class="btn btn-sm btn-primary btn-action-SanPham" data-action="update_SP" data-idsp="' + item.idSP + '" data-tensp="' + item.TenSP + '"  data-dvt="' + item.DVT + '" data-giaban="' + item.GiaBan + '" title="Update SanPham"><i class="fa-solid fa-pen"></i></button>';
                    action += ' <button class="btn btn-sm btn-danger btn-action-SanPham" data-action="delete_SP" data-idsp="' + item.idSP + '" data-tensp="' + item.TenSP + '" title="Delete SanPham"><i class="fa-solid fa-trash"></i></button>';
                    s += '<td>' + action + '</td>';
                    s += "</tr>";
                }
                s += '</tbody></table></div>';
                $('#id-Ds-SanPham').html(s);

                // Handle row actions (update, delete) using event delegation.
                $('#id-Ds-SanPham').on('click', 'button[data-action="update_SP"]', function (e) {
                    e.stopPropagation(); 
                    var idsP = $(this).data('idsp');
                    var TenSP = $(this).data('tensp');
                    var GiaBan = $(this).data('giaban');
                    var DonViTinh = $(this).data('dvt');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true
                    update_SP(idsP, TenSP, GiaBan, DonViTinh);
                });

                $('#id-Ds-SanPham').on('click', 'button[data-action="delete_SP"]', function (e) {
                    e.stopPropagation(); 
                    var idsP = $(this).data('idsp');
                    var TenSP = $(this).data('tensp');

                    if (isDialogOpen) {
                        return;
                    }
                    isDialogOpen = true
                    Delete_SP(idsP, TenSP);
                });

            } else {
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    //edit SanPham
    function update_SP(idsP, TenSP, GiaBan, DonViTinh) {
        var dialog_updateSP = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Update San Pham`,
            content: '<form class="needs-validate" novalidate>' +
                'TenSanPham:' +
                '<input type="text" id="id-ten-sp" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap TenSanPham!!</div>' +
                'Don Vi Tinh:' +
                '<input type="text" id="id-dvt-sp" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DVT!!</div>' +

                'Gia Ban:' +
                `<input type="number" id="id-GiaBan-sp" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '</form>' +
                `<hr>`,
            buttons: {
                add: {
                    text: 'Update SP',
                    btnClass: 'btn-info',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "edit_SanPham",  
                                idsp: idsP, //id need to updae
                                tensp: $('#id-ten-sp').val(),
                                dvtsp: $('#id-dvt-sp').val(),
                                giaBan: $('#id-GiaBan-sp').val(),
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsSanPham();
                                    dialog_updateSP.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_updateSP.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {
                document.getElementById("id-ten-sp").value = TenSP;
                document.getElementById("id-dvt-sp").value = DonViTinh;
                document.getElementById("id-GiaBan-sp").value = GiaBan;

            }
        });
    }

    //delete SanPham
    function Delete_SP(idsP, TenSP) {
        var dialog_DeleteSP = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: ``,
            content: `Bạn có Chắc Chắn xóa San Pham này Không 👉 ${TenSP}?`,
            buttons: {
                add: {
                    text: 'Delete SP',
                    btnClass: 'btn-info',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "delete_SanPham",
                                idsp: idsP, 
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsSanPham();
                                    dialog_DeleteSP.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_DeleteSP.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {

            }
        });
    }

    //dailog Show danh Sach NhanVien
    function dialogNhanVien() {
        GetDsNhanVien();
        var dialog_ShowNhanVien = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'l',
            title: `<i class="fa-brands fa-phoenix-squadron"></i> Danh Sach Nhan Vien`,
            content: `<div id="idDsNhanVien"></div>`, 
            buttons: {
                add: {
                    text: 'Add NV',
                    btnClass: 'btn-warning',
                    action: function () {
                        AddNV();
                        return false;
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                },
            },
            onContentReady: function () {

            }

        });
    }

    //ADD NV
    function AddNV() {
        var dialog_AddNV = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: `Add NhanVien`,
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'TenNV:' +
                '<input type="text" id="id-ten-nv" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap TenNV!!</div>' +
                'Password:' +
                '<input type="password" id="id-pass-nv" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap Password!!</div>' + // Error message

                'GioiTinh:' +
                '<select class="form-control" id="id-GT-nv" required>' +
                '<option value="0">Male</option>' +
                '<option value="1">Female</option>' +
                '</select>' +

                'Luong NV:' +
                `<input type="number" id="id-Luong-nv" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap Luong NV!!</div>' +
                '</form>' +
                `<hr>`,

            buttons: {
                add: {
                    text: 'Add NV',
                    btnClass: 'btn-warning',
                    action: function () {
                        //this for validate form
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation failss
                        } else {
                            var e = document.getElementById('id-GT-nv');
                            var value = e.value; //get value = 0,12........ selector
                            var sendData = {
                                action: "them_NV",
                                tennv: $('#id-ten-nv').val() ,
                                password: $('#id-pass-nv').val(),
                                gioiTinh: value,
                                luong: $('#id-Luong-nv').val() ,
                            }
                            $.post("api.aspx",
                                sendData,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.ok) {
                                        //success
                                        $('#idsuccess').removeClass('d-none');
                                        setTimeout(function () {
                                            $('#idsuccess').addClass('d-none');
                                        }, 1000); //1000milisecond = 1s
                                        $('#idDsNhanVien').html(''); 
                                        GetDsNhanVien();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //error
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                        });
                                    }
                                });
                            return false; //not close dialog
                        }
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                },
            },
            onContentReady: function () {
                document.getElementById("id-ten-nv").value = "";
            }
        });
    }

    //ADD sanPham
    function AddSP() {
        var dialog_AddSP = $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Add SanPham`,
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'TenSanPham:' +
                '<input type="text" id="id-ten-sp" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap TenSanPham!!</div>' +
                'Don Vi Tinh:' +
                '<input type="text" id="id-dvt-sp" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DVT!!</div>' + 

                'Gia Ban:' +
                `<input type="number" id="id-GiaBan-sp" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '</form>' +
                `<hr>`,

            buttons: {
                add: {
                    text: 'Add SanPham',
                    btnClass: 'btn-secondary',
                    action: function () {
                        //check input 
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false;
                        } else {
                            $.post("api.aspx",
                                {
                                    action: "themSanPham",
                                    tensanPham: $('#id-ten-sp').val(),
                                    donviTinh: $('#id-dvt-sp').val(),
                                    giaBan: $('#id-GiaBan-sp').val()
                                }, function (data) {
                                    var json = JSON.parse(data);
                                    if (json.ok) {
                                        $('#idsuccess').removeClass('d-none');
                                        setTimeout(function () {
                                            $('#idsuccess').addClass('d-none');
                                        }, 1000); //1000miliSecond
                                        GetDsSanPham();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //error
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                        });
                                    }
                                });
                        }
                        return false;
                    },
                },
                cancle: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_AddSP.close();
                    }
                },
            },
             onContentReady: function () {
                 document.getElementById('id-dvt-sp').value = 'Coc';
            }
        });
    }

    //ADD Nha Cung cap
    function AddNCC() {
        var dialog_AddNCC = $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: `Add NCC`,
            //MaNCC,TenNCC,DiaChi,Sdt)
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'MaNCC:' +
                '<input type="text" id="id-ma-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap Ma nha cc!!</div>' +
                'TenNCC:' +
                '<input type="text" id="id-ten-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap nha cc!!</div>' +
                'DiaChi:' +
                '<input type="text" id="id-diachi-ncc" class="form-control" required />' +
                '<div class="invalid-feedback">Hay Nhap DiaChi NCC!!</div>' + // Error message

                'SoDienThoai:' +
                `<input type="number" id="id-sdt-ncc" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                '<div class="invalid-feedback">Hay Nhap SDT NCC!!</div>' + // Error message
                '</form>' +
                `<hr>`,

            buttons: {
                add: {
                    text: 'Add SanPham',
                    btnClass: 'btn-warning',
                    action: function () {
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation failss
                        } else {

                        }
                    },
                    ok: {
                        text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                        btnClass: 'btn-blue',
                    },
                },
                onContentReady: function () {

                }
            }
        });
    }

    var isDialogOpen = false; 
    //Delele Nhan Vien
    function Delete_NV(idTenNV, TenNV) {
     var dialog_DeleteNV =   $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 'm',
            title: ``,
            content: `Bạn có Chắc Chắn xóa Nhân Viên này Không 👉 ${TenNV}?`,
            buttons: {
                add: {
                    text: 'Delete NV',
                    btnClass: 'btn-info',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: "delete_NV",
                                idnv: idTenNV
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsNhanVien();
                                    dialog_DeleteNV.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_DeleteNV.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {

            }
        });
    }

    //laod selector gioiTinh
    function loadGIOITinhSelector(selectedIDGioiTinh) {
        var gioiTinhSelector = document.getElementById("id-GT-nv");
        // Clear existing options
        gioiTinhSelector.innerHTML = '';

        // Define the options
        var options = [
            { value: 0, text: 'Male' },
            { value: 1, text: 'Female' }
        ];

        // Loop through the options and add them to the selector
        options.forEach(function (option) {
            var optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.text = option.text;

            // If the value matches the selected value, set it as selected
            if (option.value == selectedIDGioiTinh) {
                optionElement.selected = true;
            }

            gioiTinhSelector.appendChild(optionElement);
        });
    }

    //update NhanVien
    function update_NV(idTenNV, TenNV, pass, GT, NgayLamViec, Luong) {
        var dialog_updateNV = $.confirm({
            closeIcon: false,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Update Nhan Vien`,
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>' +
                'TenNV:' +
                '<input type="text" id="id-ten-nv" class="form-control" required />' +
                'Password:' +
                '<input type="password" id="id-pass-nv" class="form-control" required />' +

                'GioiTinh:' +
                '<select class="form-control" id="id-GT-nv" required>' +
                '<option value="0">Male</option>' +
                '<option value="1">Female</option>' +
                '</select>' +

                'Luong NV:' +
                `<input type="number" id="id-Luong-nv" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                'Ngày Bắt đầu làm việc:' +
                `<input type="date" id="id-date-nv" class="form-control" required />` +
                '</form>' +
                `<hr>`,
            buttons: {
                add: {
                    text: 'Update NV',
                    btnClass: 'btn-info',
                    action: function () {
                        var e = document.getElementById('id-GT-nv');
                        var value = e.value; 
                        $.post("api.aspx",
                            {
                                action: "edit_NV", //update 
                                idnv: idTenNV, //id need to updae
                                tennv: $('#id-ten-nv').val(),
                                password: $('#id-pass-nv').val(),
                                gioiTinh: value,
                                ngaylamviec: $('#id-date-nv').val(),
                                luong: $('#id-Luong-nv').val()
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsNhanVien();
                                    dialog_updateNV.close();
                                    isDialogOpen = false; // Set isDialogOpen to false close

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    //error
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                    }
                },
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                    action: function () {
                        dialog_updateNV.close();
                        isDialogOpen = false; //close
                    }
                },
            },
            onContentReady: function () {
                document.getElementById("id-ten-nv").value = TenNV;
                document.getElementById("id-pass-nv").value = pass; 
                document.getElementById("id-Luong-nv").value = Luong; 
                dateLamViec = formatDateToYYYYMMDD(new Date(NgayLamViec));
                document.getElementById("id-date-nv").value = dateLamViec; 
                loadGIOITinhSelector(GT);
            }
        });
    }

    //Get Danh sach NhanVine
    function GetDsNhanVien() {
        $.post("api.aspx", {
            action: "ds_NV"
        }, function (data) {
            var json = JSON.parse(data);
            if (json.reply.ok) {
                console.log(json.reply.ok);
                var s = "<div class='table-responsive'><table id='idDsNhanVien' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>TenNhanVien</th>` +
                    `<th>Password</th>` +
                    `<th>Gioitinh</th>` +
                    `<th>NgayLamViec</th>` +
                    `<th>Luong</th>` +
                    `<th>Sửa/Xóa</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                var GioiTinh = '';
                for (var item of json.LNV) {
                    stt++;
                    s += "<tr align=center>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + item.TenNV + "</td>";
                    s += "<td>" + item.pass + "</td>";
                    if (item.Gt == 0) {
                        GioiTinh = "Male";
                    } else {
                        GioiTinh = "Female";
                    }
                    s += "<td>" + GioiTinh + "</td>";
/*                    s += "<td>" + item.Luong + "</td>";*/
                    var date = new Date(item.ngayLamViec);
                    var dateString = date.toLocaleDateString();  // Format: MM/DD/YYYY
                    s += "<td>" + dateString + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.Luong.toFixed(2) + "$" + `</span></td>`;
                    //s += '<td><button class="btn btn-primary btn-sm btn-action-user"><i class="fa-solid fa-pen"></i></button> <button class="btn btn-danger btn-sm btn-action-user"><i class="fa-solid fa-trash"></i></button></td>';
                    var action = '<button class="btn btn-sm btn-warning btn-action-HDB" data-action="update_NV" data-tennv="' + item.TenNV + '" data-idtennv="' + item.NhanVienID + '" data-pass="' + item.pass + '" data-gt="' + item.Gt + '" data-luong="' + item.Luong + '" data-ngaylamviec="' + item.ngayLamViec + '" title="Update HoadonBan"><i class="fa-solid fa-key"></i></button>';
                    action += ' <button class="btn btn-sm btn-danger btn-action-HDB" data-action="delete_NV" data-tennv="' + item.TenNV + '" data-idtennv="' + item.NhanVienID + '" title="Delete HoadonBan"><i class="fa-solid fa-trash-can"></i></button>';
                    s += '<td>' + action + '</td>';
                    s += "</tr>";
                }

                s += '</tbody></table></div>';
                $('#idDsNhanVien').html(s); 

                // Handle row actions (update, delete) using event delegation.
                $('#idDsNhanVien').on('click', 'button[data-action="update_NV"]', function (e) {
                    e.stopPropagation(); // Prevent further propagation
                    var idTenNV = $(this).data('idtennv');
                    var TenNV = $(this).data('tennv');
                    var pass = $(this).data('pass');
                    var GT = $(this).data('gt');
                    var NgayLamViec = $(this).data('ngaylamviec');
                    var Luong = $(this).data('luong'); 
                    if (isDialogOpen) {
                        return;
                    }

                    //console.log(idTenNV);
                    isDialogOpen = true;
                    update_NV(idTenNV,TenNV,pass,GT,NgayLamViec,Luong);
                });

                $('#idDsNhanVien').on('click', 'button[data-action="delete_NV"]', function (e) {
                    e.stopPropagation(); // Prevent further propagation
                    // Check if a dialog is already open
                    if (isDialogOpen) {
                        return;
                    }

                    var idTenNV = $(this).data('idtennv');
                    var TenNV = $(this).data('tennv');
                    //console.log(idTenNV);

                    // Open the dialog and set isDialogOpen to true
                    isDialogOpen = true;
                    Delete_NV(idTenNV, TenNV);
                });
            } else {
                // Show error message
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    var idtopnv = '';
    var tenTopnv = '';
    var SoluongNVBanDc = '';
    //Nhan vien number 1
    function NVTop() {
        $.post("api.aspx",
            {
                action: "Top_NVBanNhieuNhat"
            }, function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {   
                    for (var item of json.LN) {
                        idtopnv = item.NhanVienID;
                        tenTopnv = item.TenNV;
                        SoluongNVBanDc = item.Gt;
                    }

                } else {
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
    }
    NVTop();

    var tensanPham = '';
    var soluongBandc = '';
    //SanPham Top 1
    function SanPhamTop() {
        $.post("api.aspx",
            {
                action: "Top_SanPham",
            },
            function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    for (var item of json.LS) {
                        tensanPham = item.TenSP;
                        soluongBandc = item.idSP;
                    }
                } else {
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
    }
    SanPhamTop();

    var ngayBandcNhat = '';
    var soluongHDDc = '';
    //NgayBan duoc nhieu nhat
    function NgayBanDcNhieuNhat() {
        $.post("api.aspx",
            {
                action: "Top_NgayBanNhieuNhat",
            },
            function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    for (var item of json.LD) {
                        date = formatDateToYYYYMMDD(new Date(item.ngayBan));
                        ngayBandcNhat = date;
                        soluongHDDc = item.NhanVienID;
                    }
                } else {
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
    }
    NgayBanDcNhieuNhat();

    //ds Thong KE 
    function GetDsThongKe() {
        $.post("api.aspx",
            {
                action: "ds_report"
            },
            function (data) {
            var json = JSON.parse(data);
                if (json.reply.ok) {

                    var s = `<div class="row"><div class="col-5"><span style="font-weight: bold;">Nhân Viên Bán giỏi Nhất :</span> <span class="badge rounded-pill bg-info text-white" id="id-fontsize"> ${tenTopnv} </span></div> <div class="col-4"> <span style="font-weight: bold;">Số Lượng Bán Được : </span> <span class="badge rounded-pill bg-dark text-white"> ${SoluongNVBanDc} Hóa dơn </span></div></div>`;
                    s += `<div class="row"><div class="col-5"><span style="font-weight: bold;">Sản Phẩm Bán chạy Nhất :</span> <span class="badge rounded-pill bg-info text-white" id="id-fontsize"> ${tensanPham}</span></div> <div class="col-4"> <span style="font-weight: bold;">Số lương bán được:</span> <span class="badge rounded-pill bg-dark text-white"> ${soluongBandc} Sản Phẩm </span> </div></div>`;
                    s += `<div class="row"><div class="col-5"><span style="font-weight: bold;">Ngày Bán Đươc nhiều Nhất :</span> <span class="badge rounded-pill bg-info text-white" id="id-fontsize"> ${ngayBandcNhat}</span> </div><div class="col-5"> <span style="font-weight: bold;">Số lượng hóa đơn bán dược: </span> <span class="badge rounded-pill bg-dark text-white"> ${soluongHDDc} Hóa dơn </span> </div></div>`;

                s += "<div class='table-responsive'><table id='idthongke' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>Ngày Bàn</th>` +
                    `<th>Tổng Tiền Tất cả Trong Ngày này</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                for (var item of json.LRP)
                {
                    stt++;
                    s += "<tr align=center data-ngayban='"+item.ngayBan+"'>";
                    s += "<td>" + stt + "</td>";

                    dateDD = formatDateToYYYYMMDD(new Date(item.ngayBan));
                    s += `<td><span class="badge rounded-pill bg-secondary text-white">` + dateDD + "</span></td>";
                    s += `<td><span class="badge rounded-pill bg-warning text-white">` + item.TongTien.toFixed(2) + "$" + `</span></td>`;
                    s += "</tr>";
                }
                s += "</tbody></table></div>";
                $('#idthongke').html(s);


                $('#idthongke').on('click', 'tbody tr', function () {
                    var NgayBan = $(this).data('ngayban');
                    dateFM = formatDateToYYYYMMDD(new Date(NgayBan));

                    ShowDSDetailHDThongKe(dateFM);
                });
            } else {
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    function ShowDSDetailHDThongKe(dateFM) {
        $.post("api.aspx", {
            action: "ds_report_HD",
            dateHDThongke: dateFM,
        }, function (data) {
            var json = JSON.parse(data);
            if (json.reply.ok) {
                var s = "<div class='table-responsive'><table id='id-DsHDDetail-Thongke' class='table table-hover'>";
                s += `<thead>` +
                    `<td></td>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th>STT</th>` +
                    `<th>MaHoaDon</th>` +
                    `<th>TongTien</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                var totalTienHDThongke = 0;
                for (var item of json.LHR)
                {
                    totalTienHDThongke += item.TongTien;
                    stt++;
                    s += "<tr align=center data-mahd='" + item.MaHDBan + "'>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + item.MaHDBan + "</td>";
                    s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.TongTien.toFixed(2) + "$" + `</span></td>`;

                    s += "</tr>";
                }
                s += '<tr class="table-warning fw-bold summary-row"><td align=center>' + (++stt) + '</td><td align=center>Tổng:</td><td align=center><span class="badge rounded-pill bg-primary">' + totalTienHDThongke.toFixed(2) + "$" + '</span></td></tr>';

                s += '</tbody></table></div>';

                // Create a container element and set its HTML content
                var container = $('<div id="id-DsHDDetail-Thongke"></div>');
                container.html(s);

                container.on('click', 'tbody tr:not(.summary-row)', function () {
                    var MaHDThongKe = $(this).data('mahd');

                    showDetailThongKeHD_MaHD(MaHDThongKe);
                });


                $.confirm({
                    type: 'blue',
                    typeAnimated: true,
                    draggable: true,
                    columnClass: 'm',
                    title: `Chỉ Tiết Tất cả Hóa Đơn Ngày 👉 : ${dateFM}`,
                    content: container, // Use the container element
                    buttons: {
                        close: {
                            text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                            btnClass: 'btn-blue',
                            action: function () {
                            }
                        }
                    },
                    onContentReady: function () {
                        // ...
                    }
                });

            } else {
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
            }
        });
    }

    //showDetail 
    function showDetailThongKeHD_MaHD(MaHDThongKe) {
        $.post("api.aspx",
            {
                action: "ds_report_HD_detail",
                mahdtk: MaHDThongKe,
            },
            function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    console.log(json.reply.ok);
                    var s = '';
                    s += `<div class="table-responsive"><table id="id-show-thongkeHDCT" class="table table-hover">`;
                    s += `<thead>`;
                    s += `<tr align=center class="table-info fw-bold">`;
                    s += `<th>STT</th>`;
                    s += `<th>TenSanPham</th>`;
                    s += `<th>Soluong</th>`;
                    s += `<th>GiaBan</th>`;
                    s += `<th>ThanhTien</th>`;
                    s += `</tr>`;
                    s += `</thead>`;
                    s += `<tbody>`;

                    var stt = 0;
                    var total = 0;
                    for (var item of json.LCT)
                    {
                        total += item.ThanhTien;
                        stt++;
                        s += `<tr align=center>`;
                        s += `<td>` + stt + `</td>`;
                        s += `<td>` + item.TenSP + `</td>`;
                        s += `<td>` + item.SoLuong + `</td>`;
                        s += `<td>` + item.GiaBan.toFixed(2) + "$" + `</td>`;
                        s += `<td><span class="badge rounded-pill bg-primary text-white">` + item.ThanhTien.toFixed(2) + "$" + `</span></td>`;
                        s += `</tr>`;
                    }
                    s += '<tr class="table-warning fw-bold"><td align=center>' + (++stt) + '</td><td align=center></td><td align=center></td><td align=center>Tổng:</td><td align=center><span class="badge rounded-pill bg-primary">' + total.toFixed(2) + "$" + '</span></td></tr>';
                    s += `</tboby></table></div>`;

                    var container = $('<div id="id-show-thongkeHDCT"></div>');
                    container.html(s);

                    $.confirm({
                        closeIcon: true,
                        type: 'yellow',
                        typeAnimated: true,
                        draggable: true,
                        columnClass: 'l',
                        title: `CHỉ Tiết Hóa Đơn => ${MaHDThongKe}`,
                        content: container,
                        button: {
                            close: {
                                text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                                btnClass: 'btn-warning',
                                action: function () { },
                            }
                        },
                        onContentReady: function () { },
                    });
                } else {
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
       
    }

    //show Thong ke
    function dialogThongKe() {
        GetDsThongKe();
        var dialog_ShowThongKe = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 'l',
            title: `<i class="fa-solid fa-file-invoice-dollar"></i> Danh Sách Thống kê`,
            content: `<div id="idthongke"></div>`,
            buttons: {
                //add: {
                //    text: 'ok',
                //    btnClass: 'btn-warning',
                //    action: function () {
                //        ///add san pham
                //    }
                //},
                ok: {
                    text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                    btnClass: 'btn-blue',
                },
            },
            onContentReady: function () {
                
            }

        });
    } 
    
    //dialog show content anyThing
    function ShowPermission(text, title) {
        $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: title,
            content: text,
            buttons: {
                OK: {
                    text: 'OK',
                    btnClass: 'btn-blue',
                    action: function () {
                       
                    }
                },
                Close: {
                    text: 'Close',
                    btnClass: 'btn-default',
                    action: function () {
                        
                    }
                }
            }
        });
    }




    //get all TenSanpham
    function getSanPham() {
        $.post("api.aspx",
            {
                action: "get_all_SanPham"
            },
            function (data) {
                var json = JSON.parse(data); //json string to json obj
                if (json.reply.ok) {
                    var selectidSanPham = document.getElementById("idTenSanPham"); //for dailog hoaDonBan ChiTiet
                    // Clear existing options
                    if (selectidSanPham) {
                        // Clear existing options
                        selectidSanPham.innerHTML = '';
                    } else {
                        console.log("Element with ID 'idTenSanPham' not found.");
                    }
                    // Loop through the data and add options to the select element
                    for (var i = 0; i < json.LSP.length; i++) {
                        //console.log(json.LSP.length);
                        var option = document.createElement("option");
                        option.value = json.LSP[i].idSP; //idsanPhan
                        option.text = json.LSP[i].TenSP;  //this TenSanPham
                        selectidSanPham.appendChild(option);//add a child element to a parent element
                    }
                } else {
                    // thông báo lỗi
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
    }

   
    // for the "HoaDonBanChiTiet" dialog
    function AddHoaDonBanChiTietDialog(maHDBan) {
        GetDsHDCT();
        $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 'l', // Use a m column class
            title: 'Thêm Hóa Đơn Chi Tiết',
            content: '<form class="needs-validate" novalidate>' +
                '<div id="idsuccess" class="d-none alert alert-secondary">Thêm Thành Công🎉👏</div>'+
                'MaHDBan:' +
                '<input type="text" id="idMaHDBan" class="form-control" value="' + maHDBan + '" readonly />' +

                'TenSanPham:' +
                '<select class="form-control" id="idTenSanPham" required>' +
                '<option value="1">SanPham 1</option>' +
                '<option value="2">SanPham 2</option>' +
                '<option value="3">SanPham 3</option>' +
                '</select>' +

                'Số lượng:' +
                `<input type="number" id="idSoLuong" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                /*'<div class="invalid-feedback d-none">Số lượng phải lớn hơn 0.</div>' + // Error message*/
                'Giảm Giá Tính%:' +
                `<input type="number" id="idgaimGia" class="form-control" required min="0" value="0" oninput="validity.valid||(value='');" />` +
                //'<div class="invalid-feedback d-none">Giảm giá phải lớn hơn 0.</div>' + // Error message
                '</form>' +
                `<hr>`+
                `<div id="ds-hdCT">Loading...</div>`,
            buttons: {
                formSubmit: {
                    text: 'Add chiTiet',
                    btnClass: 'btn-blue',
                    action: function () {
                        //this for validate form
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation failss
                        } else {
                            // get value from input for add Hoa Don Ban ChiTiet 
                            var e = document.getElementById("idTenSanPham");
                            var value = e.value; //get like this example value == 2 
                            //var text = e.options[e.selectedIndex].text; //get text from selector text == "test2"
                            var send_data = {
                                action: 'themHDChiTiet', //this them action ThemHoaDon Chi tiet
                                MaHDBan: $('#idMaHDBan').val(), //get from input pass value to api.aspx
                                IdSanPham: value,
                                SoLuong: $('#idSoLuong').val(),
                                giamGia: $('#idgaimGia').val(),
                            }
                            //send request
                            $.post("api.aspx",
                                send_data,
                                function (data) {
                                    var json = JSON.parse(data);
                                    console.log(json);
                                    if (json.ok) {
                                        $('#idsuccess').removeClass('d-none');
                                        setTimeout(function () {
                                            $('#idsuccess').addClass('d-none');
                                        }, 1000); //2000 milliseconds
                                        //when add Hoadon ChiTiet success get HDChiTiet again
                                        GetDsHDCT();
                                        GetDsHoaDonBan();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                            autoClose: 'OK|5000', //5000milisecond
                                            escapeKey: 'OK',
                                        });
                                    }
                                });
                        }
                        return false; //not close when click button add
                    }
                },
                Cancel: {
                    text: 'Close',
                    btnClass: 'btn-red',
                    action: function () {
                        
                    }
                }
               
            }
        });
    }

    function loadSanPhamSelector(selectedIDSanPham) {
        $.post("api.aspx",
            {
                action: "get_all_SanPham"
            },

            function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    var selectedSanPham = document.getElementById("idselectorsanpham");
                    //console.log(json);
                    //console.log(json.LSP);
                    // Clear existing options
                    if (selectedSanPham) {
                        selectedSanPham.innerHTML = '';
                    } else {
                        console.log("not found selected" + selectedSanPham);
                    }

                    // Find the index of the selectedIdSanPham in the array
                    var selectedIndex = json.LSP.findIndex(function (item) {
                        return item.idSP == selectedIDSanPham;
                    });

                    // If the selectedTenNVID is found, add it to the beginning of the array
                    if (selectedIndex !== -1) {
                        var selectedSanPhamItem = json.LSP[selectedIndex]; // Use a different variable name
                        json.LSP.splice(selectedIndex, 1);
                        json.LSP.unshift(selectedSanPhamItem);
                    }

                    console.log("json LSP", json.LSP);

                    for (var i = 0; i < json.LSP.length; i++) {
                        var option = document.createElement("option");
                        option.value = json.LSP[i].idSP;
                        option.text = json.LSP[i].TenSP;
                        console.log(option.text);
                        selectedSanPham.appendChild(option);
                    }

                } else {
                    // thông báo lỗi
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                    });
                }
            });
    }

    //update HDBCT 
    function update_HDBCT(idHDBanchiTiet, idSanPham, valueGiamGia, valueSoluong, MaHDCT) {
        var dialog_updateHDBanChiTiet = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: `Update Hóa Đơn Bán ChiTiet 👉 ${MaHDCT}`,
            content:
                '<form class="needs-validate" novalidate>' +
                'SanPham:' +
                '<select class="form-control" id="idselectorsanpham">' +
                '<option value="0"></option>' +
                '<option value="1">SanPham 1</option>' +
                '</select>' +

                'Số lượng:' +
                `<input type="number" id="id-soLuong" class="form-control" required min="0" oninput="validity.valid||(value='');" />` +
                'GiamGia%:' +
                `<input type="number" id="id-gaimGia" class="form-control" required min="0" value="0" oninput="validity.valid||(value='');" />` +
                '</form>',

            onContentReady: function () {
                var selectorsp = document.getElementById('idselectorsanpham');
                selectorsp.innerHTML = '';
                loadSanPhamSelector(idSanPham);

                document.getElementById("id-soLuong").value = valueSoluong;
                document.getElementById("id-gaimGia").value = valueGiamGia;
            },
            buttons: {
                formSubmit: {
                    text: 'update',
                    btnClass: 'btn-blue',
                    action: function () {
                            // get value from selector
                            var e = document.getElementById("idselectorsanpham");
                            var value = e.value; //get like this example value == 2 and .text get text
                            $.post("api.aspx",
                                {
                                    action: 'edit_DetailHDBChiTiet',
                                    idHDCT: idHDBanchiTiet , // id neet to update 
                                    idSp: value,
                                    giamGia: $('#id-gaimGia').val(),
                                    Soluong: $('#id-soLuong').val(),
                                },
                                function (data) {
                                    var jsonRespone = JSON.parse(data);
                                    if (jsonRespone.ok) {
                                        GetDsHDCT();
                                        dialog_updateHDBanChiTiet.close();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        // thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: jsonRespone.msg,

                                        });
                                    }
                                });
                            return false; // Prevent the dialog from closing automatically
                    }
                },
                Cancel: {
                    text: 'Đóng',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                }
            },
        });
    }

    //delete HDBCT 
    function Delete_HDBCT(idHDBanchiTiet, MaHDCT) {
        var dialog_DleteHDBanCT = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            //title: `Delete Hóa Đơn Bán Chi Tiết👉${MaHDCT}`,
            content: `Bạn Chắc chắn muốn xóa Hóa Dơn 👉 ${MaHDCT}`,   
            onContentReady: function () {

            },
            buttons: {
                formSubmit: {
                    text: 'Xác Nhân',
                    btnClass: 'btn-blue',
                    action: function () {
                            //Request
                            $.post("api.aspx",
                                {
                                    action: 'delete_DetailHDBChitTiet',
                                    maHDBanCT: idHDBanchiTiet,  //id need to delete
                                },
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.ok) {
                                        GetDsHDCT();
                                        dialog_DleteHDBanCT.close();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        // thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.msg,
                                        });
                                    }
                                });
                            return false; // Prevent the dialog from closing automatically
                        }
                },
                Cancel: {
                    text: 'Đóng',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                }
            },
        });
    }
    //Danh Sach HoaDon Ban
    function GetDsHoaDonBan() {
        $('#DsHDBan').html('Đang tải ds Hóa Đơn Bán...');
        $.post("api.aspx",
            {
                action: "ds_HDBan"
            },
            function (data) {
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    var s = "<div class='table-responsive'><table id='idDsHoaDonBan' class='table table-hover table-striped custom-table'>";
                    s += "<thead><tr><th>STT</th><th>MaHDBan</th><th>TenNhanVien</th><th>Ngày Bán</th><th>Tổng Tiền</th><th>Action</th></tr></thead>";
                    var stt = 0;
                    for (var item of json.LHDB) {
                        stt++;
                        s += "<tr>";
                        s += "<td>" + stt + "</td>";
                        s += "<td>" + item.MaHDBan + "</td>";
                        s += "<td>" + item.TenNV + "</td>";
                        // DateTime to date string
                        var date = new Date(item.ngayBan);
                        var dateString = date.toLocaleDateString();  // Format: MM/DD/YYYY
                        s += "<td>" + dateString + "</td>";
                        s += "<td>" + item.TongTien.toFixed(2) + "$" + "</td>";

                        var action = '<button class="btn btn-sm btn-primary btn-action-HDB" data-action="update_HDB" data-tennv="' + item.NhanVienID + '" data-dateselected="' + item.ngayBan + '" data-mahdban="' + item.MaHDBan + '" title="Update HoadonBan"><i class="fa-solid fa-pen"></i></button>';
                        action += ' <button class="btn btn-sm btn-danger btn-action-HDB" data-action="delete_HDB" data-mahdban="' + item.MaHDBan + '" title="Delete HoadonBan"><i class="fa-solid fa-trash"></i></button>';
                        s += '<td>' + action + '</td>';
                        s += "</tr>";
                        //console.log(item.NhanVienID);
                    }
                    
                    s += "</table>";
                    $('#DsHDBan').html(s);  //
                    sort_Table_Simple('#idDsHoaDonBan');

                    // Attach the click event and actions to the table itself (event delegation).
                    $('#idDsHoaDonBan').on('click', 'tbody tr', function () {
                        var MaHDBan = $(this).find('[data-mahdban]').data('mahdban');
                        //console.log(MaHDBan);
                        showDetailsForHDBan(MaHDBan);
                    });

                    // Handle row actions (update, delete) using event delegation.
                    $('#idDsHoaDonBan').on('click', 'button[data-action="update_HDB"]', function (e) {
                        e.stopPropagation(); // Prevent further propagation
                        var MaHDBan = $(this).data('mahdban');
                        var TenNVID = $(this).data('tennv'); // Get IdNhanvien from data attribute
                        var DateSelected = $(this).data('dateselected');
                        //console.log(MaHDBan);
                        //console.log("TenNV:", TenNVID);
                        //console.log(DateSelected);
                        update_HDB(MaHDBan, TenNVID,DateSelected);
                    });

                    $('#idDsHoaDonBan').on('click', 'button[data-action="delete_HDB"]', function (e) {
                        e.stopPropagation(); // Prevent further propagation
                        var MaHDBan = $(this).data('mahdban');
                        //console.log(MaHDBan);
                        delete_HDB(MaHDBan);
                    });
                } else {
                    // thông báo lỗi
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: json.reply.msg,
                        autoClose: 'OK|5000', //5000milisecond
                        escapeKey: 'OK',
                    });
                }
            }
        );      
    }

    //show Detail HoaDonBan
    function showDetailsForHDBan(MaHDBan) {
        $.post("api.aspx", {
            action: 'showDetailbyMaHDB', 
            maHDBan: MaHDBan,
        }, function (data) {
            var json = JSON.parse(data);
            console.log(json);
            if (json.reply.ok) {
                var s = '';
                // Build the HTML table based on the data received
                s = "<div class='table-responsive'><table id='idshowDetailHDBan' class='table table-hover'>";
                s += `<thead>` +
                    `<tr align="center" class="table-info fw-bold">` +
                    `<th align="center">STT</th>` +
                    `<th>TenSanPham</th>` +
                    `<th>GiaBan</th>` +
                    `<th>SoLuong</th>` +
                    `<th>GiamGia</th>` +
                    `<th>ThanhTien</th>` +
                    `</tr>` +
                    `</thead>` +
                    `<tbody>`;
                var stt = 0;
                var totalTongTien = 0; // 

                for (var k of json.LHDB) {
                    stt++;
                    totalTongTien += k.ThanhTien; // Add ThanhTien to the totalTongTien
                    //  console.log(k.ThanhTien);
                    s += "<tr align=center data-tensp='"+k.TenSP+"'>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + k.TenSP + "</td>";
                    s += "<td>" + k.GiaBan.toFixed(2) + "$" + "</td>";
                    s += "<td>" + k.SoLuong + "</td>";
                    s += "<td>" + k.giamGia + "%" + "</td>";
                    s += `<td>` + k.ThanhTien.toFixed(2) + "$" + `</td>`; 
                    //s += '<td><button class="btn btn-primary btn-sm btn-action-user"><i class="fa-solid fa-pen"></i></button> <button class="btn btn-danger btn-sm btn-action-user"><i class="fa-solid fa-trash"></i></button></td>';
                    s += "</tr>";
                }

                s += '<tr class="table-warning fw-bold"><td align=center>' + (++stt) + '<td align=center></td><td align=center></td><td align=center></td></td><td align=center>Tổng:</td><td align=center><span class="badge rounded-pill bg-primary">' + totalTongTien.toFixed(2) + "$" + '</span></td></tr>';
                s += '</tbody></table></div>';


                var dialog_ShowDetailHDBan = $.confirm({
                    closeIcon: true,
                    type: 'yellow',
                    typeAnimated: true,
                    draggable: true,
                    columnClass: 'l',
                    title: `Show Details HDBan <br></br> <i class="fa-solid fa-angles-right"></i> ${MaHDBan}`,
                    content: s, //s is content
                    buttons: {
                        ok: {
                            text: '<i class="fa fa-circle-xmark"></i> Đóng lại',
                            btnClass: 'btn-info',
                        }
                    },
                    onContentReady: function () {
                        sort_table('#idshowDetailHDBan', "CHỉ Tiết Hóa Đơn Ban",10, `Mã Hóa Đớn:${MaHDBan}`);
                    }

                });
            } else {
                //dialog_ShowDetailHDBan.close(); // Close the dialog
                // Show error message
                $.dialog({
                    title: 'Báo lỗi',
                    type: 'red',
                    content: json.reply.msg,
                });
                
            }

        });
    }
    //
    function loadNhanVienSelector(selectedTenNVID) {
        $.post("api.aspx",
            {
                action: "get_allNV"
            },
            function (data) {
                var json = JSON.parse(data); // Parse JSON data

                if (json) {
                    var selectNhanVien = document.getElementById("idNhanVienID");
                    // Clear existing options
                    selectNhanVien.innerHTML = '';

                    // Find the index of the selectedTenNVID in the array
                    var selectedIndex = json.findIndex(function (item) {
                        return item.NhanVienID == selectedTenNVID;
                    });

                    // If the selectedTenNVID is found, add it to the beginning of the array
                    if (selectedIndex !== -1) {
                        var selectedNhanVien = json[selectedIndex];
                        json.splice(selectedIndex, 1);
                        json.unshift(selectedNhanVien);
                    }

                    // Loop through the data and add options to the select element
                    for (var i = 0; i < json.length; i++) {
                        var option = document.createElement("option");
                        option.value = json[i].NhanVienID;
                        option.text = json[i].TenNV;
                        selectNhanVien.appendChild(option);
                    }
                }
            });
    }

    //formatDate
    function formatDateToYYYYMMDD(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    //Update Hoadonban with id = MaHDBan
    function update_HDB(MaHDBan, TenNVID,DateSelected) {
        var dialog_updateHDBan = $.confirm({
            closeIcon: true,
            type: 'yellow',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: 'Update Hóa Đơn Bán',
            content:
                '<form class="needs-validate" novalidate>' +
                'NhanVienID:' +
                '<select class="form-control" id="idNhanVienID">' +
                '<option value="0"></option>' +
                '<option value="1">NhanVien 1</option>' +
                '<option value="2">NhanVien 2</option>' +
                '<option value="3">NhanVien 3</option>' +
                '</select>' +

                'ngayBan:' +
                '<input type="date" id="idNgayBan" value class="form-control" required />' +
                '</form>',

            onContentReady: function () {
                var selectorNV = document.getElementById('idNhanVienID');
                selectorNV.innerHTML = '';
                loadNhanVienSelector(TenNVID);

                DateSelected = formatDateToYYYYMMDD(new Date(DateSelected));
                // Fill the date input with the DateSelected value
                $('#idNgayBan').val(DateSelected);
            },
            buttons: {
                formSubmit: {
                    text: 'Xác Nhân',
                    btnClass: 'btn-blue',
                    action: function () {
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation fails
                        } else {
                            // get value from selector
                            var e = document.getElementById("idNhanVienID");
                            var value = e.value; //get like this example value == 2 
                            $.post("api.aspx",
                                {
                                    action: 'update_HDB',
                                    maHDBan: MaHDBan , // update by MaHDBan
                                    nhanVienID: value,
                                    ngayBan: $('#idNgayBan').val(),
                                },
                                function (data) {
                                    var jsonRespone = JSON.parse(data);
                                    if (jsonRespone.ok) {
                                        //update success load dataTable again
                                        GetDsHoaDonBan();
                                        GetDsHDCT();
                                        dialog_updateHDBan.close();

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        // thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: jsonRespone.msg,

                                        });
                                    }
                                });
                            return false; // Prevent the dialog from closing automatically
                        }
                    }           
                },
                Cancel: {
                    text: 'Đóng',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                }
            },
        });
    }

    //Delete Hoadonban with id = MaHDBan
    function delete_HDB(MaHDBan) {
        var dialog_DelteHDBan = $.confirm({
            closeIcon: true,
            type: 'red',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: 'Xóa Hóa Đơn Bán',
            content: `Bạn chắc chắn xóa Hóa Đơn này ${MaHDBan}👈?`,
            buttons: {
                formSubmit: {
                    text: 'Xác nhận',
                    btnClass: 'btn-blue',
                    action: function () {
                        $.post("api.aspx",
                            {
                                action: 'delete_HDB',
                                maHDBan: MaHDBan // delete by MaHDBan
                            },
                            function (data) {
                                var json = JSON.parse(data);
                                if (json.ok) {
                                    GetDsHoaDonBan();
                                    GetDsHDCT();
                                    dialog_DelteHDBan.close();

                                    //alway use to update thongke when add ,delete ,update
                                    NgayBanDcNhieuNhat();
                                    SanPhamTop();
                                    NVTop();
                                } else {
                                    // thông báo lỗi
                                    $.dialog({
                                        title: 'Báo lỗi',
                                        type: 'red',
                                        content: json.msg,
                                    });
                                }
                            });
                        return false; // Prevent the dialog from closing automatically
                    },
                },
                Cancel: {
                    text: 'Đóng',
                    btnClass: 'btn-red',
                    action: function () {
                      
                    }
                }
            },
        });
    }



    //
    function getOnlyMaHDBanGenerate() {
        $.post("api.aspx",
            {
                action: "auto_Generate_MaHDBan"
            },
            function (data) {
                var json = JSON.parse(data); //json string to json obj
                if (json.reply.ok) {
                    var generatedMaHDBan = json.LHDB[0].MaHDBan;  //pass value get from db
                    // console.log(generatedMaHDBan);
                    // Set the value of the input element
                    $("#idMaHDBan").val(generatedMaHDBan); // pass to input in dailog ThemHDBan
                    // console.log(generatedMaHDBan);

                } else {
                    // thông báo lỗi
                    $.dialog({
                        title: 'Báo lỗi',
                        type: 'red',
                        content: jsonRespone.msg,
                        autoClose: 'OK|5000', // 5000 milliseconds
                        escapeKey: 'OK',
                    });
                }
            });
    }
    //them Hoa Don 
    function ThemHDBan() {
        dialog_ThemHDBan = $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: 'Thêm Hóa Đơn',
            content:
                '<form class="needs-validate" novalidate>' +
                'MaHDBan:' +
                '<input type="text" id="idMaHDBan" class="form-control" required />' +
                'NhanVienID:' +
                '<select class="form-control" id="idNhanVienID">' +
                '<option selected disabled hidden>Choose here</option>'+
                '<option value="1">NhanVien 1</option>' +
                '<option value="2">NhanVien 2</option>' +
                '<option value="3">NhanVien 3</option>' +
                '</select>' +

                //'ngayBan:' +
                //'<input type="date" id="idNgayBan" class="form-control" required />' +
                '</form>',
            buttons: {
                formSubmit: {
                    text: 'Add HDBan',
                    btnClass: 'btn-blue',
                    action: function () {
                        //this for validate form
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation fails
                        } else {
                            // get value from input for add Hoa Don Ban                         
                            var send_data = {
                                action: 'them_HDBan', //this them HoaDon Ban action
                                maHDBan: $('#idMaHDBan').val(), //get from input pass value to api.aspx
                                nhanVienID: $('#idNhanVienID').val(),
                                //ngayBan: $('#idNgayBan').val(),
                            }

                            $.post("api.aspx",
                                send_data,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.reply.ok) {
                                        //when ok pass MaHDBan when input success for input HoaDonBanChiTiet
                                        AddHoaDonBanChiTietDialog(json.HB.MaHDBan); //insert add hoadonBan already show dailog add chiTiet
                                        getSanPham(); //get dropdown for dailog HdChiTiet when click on button them

                                        GetDsHoaDonBan(); //get again show HoaDonBan
                                        dialog_ThemHDBan.close(); //close when show Dailog AddHoadon

                                        //alway use to update thongke when add ,delete ,update
                                        NgayBanDcNhieuNhat();
                                        SanPhamTop();
                                        NVTop();
                                    } else {
                                        //thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.reply.msg,
                                            autoClose: 'OK|5000', //5000milisecond
                                            escapeKey: 'OK',
                                        });
                                    }
                                });
                            return false;// ko đóng dialog bố
                            dialog_ThemHDBan.close(); //when button Add HDBan
                        }
                    },
                },
                Cancel: {
                    text: 'Đóng',
                    btnClass: 'btn-red',
                    action: function () {

                    }
                }
            },
        });
    }

    //define function for action='Login'
    function login() {
        //show ra 1 hộp thoại: có 2 trường cần nhập username=TenNV luon trong DB password = Sdt trong DB table NhanVien
        var dialog_login = $.confirm({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            draggable: true,
            columnClass: 's',
            title: 'Login',
            content: '<form class="needs-validate" novalidate>' +
                '<div>Username:</div>' +
                '<div class="form-group input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text" style="height: 98.6%;"><i class="fas fa-user"></i></span>' +
                '</div>' +
                '<input type="text" placeholder="Username" class="form-control" id="idusername" required>' +
                '<div class="invalid-feedback">Please input a username.</div>' +
                '</div>' +
                '<div>Password:</div>' +
                '<div class="form-group input-group">' +
                '<div class="input-group-prepend">' +
                '<span class="input-group-text" style="height: 98.6%;"><i class="fas fa-lock"></i></span>' +
                '</div>' +
                '<input type="password" placeholder="Password" class="form-control" id="idpassword" required>' +
                '<div class="invalid-feedback">Please input a password.</div>' +
                '</div>' +
                '<div id="loadingIndicator" class="d-none text-primary">Loading...</div>' +
                '</form>',

            buttons: {
                formSubmit: {
                    text: '<i class="fa-solid fa-right-to-bracket"></i> Login',
                    btnClass: 'btn-blue',
                    action: function () {
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation fails
                        } else {
                            // to handle the login process here
                            var loadingIndicator = $('#loadingIndicator');
                            loadingIndicator.removeClass('d-none'); // Show the loading indicator
                            //send data
                            var send_data = {
                                action: 'Check_login',
                                username: $('#idusername').val(), //username = TenNhanVien
                                password: $('#idpassword').val(), //password = password NV
                            }
                            //console.log("Loading..........");
                            $.post("api.aspx",
                                send_data,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.reply.ok) {
                                        console.log(json.nv.NhanVienID); //idCurrentUserLogin 
                                        var idnv = json.nv.NhanVienID;
                                        isLoggedIn = true;
                                        $(".idActionclick").off('click');
                                        //ok login success
                                        $('#cmdLogin').addClass("not-show");
                                        $('#cmdLogout').removeClass("not-show");
                                        dialog_login.close(); //login ok close dailog

                                        // login success show name user near the logout 
                                        $('#idnameLogin').text('Xin chào ' + json.nv.TenNV + '🎉').removeClass("not-show");

                                        //show Hoa DonCT
                                        GetDsHDCT();
                                        //show HoaDon Ban
                                        GetDsHoaDonBan();
                                        // Click event for "ThemHoaDonBan" button
                                        $("#idThemHD").click(function () {
                                            ThemHDBan();
                                            getOnlyMaHDBanGenerate();  //show MaHoadonGenerate when click button them
                                            getNV(); //get allNV            
                                        });
                                        $('.btnPermission').click(function () {
                                            if (json.nv.NhanVienID > 1) {
                                                ShowPermission("Không cho phép Không Phải Admin", "Thông báo")
                                            } 
                                        });
                                        $('#idbuttonsanpham').click(function () {
                                            if (idnv == 1) {
                                                /*  $('#idbuttonsanpham').off('click');*/
                                                dialogSanPham();
                                            }
                                        });
                                        $('#idbuttonNV').click(function () {
                                            if (idnv == 1) {
                                                dialogNhanVien();
                                            }
                                        });
                                        $('#idNhaCC').click(function () {
                                            if (idnv == 1) {
                                                dialogNCC();
                                            }
                                        });
                                        $('#idstatistical').click(function () {
                                            dialogThongKe();
                                        });
                                            
                                    } else {
                                        //thông báo lỗi
                                        $.dialog({
                                            title: 'Báo lỗi',
                                            type: 'red',
                                            content: json.reply.msg,
                                            //autoClose: 'OK|5000', //5000milisecond
                                            //escapeKey: 'OK',
                                        });
                                    }
                                });
                            return false;// ko đóng dialog bố
                            // Close the dialog if login is successful
                            dialog_login.close();
                        }
                    }
                },
                cancel: {
                    text: '<i class="fa-solid fa-circle-xmark"></i> Đóng',
                    btnClass: 'btn-red',
                    action: function () {
                        //close
                        isLoggedIn = false;
                    }
                },
            },
            onContentReady: function () {
                $('#idusername').focus();
            }
        });
    }

    // Click event check login or not 
    $(".idActionclick").click(function () {
        if (isLoggedIn) {
            //not show please login

        } else {
            showPleaseLogin();
        }
    });

    $('#cmdLogout').click(function () { //click on button logout show login again
        isLoggedIn = false;
        $('#cmdLogout').addClass("not-show"); //add class not-show hide
        $('#cmdLogin').removeClass("not-show");
        $('#idnameLogin').addClass("not-show");
        $('#idThemHD').off('click');
       // $('#idThemHD').click(showPleaseLogin());
        clearContentOnLogout();

        $('#DsHDBan').html('');
        $(".idActionclick").click(function () {
            if (isLoggedIn) {
                //not show please login

            } else {
                showPleaseLogin();
            }
        });
      
    });

    //hàm login đc gọi khi nút có id='cmdLogin' đc click
    $("#cmdLogin").click(function () {
        isLoggedIn = true;
        isLoggedIn == true ? login() : showPleaseLogin();
    });

    // clear the content when logging out
    function clearContentOnLogout() {
        $('#ds-hdCT').html('');
    }

    //get dsHD
    function GetDsHDCT() {
        if (!isLoggedIn) {
            // If the user is not logged in, clear the content
            $('#ds-hdCT').html(''); 
            return;
        }
        $('#ds-hdCT').html('Đang tải ds Hóa Đơn...');
        $.post("api.aspx",
            {
                action: "ds_Hd_chiTiet"
            },
            function (data) {
                // Parse JSON data
                var json = JSON.parse(data);
                if (json.reply.ok) {
                    var L = json.LH;
                    // Build the HTML table  //class for disply one row nowrap
                    var s = "<div>Danh Sách Hóa Đơn Chỉ tiết</div>";
                    s += "<div class='table-responsive'><table id='idDsHDChiTiet' class='table table-hover custom-table'>";
                    s += "<thead><tr class='table-info fw-bold'><th>STT</th><th>MaHoaDon</th><th>TenSanpham</th><th>Gía Bán</th><th>Số Lượng</th><th>GiamGia</th><th>Thanh tiền</th><th>Sửa/Xóa</th></tr></thead>";

                    var stt = 0;
                    for (var k of L) {
                        stt++;
                        s += "<tr>";
                        s += "<td>" + stt + "</td>";
                        s += "<td>" + k.MaHD + "</td>";
                        s += "<td>" + k.TenSP + "</td>";
                        s += "<td>" + k.GiaBan.toFixed(2) + "$" + "</td>";
                        s += "<td>" + k.SoLuong + "</td>";
                        s += "<td>" + k.giamGia + "%" + "</td>";
                        s += "<td>" + k.ThanhTien.toFixed(2) + "$" + "</td>";
                        //s += '<td><button class="btn btn-primary btn-sm btn-action-user"><i class="fa-solid fa-pen"></i></button> <button class="btn btn-danger btn-sm btn-action-user"><i class="fa-solid fa-trash"></i></button></td>';
                        var action = '<button class="btn btn-sm btn-primary btn-action-HDB" data-action="update_HDBCT" data-mahdct="' + k.MaHD + '" data-idhdchitiet="' + k.id + '" data-idsanpham="' + k.idSP + '" data-gaimgia="' + k.giamGia + '" data-soluong="' + k.SoLuong + '" title="Update HoadonBan Chi Tiet"><i class="fa-solid fa-pen"></i></button>';
                        action += ' <button class="btn btn-sm btn-danger btn-action-HDB" data-action="delete_HDBCT" data-mahdct="' + k.MaHD + '" data-idchitietdelele="' + k.id + '" title="Delete HoadonBan chi tiet"><i class="fa-solid fa-trash"></i></button>';
                        s += '<td>' + action + '</td>';
                        s += "</tr>";
                    }
                    s += "</table>";
                    //s += "Danh sách gồm " + L.length + " Hóa Đơn";

                    // Replace the content of your element with the table
                    $('#ds-hdCT').html(s);

                    //Apply DataTables to the loaded content
                    sort_Table_Simple('#idDsHDChiTiet');

                    // Handle row actions (update, delete) using event delegation.
                    $('#idDsHDChiTiet').on('click', 'button[data-action="update_HDBCT"]', function (e) {
                        e.stopPropagation(); // Prevent further propagation
                        var idHDBanchiTiet = $(this).data('idhdchitiet');
                        var idSanPham = $(this).data('idsanpham');
                        var valueGiamGia = $(this).data('gaimgia');
                        var valueSoluong = $(this).data('soluong');
                        var MaHDCT = $(this).data('mahdct');
                        //console.log(valueGiamGia);
                        //console.log(valueSoluong);
                        update_HDBCT(idHDBanchiTiet, idSanPham, valueGiamGia, valueSoluong, MaHDCT);
                    });

                    $('#idDsHDChiTiet').on('click', 'button[data-action="delete_HDBCT"]', function (e) {
                        e.stopPropagation(); // Prevent further propagation
                        var idBanchiTiet = $(this).data('idchitietdelele');
                        var MaHDCT = $(this).data('mahdct');
                        //console.log(idBanchiTiet);
                        Delete_HDBCT(idBanchiTiet, MaHDCT);
                    });
                }
            }); //danh sach hoa don chit tiet 
    }
    //function DataTable have search paginate and...
    function sort_Table_Simple(id) {
        $(id).dataTable({
            "paging": true,    // Enable pagination
            "searching": true, // Enable search
            "info": true,     // 
            "ordering": true,  // Enable sorting
            "order": [[0, 'asc']], // Sort by the first column in ascending order by default
            "lengthMenu": [10,25, 50], // Customize the page length menu
            //change property to Tieng viet
            "language": {
                "decimal": "",
                "emptyTable": "Không có dữ liệu",
                "info": "Hiển thị từ dòng _START_ đến dòng _END_ trong tổng số _TOTAL_ dòng",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "infoFiltered": "(filtered from _MAX_ total entries)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Hiển thị _MENU_ dòng",
                "loadingRecords": "Đang tải dữ liệu...",
                "processing": "Đang xử lý...",
                "search": "Tìm kiếm:",
                "zeroRecords": "Không tìm thấy lớp nào phù hợp",
                "paginate": {
                    "first": "Trang đầu",
                    "last": "Trang cuối",
                    "next": "Trang sau",
                    "previous": "Trang trước"
                }
            }
        });
    }

    //for sort Table and already have Export with Excel
    function sort_table(id, fn, pageLength_,message) {
        $('.jconfirm-holder').width($('.jconfirm-open').width());
        let pageLength = 10;
        if (pageLength_) pageLength = pageLength_;
        if (!fn) fn = "Export";
        if (!message) message = "";

        $(id).dataTable({
            dom: 'Bfrtip',
            "pageLength": pageLength,
            buttons: [
                {
                    extend: 'copyHtml5',
                    title: fn
                },
                {
                    extend: 'excelHtml5',
                    title: fn,
                    messageTop: message,
                },
                //{
                //    extend: 'pdfHtml5', // Add the PDF export button
                //    title: fn,
                //    customize: function (doc) {
                //        // You can customize the PDF document here if needed
                //    }
                //}
            ],

            "order": [],
            "language": {
                "decimal": "",
                "emptyTable": "Không có dữ liệu",
                "info": "Hiển thị từ dòng _START_ đến dòng _END_ trong tổng số _TOTAL_ dòng",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "infoFiltered": "(filtered from _MAX_ total entries)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Show _MENU_ entries",
                "loadingRecords": "Loading...",
                "processing": "Processing...",
                "search": "Tìm kiếm:",
                "zeroRecords": "Không tìm thấy lớp nào phù hợp",
                "paginate": {
                    "first": "Trang đầu",
                    "last": "Trang cuối",
                    "next": "Trang sau",
                    "previous": "Trang trước"
                },
                "aria": {
                    "sortAscending": ": Sắp xếp tăng dần",
                    "sortDescending": ": Sắp xếp giảm dần"
                }
            }
        });
        $('.jconfirm-holder').width($('.jconfirm-open').width());
    }
});