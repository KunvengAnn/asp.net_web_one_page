using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace QuanlyCafeWeb
{
    public partial class api : System.Web.UI.Page
    {
        string conStr = LibConnection.AppSettingGet.ConnectionString; //get connection
        
        private class Reply
        {
            public bool ok; //true ok /false error 
            public string msg; //message
        }
        private class NhanVien
        {  //username lấy = TEnNV trong DB password = Sdt trong DB table NhanVien
            public int NhanVienID;
            public string TenNV, Sdt;
            public int Gt;
            public double Luong;
            public DateTime ngayLamViec;
          
        }
        void getAllNV()
        {
            SqlConnection cn = new SqlConnection(conStr);
            cn.Open();
            SqlCommand cm = new SqlCommand("SP_NhanVien", cn);
            cm.CommandType = CommandType.StoredProcedure;
            cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "get_allNV";
            
            SqlDataReader dr = cm.ExecuteReader();
            //dt tạo trống để chuẩn bị load tất cả từ dr
            DataTable dt = new DataTable();
            dt.Load(dr); //load hết từ dr vào dt
            cm.Dispose(); 
            cn.Close();   
            cn.Dispose();  
            List<NhanVien> LNV = new List<NhanVien>();
            if(dt.Rows.Count > 0)
            {
                foreach(DataRow r in dt.Rows)
                {
                    NhanVien n = new NhanVien();
                    n.NhanVienID =Convert.ToInt32(r["idNV"].ToString());
                    n.TenNV = r["TenNV"].ToString();
                    n.Sdt = r["Sdt"].ToString();
                    n.Gt = Convert.ToInt32(r["GT"]);
                    n.Luong = Convert.ToDouble(r["Luong"].ToString());
                    n.ngayLamViec =Convert.ToDateTime(r["ngayLamViec"].ToString());
                    LNV.Add(n);
                }
            }
            //listOb -> Json String
            string json = JsonConvert.SerializeObject(LNV);
            //phản hồi json text về trình duyệt
            this.Response.Write(json);
        }
        void ds_NV()
        {
            Reply reply = new Reply();
            try
            {
                //truy van db: sp_Nhien @acion
                //mong muốn trả về ...
                //mà trình duyệt can xu ly
                //username lấy = TEnNV trong DB password = Sdt trong DB table NhanVien 
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open(); //open connection

                //sql chuẩn bị thực thi
                string sql = "SP_NhanVien";

                //đối tượng sẽ thực thi sql trên kết nối đã mở
                SqlCommand cm = new SqlCommand(sql, cn);
                //loại sql này là sp_
                cm.CommandType = CommandType.StoredProcedure;
                //truyền các tham số để chuẩn bị chạy sp_
                cm.Parameters.Add("@action", SqlDbType.NVarChar, 50).Value = "check_login";
                //thực thi sp_ , loại action này trả về dữ liệu, hứng vào dr
                SqlDataReader dr = cm.ExecuteReader();
                //dt tạo trống để chuẩn bị load tất cả từ dr
                DataTable dt = new DataTable();
                dt.Load(dr); //load hết từ dr vào dt
                cm.Dispose();  //hủy cm
                cn.Close();    //đóng kết nối
                cn.Dispose();  //giải phóng tài nguyên
                ///lưu ý: luôn đóng, hủy khi dùng xong!

                //chuyển dt ->đối tượng->json string

                //chuyển dataTable(dt) -> đối tượng 
                List<NhanVien> NVList = new List<NhanVien>();
                if (dt.Rows.Count > 0)
                    foreach (DataRow r in dt.Rows)
                    {
                        NhanVien NV = new NhanVien();
                        NV.TenNV = r["TenNV"].ToString();
                        NV.Sdt = r["Sdt"].ToString();
                        NV.Gt = Convert.ToInt32(r["GT"].ToString());
                        NV.Luong =Convert.ToDouble(r["Luong"].ToString());
                        NV.ngayLamViec =Convert.ToDateTime( r["ngayLamViec"].ToString());
                        NVList.Add(NV);
                    }
                reply.ok = true;
                //chuyển obj List -> json text
                string json = JsonConvert.SerializeObject(NVList);
                //phản hồi json text về trình duyệt
                this.Response.Write(json);
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg ="Error code:" + ex.GetHashCode() +ex.Message;
            }  //chua lam
        }
        void Check_login()
        {
            Reply reply = new Reply();
            NhanVien nv = new NhanVien();
            try
            { 
                nv.TenNV = Request["username"]; //Request username=tenNV
                nv.Sdt = Request["password"];
                //string username = Request["username"]; //Request username=tenNV
                //string password = Request["password"];
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();

                //use storeProcedure
                string sql = "SP_NhanVien";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "check_login";
                cm.Parameters.Add("@TenNV", SqlDbType.NVarChar, 50).Value = nv.TenNV;
                cm.Parameters.Add("@Sdt", SqlDbType.NVarChar, 12).Value = nv.Sdt;

                SqlDataReader dr = cm.ExecuteReader();
                //dt tạo trống để chuẩn bị load tất cả từ dr
                DataTable dt = new DataTable();
                dt.Load(dr); //load hết từ dr vào dt
                cm.Dispose();  //hủy cm
                cn.Close();    //đóng kết nối
                cn.Dispose();  //giải phóng tài nguyên

                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    reply.msg = "success";
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Username or password is incorrect🤷‍♀️!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var responseObj = new { reply, nv };
            //chuyển đối tượng reply -> json text
            string json = JsonConvert.SerializeObject(responseObj);
            //gửi json text về trình duyệt
            this.Response.Write(json);
        }

        private class HDChiTiet
        {
            public string MaHD;
            public string TenSP; //SP
            public double GiaBan; //SP 
            public int idSP,SoLuong;
            public double ThanhTien;
        }
        private class SanPham
        {
            public string TenSP;
            public string DVT;
            public double GiaBan;
        }
        //
        void dsHDChiTiet()
        {
            SqlConnection cn = new SqlConnection(conStr);
            cn.Open();
            string sql = "SP_HDChiTiet";
            SqlCommand cm = new SqlCommand(sql, cn);
            cm.CommandType = CommandType.StoredProcedure;
            cm.Parameters.Add("@action", SqlDbType.VarChar, 30).Value = "ds_Hd_chiTiet";
            //thực thi sp_ , loại action này trả về dữ liệu, hứng vào dr
            SqlDataReader dr = cm.ExecuteReader();
            //dt tạo trống để chuẩn bị load tất cả từ dr
            DataTable dt = new DataTable();
            dt.Load(dr); //load hết từ dr vào dt
            cm.Dispose();  //hủy cm
            cn.Close();    //đóng kết nối
            cn.Dispose();  //giải phóng tài nguyên
            List<HDChiTiet> LH = new List<HDChiTiet>();
            if (dt.Rows.Count > 0)
                foreach (DataRow r in dt.Rows)
                {
                    HDChiTiet HDCT = new HDChiTiet();
                    HDCT.MaHD = r["MaHDBan"].ToString();
                    HDCT.TenSP = r["TenSp"].ToString();
                    HDCT.GiaBan = Convert.ToDouble(r["DonGiaBan"].ToString());
                    HDCT.idSP = Convert.ToInt32(r["idSanPam"].ToString());
                    HDCT.SoLuong = Convert.ToInt32(r["SoLuong"]);
                    HDCT.ThanhTien = Convert.ToDouble(r["ThanhTien"]);
                    LH.Add(HDCT);
                }
           //chuyển obj LH -> json text
           string json = JsonConvert.SerializeObject(LH);
           //phản hồi json text về trình duyệt
           this.Response.Write(json);

        }

        protected void Page_Load(object sender, EventArgs e)
        {
            //lấy biến action gửi lên
            string action = Request["action"];

            switch (action)
            {
                case "Check_login":
                    Check_login();
                    break;
                case "ds_Hd_chiTiet":
                    dsHDChiTiet();
                    break;
                case "get_allNV":
                    getAllNV();
                    break;
            }
        }
    }
}