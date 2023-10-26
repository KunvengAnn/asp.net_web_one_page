$(document).ready(function () {
    $('#cmdLogin').removeClass("not-show");
    var isLoggedIn = false;

    // Function to show the "Please login" message
    function showPleaseLogin() {
        $.dialog({
            closeIcon: true,
            type: 'blue',
            typeAnimated: true,
            escapeKey: false, 
            title: 'Please Login',
            content: 'Login để có thể dùng các chức năng',
            buttons: {
                OK: function () {
                }
            }
        });
    }

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

                    // Loop through the data and add options to the select element
                    for (var i = 0; i < json.length; i++) {
                        var option = document.createElement("option");
                        option.value = json[i].NhanVienID; //idNhanVine
                        option.text = json[i].TenNV;  //this TenNV
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
    //them Hoa Don 
    function ThemHDCT() {
        $.confirm({
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
                '<option value="1">NhanVien 1</option>' +
                '<option value="2">NhanVien 2</option>' +
                '<option value="3">NhanVien 3</option>' +
                '</select>' +

                'ngayBan:' +
                '<input type="date" id="idNgayBan" class="form-control" required />' +
                '</form>',
            buttons: {
                formSubmit: {
                    text: 'Submit',
                    btnClass: 'btn-blue',
                    action: function () {
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation fails
                        } else {
                            // get value from input for add Hoa Don Ban
                            var maHDBan = $('#idMaHDBan').val();
                            var nhanVienID = $('#idNhanVienID').val();
                            var ngayBan = $('#idNgayBan').val();
                            var send_data = {
                                action: '', //this them HoaDon Ban action
                                maHDBan,
                                nhanVienID,
                                ngayBan
                            }
                           //working this
                            $.post("api.aspx",
                                send_data,
                                function (data) {
                                    var json = JSON.parse(data);
                                    if (json.reply.ok) {
                                        isLoggedIn = true;
                                        //ok login success
                                       
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
                            
                        }
                    },
                },
                Cancel: function () {
                    // Handle the Cancel button action
                },
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
                '<div class="form-group">' +
                '<label for="username">Username:</label>' +
                '<input type="text" class="form-control" id="idusername" required>' +
                '<div class="invalid-feedback">Please input a username.</div>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="password">Password:</label>' +
                '<input type="password" class="form-control" id="idpassword" required>' +
                '<div class="invalid-feedback">Please input a password.</div>' +
                '<div id="loadingIndicator" class="d-none text-primary">Loading...</div>' +
                '</div>' +
                '</form>',

            buttons: {
                formSubmit: {
                    text: 'Login',
                    btnClass: 'btn-blue',
                    action: function () {
                        var form = document.querySelector('.needs-validate');
                        if (form.checkValidity() === false) {
                            form.classList.add('was-validated');
                            return false; // Prevent the dialog from closing if validation fails
                        } else {
                                // Your code to handle the login process here
                                var loadingIndicator = $('#loadingIndicator');
                                loadingIndicator.removeClass('d-none'); // Show the loading indicator
                                //send data
                                //đợi phản hồi: ok thì gọi hàm 
                                var send_data = {
                                    action: 'Check_login',
                                    username: $('#idusername').val(), //username = TenNhanVien
                                    password: $('#idpassword').val(), //password = SdtNV
                                }
                                 console.log("Loading..........");
                                $.post("api.aspx",
                                    send_data,
                                    function (data) {
                                        var json = JSON.parse(data);
                                        if (json.reply.ok) {
                                            isLoggedIn = true;
                                            //ok login success
                                            $('#cmdLogin').addClass("not-show");
                                            $('#cmdLogout').removeClass("not-show");
                                            dialog_login.close(); //login ok close dailog
                                            // login success show name user near the logout 
                                            $('#idnameLogin').text('Xin chào ' + json.nv.TenNV+'🎉').removeClass("not-show");

                                            //show Hoa DonCT
                                            get_dsHDCT();

                                            // Click event for "Them" button
                                            $("#idThemHD").click(function () {
                                                ThemHDCT();
                                                getNV(); //get allNV
                                            });
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
                            // Close the dialog if login is successful
                            dialog_login.close();
                        }
                    }
                }, 
                cancel: {
                    text: 'Đóng',
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

    //hàm login đc gọi khi nút có id='cmdLogin' đc click
    $("#cmdLogin").click(function () {
        isLoggedIn = true;
        login();
    });



    //get dsHD
    function get_dsHDCT() {
        $('#ds-hdCT').html('Đang tải ds Hóa Đơn...');
        $.post("api.aspx",
            {
                action: "ds_Hd_chiTiet"
            },
            function (data) {
                //cần json string -> json object
                //console.log(data);
                var L = JSON.parse(data);
                //duyệt từng phần tử k trong L để ghép thành 1 chuỗi html
                var s = "<table class='table table-hover table-striped custom-table'>";
                    s += "<tr><th>STT</th><th>MaHoaDon</th><th>TenSanpham</th><th>Gía Bán</th><th>Số Lượng</th><th>Thanh tiền</th></tr>";
                var stt = 0;
                for (var k of L) {
                    stt++;
                    s += "<tr>";
                    s += "<td>" + stt + "</td>";
                    s += "<td>" + k.MaHD + "</td>";
                    s += "<td>" + k.TenSP + "</td>";
                    s += "<td>" + k.GiaBan.toFixed(2) + "$"+"</td>"; 
                    s += "<td>" + k.SoLuong + "</td>";
                    s += "<td>" + k.ThanhTien.toFixed(2) + "$" + "</td>";
                    s += "</tr>";
                }
                s += "</table>";
                s += "Danh sách gồm " + L.length + "Hóa Đơn";
               $('#ds-hdCT').html(s);  //cho chuỗi html trong biến s vào thẻ có id=
            });
    }
//get_ds_kh(); //gọi hàm get ds kh mà ko cần đk gì:
//  //vào trang là tải luôn ds kh
});