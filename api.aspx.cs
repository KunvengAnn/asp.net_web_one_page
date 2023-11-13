using Newtonsoft.Json;
using System;
using System.Collections;
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
        string conStr = LibConnection.AppSettingGet.ConnectionString; // connection
        
        private class Reply
        {
            public bool ok; //true ok /false error 
            public string msg; //message
        }
        private class NhanVien 
        {  //username lấy = TEnNV trong DB password = Sdt trong DB table NhanVien
            public int NhanVienID;
            public string TenNV, pass;
            public int Gt;
            public double Luong;
            public DateTime ngayLamViec;
          
        }
        
        private class HoaDonBan:NhanVien 
        {
            public string MaHDBan;
            public int NVid;
            public DateTime ngayBan;
            public double TongTien;
        }

        void them_HDBan()
        {
            Reply reply = new Reply();
            HoaDonBan HB = new HoaDonBan();
            try
            {
                HB.MaHDBan = Request["maHDBan"]; //get from input Request
                HB.NVid =Convert.ToInt32(Request["nhanVienID"]);
                //HB.ngayBan = Convert.ToDateTime(Request["ngayBan"]);

                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HoaDonBan";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "them_HDBan";
                cm.Parameters.Add("@MaHDBan", SqlDbType.NVarChar, 50).Value = HB.MaHDBan;
                cm.Parameters.Add("@NhanVienID", SqlDbType.Int, 50).Value = HB.NVid;
                //cm.Parameters.Add("@ngayBan", SqlDbType.Date, 500).Value = HB.ngayBan;
                
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    //thêm đc 1 bản ghi thành công thì n==1
                    reply.ok = true;
                }
                else
                {
                    //n<=0 là sai rồi
                    reply.ok = false;
                    reply.msg = "Lỗi rồi đó nên ko thêm được";
                }
                cm.Dispose(); //giải phóng tài nguyên thực thi sql
                cn.Close();   //đóng kết nối
                cn.Dispose(); //giải phóng tài nguyên kết nối db
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var responseObj = new { reply, HB };
            string json = JsonConvert.SerializeObject(responseObj);
            this.Response.Write(json);
        }

        //themHDBan Chi Tiet
        void ThemHDBanChiTiet()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HDChiTiet", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "themHDChiTiet";
                cm.Parameters.Add("@MaHDBan", SqlDbType.NVarChar, 50).Value = Request["MaHDBan"]; //get from input ajax 
                cm.Parameters.Add("@giamGia", SqlDbType.Float, 50).Value = Request["giamGia"];  //not yet
                cm.Parameters.Add("@IdSanPham", SqlDbType.Int, 50).Value = Request["IdSanPham"];
                cm.Parameters.Add("@SoLuong", SqlDbType.Int, 500).Value = Request["SoLuong"];
                int n = cm.ExecuteNonQuery();
                if(n > 0)
                {  //success
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Lỗi rồi không thêm HDChiTiết được 🤷‍♀️!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message + ex.GetHashCode();
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
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
            dt.Load(dr); // load hết từ dr vào dt
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
                    n.pass = r["Password"].ToString();
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
        void getOnlyMaHoaDonBanGenerate()
        {
            Reply reply = new Reply();
            List<HoaDonBan> LHDB = new List<HoaDonBan>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "auto_Generate_MaHDBan";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr); // load hết từ dr vào dt
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HoaDonBan h = new HoaDonBan();
                        h.MaHDBan = r["MaHDBan"].ToString();
                        LHDB.Add(h);
                    }
                }
                else
                {
                    reply.ok= false;
                    reply.msg = "Loi roi MaHDBan Auto Generate !!";
                }
            }
            catch (Exception ex)
            {
                reply.ok=false;
                reply.msg = ex.Message;
            }
            var responseObj = new { reply ,LHDB };
            string json = JsonConvert.SerializeObject(responseObj);
            this.Response.Write(json);
        }

        void them_NV()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhanVien";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "them_NV";
                cm.Parameters.Add("@TenNV", SqlDbType.NVarChar, 50).Value = Request["tennv"];
                cm.Parameters.Add("@Password", SqlDbType.NVarChar, 12).Value = Request["password"];
                cm.Parameters.Add("@Luong", SqlDbType.Float).Value = Request["luong"]; 
                cm.Parameters.Add("@GT", SqlDbType.Int).Value = Request["gioiTinh"];
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "add ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void ds_NV() 
        {
            Reply reply = new Reply();
            List<NhanVien> LNV = new List<NhanVien>();
            try
            {
                //username lấy = TEnNV trong DB password = Sdt trong DB table NhanVien 
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhanVien";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "ds_NV";
                //thực thi sp_ , 
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr); 
                cm.Dispose();  
                cn.Close();    
                cn.Dispose();  
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        NhanVien NV = new NhanVien();
                        NV.NhanVienID = Convert.ToInt32(r["idNV"].ToString());
                        NV.TenNV = r["TenNV"].ToString();
                        NV.pass = r["Password"].ToString();
                        NV.Gt = Convert.ToInt32(r["GT"]);
                        NV.Luong = Convert.ToDouble(r["Luong"].ToString());
                        NV.ngayLamViec = Convert.ToDateTime(r["ngayLamViec"].ToString());
                        LNV.Add(NV);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "ko có dữ liệu nhân viên!";
                }            
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = "Error code:" + ex.GetHashCode() + ex.Message;
            }
            var obj = new { reply, LNV };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void edit_NV()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhanVien";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "edit_NV";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idnv"];
                cm.Parameters.Add("@TenNV", SqlDbType.NVarChar, 50).Value = Request["tennv"];
                cm.Parameters.Add("@Password", SqlDbType.NVarChar, 12).Value = Request["password"];
                cm.Parameters.Add("@NgayLamViec", SqlDbType.Date).Value = Request["ngaylamviec"];
                cm.Parameters.Add("@Luong", SqlDbType.Float).Value = Request["luong"];
                cm.Parameters.Add("@GT", SqlDbType.Int).Value = Request["gioiTinh"];
                int n = cm.ExecuteNonQuery();
                if(n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "eidt ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }

        void delete_NV()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhanVien";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 15).Value = "delete_NV";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idnv"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }

        void ds_SanPham()
        {
            Reply reply = new Reply();
            List<SanPham> LSP = new List<SanPham>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_SanPham";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "dsSanpham";
                //thực thi sp_ , 
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        SanPham sp = new SanPham();
                        sp.idSP = Convert.ToInt32(r["id"].ToString());
                        sp.TenSP = r["TenSp"].ToString();
                        sp.DVT = r["DVT"].ToString();
                        sp.GiaBan = Convert.ToDouble(r["DonGiaBan"].ToString());
                        LSP.Add(sp);
                    }   
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "ko có dữ liệu nhân viên!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = "Error code:" + ex.GetHashCode() + ex.Message;
            }
            var obj = new { reply, LSP };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void themSanPham()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_SanPham";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "themSanPham";
                cm.Parameters.Add("@TenSP", SqlDbType.NVarChar, 50).Value = Request["tensanPham"];
                cm.Parameters.Add("@DVT", SqlDbType.NVarChar, 12).Value = Request["donviTinh"];
                cm.Parameters.Add("@GiaBan", SqlDbType.Float).Value = Request["giaBan"];
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "add ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message+ex.GetHashCode();
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void delete_sanPham()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_SanPham";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "delete_SanPham";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idsp"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }

        void edit_sanPham()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_SanPham";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "edit_SanPham";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idsp"];
                cm.Parameters.Add("@TenSP", SqlDbType.NVarChar,50).Value = Request["tensp"];
                cm.Parameters.Add("@DVT", SqlDbType.NVarChar,10).Value = Request["dvtsp"];
                cm.Parameters.Add("@GiaBan", SqlDbType.Float).Value = Request["giaBan"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        private class NhaCungCap
        {
            public string MaNCC;
            public string DiaChi, Sdt,TenNCC;
        }
        private class HOaDonNhap: NhaCungCap
        {
            public int idNCC;
            public string TenSPNCC;
            public int Soluong;
            public string DVT;
            public double GiaNhap;
            public double TongTien;
            public DateTime NgayNhap;
        }


        void DsNCC()
        {
            Reply reply = new Reply();
            List<NhaCungCap> LNCC= new List<NhaCungCap> ();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhaCupCap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_NCC";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        NhaCungCap NC = new NhaCungCap();
                        NC.MaNCC = r["MaNCC"].ToString();
                        NC.TenNCC = r["TenNCC"].ToString();
                        NC.DiaChi = r["DiaChi"].ToString();
                        NC.Sdt = r["Sdt"].ToString();
                        LNCC.Add(NC);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "ko có dữ liệu nhân viên!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = true;
                reply.msg=ex.Message;
            }
            var obj = new { reply, LNCC };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void them_ncc()
        {
            Reply reply = new Reply();
            try 
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhaCupCap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "themNCC";
                cm.Parameters.Add("@MaNCC", SqlDbType.NVarChar, 50).Value = Request["mancc"];
                cm.Parameters.Add("@TenNCC", SqlDbType.NVarChar, 100).Value = Request["tenncc"];
                cm.Parameters.Add("@DiaChi", SqlDbType.NVarChar,50).Value = Request["diachi"];
                cm.Parameters.Add("@sdt", SqlDbType.NVarChar,12).Value = Request["Sdt"];
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "add ko đuọc lỗi rồi!!";
                }
            }
            catch(Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void edit_ncc()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhaCupCap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "edit_NCC";
                cm.Parameters.Add("@MaNCC", SqlDbType.NVarChar, 50).Value = Request["mancc"];// mã need to update
                cm.Parameters.Add("@TenNCC", SqlDbType.NVarChar, 100).Value = Request["tenncc"];
                cm.Parameters.Add("@DiaChi", SqlDbType.NVarChar, 50).Value = Request["diachi"];
                cm.Parameters.Add("@sdt", SqlDbType.NVarChar, 12).Value = Request["Sdt"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void delete_ncc()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhaCupCap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "delete_NCC";
                cm.Parameters.Add("@MaNCC", SqlDbType.NVarChar,50).Value = Request["mancc"];
              

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void DsHoaDonNhap()
        {
            Reply reply = new Reply();
            List<HOaDonNhap> LHDNhap = new List<HOaDonNhap> ();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HoaDonNhap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_HDNhap";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HOaDonNhap HN = new HOaDonNhap();
                        HN.idNCC = Convert.ToInt32(r["id"].ToString());
                        HN.MaNCC =  r["MaNcc"].ToString();
                        HN.TenSPNCC = r["TenSP"].ToString();
                        HN.DVT = r["DVT"].ToString();
                        HN.GiaNhap = Convert.ToDouble(r["GiaNhap"].ToString());
                        HN.Soluong = Convert.ToInt32(r["SoLuong"].ToString());
                        HN.TongTien = Convert.ToDouble(r["TongTien"].ToString());
                        HN.NgayNhap = Convert.ToDateTime(r["ngayNhap"].ToString());
                        LHDNhap.Add(HN);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "ko có dữ liệu Hoa Đơn Nhâp!";
                }
            }
            catch(Exception ex)
            {
                reply.ok=false;
                reply.msg = ex.Message;
            }
            var obj = new { reply, LHDNhap };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void showDetailNCC()
        {
            Reply reply = new Reply();
            List<HOaDonNhap> LNCCCT = new List<HOaDonNhap>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_NhaCupCap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "showDetailNCC";
                cm.Parameters.Add("@MaNCC", SqlDbType.VarChar, 50).Value = Request["manccct"];
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HOaDonNhap HN = new HOaDonNhap();
                        HN.MaNCC = r["MaNcc"].ToString();
                        HN.TenSPNCC = r["TenSP"].ToString();
                        HN.DVT = r["DVT"].ToString();
                        HN.GiaNhap = Convert.ToDouble(r["GiaNhap"].ToString());
                        HN.Soluong = Convert.ToInt32(r["SoLuong"].ToString());
                        HN.TongTien = Convert.ToDouble(r["TongTien"].ToString());
                        HN.NgayNhap = Convert.ToDateTime(r["ngayNhap"].ToString());
                        LNCCCT.Add(HN);
                    }
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "ko có dữ liệu Hoa Đơn Nhâp ko xem chỉ tiết được !!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { reply, LNCCCT };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }
        void them_HDNhap()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HoaDonNhap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "them_HDNhap";
                cm.Parameters.Add("@MaNCC", SqlDbType.NVarChar,50).Value = Request["mancc"];
                cm.Parameters.Add("@TenSP", SqlDbType.NVarChar, 50).Value = Request["TenSP"];
                cm.Parameters.Add("@DVT", SqlDbType.NVarChar, 10).Value = Request["DVT"];
                cm.Parameters.Add("@GiaNhap", SqlDbType.NVarChar, 10).Value = Request["GiaNhap"];
                cm.Parameters.Add("@Soluong", SqlDbType.Int).Value = Request["SoLuong"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "them ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void edit_HDNcc()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HoaDonNhap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "edit_HDNhap";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idHDNhap"];
                cm.Parameters.Add("@TenSP", SqlDbType.NVarChar, 50).Value = Request["tenspNhap"];
                cm.Parameters.Add("@DVT", SqlDbType.NVarChar, 10).Value = Request["dvt"];
                cm.Parameters.Add("@Soluong", SqlDbType.Int).Value = Request["soluong"];
                cm.Parameters.Add("@GiaNhap", SqlDbType.Float).Value = Request["giaNhap"];
                cm.Parameters.Add("@NgayNhap", SqlDbType.Date).Value = Request["ngayNhap"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "edit ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void delete_HDNcc()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HoaDonNhap";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "delet_HDNhap";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idHDNhap"];   //id need to delete        

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "delete ko đuọc lỗi rồi!!";
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
     
        //
        void dsReport()
        {
            Reply reply = new Reply();
            List<HoaDonBan> LRP = new List<HoaDonBan>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_report";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if(dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach(DataRow r in dt.Rows)
                    {
                        HoaDonBan h = new HoaDonBan();
                        h.ngayBan = Convert.ToDateTime(r["ngayBan"].ToString());
                        h.TongTien = Convert.ToDouble(r["TotalHDOneDay"].ToString());
                        LRP.Add(h);
                    }
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Chưa có dữ liệu Thống kê";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { reply,LRP };
            string json = JsonConvert.SerializeObject (obj);
            this.Response.Write(json);
        }

        void showDetailHDThongke()
        {
            Reply reply = new Reply();
            List<HoaDonBan> LHR = new List<HoaDonBan>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_report_HD";
                cm.Parameters.Add("@ngayBan", SqlDbType.Date).Value = Request["dateHDThongke"];
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HoaDonBan h = new HoaDonBan();
                        h.MaHDBan = r["MaHDBan"].ToString();
                        h.TongTien = Convert.ToDouble(r["TongTien"].ToString());
                        LHR.Add(h);
                    }
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Chưa có dữ liệu HD Thống kê";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { reply, LHR };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void dsDetailHDThongkeCT()
        {
            Reply reply = new Reply();
            List<HDChiTiet> LCT = new List<HDChiTiet>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_report_HD_detail";
                cm.Parameters.Add("@MaHDBan", SqlDbType.NVarChar,50).Value = Request["mahdtk"];
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HDChiTiet c = new HDChiTiet();
                        c.TenSP = r["TenSp"].ToString();
                        c.SoLuong = Convert.ToInt32(r["SoLuong"].ToString());
                        c.GiaBan = Convert.ToDouble(r["DonGiaBan"].ToString());
                        c.ThanhTien = Convert.ToDouble(r["ThanhTien"].ToString());
                        LCT.Add(c);
                    }
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Chưa có dữ liệu HD Thống kê";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { reply, LCT };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }
        
        void Check_login()
        {
            Reply reply = new Reply();
            NhanVien nv = new NhanVien();
            try
            {
                nv.TenNV = Request["username"]; //Request username=tenNV
                nv.pass = Request["password"];
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
                cm.Parameters.Add("@Password", SqlDbType.NVarChar, 12).Value = nv.pass;

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
                    foreach(DataRow r in dt.Rows)
                    {
                        nv.NhanVienID =Convert.ToInt32(r["idNV"].ToString());
                    }
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

        public DataTable sqlGETData(string _cm,string _action)
        {
            SqlConnection cn = new SqlConnection(conStr);
            cn.Open();
            SqlCommand cm = new SqlCommand(_cm, cn);
            cm.CommandType = CommandType.StoredProcedure;
            cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = _action;
            SqlDataReader dr = cm.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(dr); // load hết từ dr vào dt
            cm.Dispose();
            cn.Close();
            cn.Dispose();
            return dt;
        }
        void getDsHoaDonBan()
        {
            Reply reply = new Reply();
            List<HoaDonBan> LHDB = new List<HoaDonBan>();
            try
            {

                DataTable dt = sqlGETData("SP_HoaDonBan", "ds_HDBan");
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach(DataRow r in dt.Rows)
                    {
                        HoaDonBan HDB = new HoaDonBan();
                        HDB.MaHDBan = r["MaHDBan"].ToString();
                        HDB.NhanVienID = Convert.ToInt32(r["NhanVienID"].ToString());
                        HDB.TenNV = r["TenNV"].ToString();
                        HDB.ngayBan = Convert.ToDateTime(r["ngayBan"].ToString());
                        HDB.TongTien = Convert.ToDouble(r["TongTien"].ToString());
                        LHDB.Add(HDB);
                    }
                }
                else
                { //this mean Danh sach hoa don ban not yet add 
                    reply.ok = true;
                }
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message+ex.GetHashCode();
            }
            var ResponeObj = new { reply, LHDB };
            string json = JsonConvert.SerializeObject(ResponeObj);
            this.Response.Write(json);
        }

        private class HDChiTiet
        {
            public string MaHD;
            public string TenSP; //SP
            public double GiaBan; //SP 
            public int idSP,SoLuong,id;
            public double ThanhTien, giamGia;
        }
        private class SanPham
        {
            public int idSP;
            public string TenSP;
            public string DVT;
            public double GiaBan;
        }
        //
        void getAllSanPham()
        {
            Reply reply = new Reply();
            List<SanPham> LSP = new List<SanPham>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_SanPham", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "get_all_SanPham";

                SqlDataReader dr = cm.ExecuteReader();
                //dt tạo trống để chuẩn bị load tất cả từ dr
                DataTable dt = new DataTable();
                dt.Load(dr); //load hết từ dr vào dt
                cm.Dispose();
                cn.Close();
                cn.Dispose();

                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        SanPham s = new SanPham();
                        s.idSP = Convert.ToInt32(r["id"].ToString());
                        s.TenSP = r["TenSp"].ToString();
                        LSP.Add(s);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "Lỗi rồi ko get SanPham Được!";
                }
            }
            catch (Exception ex)
            {
                reply.ok= false;
                reply.msg = ex.Message;
            }
            var responseObj = new { reply, LSP };
            //listOb -> Json String
            string json = JsonConvert.SerializeObject(responseObj);
            //phản hồi json text về trình duyệt
            this.Response.Write(json);
        }

        void edit_HDBChiTiet()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HDChiTiet", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "edit_DetailHDBChiTiet";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["idHDCT"]; //id need to update
                cm.Parameters.Add("@IdSanPham", SqlDbType.Int).Value = Request["idSp"];
                cm.Parameters.Add("@giamGia", SqlDbType.Float).Value = Request["giamGia"];
                cm.Parameters.Add("@SoLuong", SqlDbType.Int).Value = Request["Soluong"];

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Lỗi rồi ko thể edit Hóa Đơn Chit tiet";
                }
                cm.Dispose();
                cn.Close();
                cn.Dispose();
            }
            catch(Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }

        void delete_HDBChiTiet()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HDChiTiet", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "delete_DetailHDBChitTiet";
                cm.Parameters.Add("@id", SqlDbType.Int).Value = Request["maHDBanCT"]; //id delete

                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Lỗi rồi ko thể edit Hóa Đơn Chit tiet";
                }
                cm.Dispose();
                cn.Close();
                cn.Dispose();
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }

        void dsHDChiTiet()
        {
            List<HDChiTiet> LH = new List<HDChiTiet>();
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                string sql = "SP_HDChiTiet";
                SqlCommand cm = new SqlCommand(sql, cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "ds_Hd_chiTiet";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr); 
                cm.Dispose();  
                cn.Close();    
                cn.Dispose();  
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HDChiTiet HDCT = new HDChiTiet(); 
                        HDCT.id = Convert.ToInt32(r["id"].ToString());
                        HDCT.idSP = Convert.ToInt32(r["idSanPam"].ToString());
                        HDCT.MaHD = r["MaHDBan"].ToString();
                        HDCT.TenSP = r["TenSp"].ToString();
                        HDCT.GiaBan = Convert.ToDouble(r["DonGiaBan"].ToString());
                        HDCT.SoLuong = Convert.ToInt32(r["SoLuong"]);
                        HDCT.giamGia =Convert.ToDouble(r["giamGia"].ToString());
                        HDCT.ThanhTien = Convert.ToDouble(r["ThanhTien"]);
                        LH.Add(HDCT);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "Danh Sach HoaDon ChiTiet ko co du lieu";
                }
                  
            }
            catch(Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var responeObj = new {LH,reply };
           string json = JsonConvert.SerializeObject(responeObj);
           this.Response.Write(json);
        }

        void NVTopBan()
        {
            List<NhanVien> LN = new List<NhanVien>();
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "Top_NVBanNhieuNhat";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr); 
                cm.Dispose();  
                cn.Close();    
                cn.Dispose();  
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        NhanVien n = new NhanVien();
                        n.NhanVienID = Convert.ToInt32(r["NhanVienID"].ToString());
                        n.Gt = Convert.ToInt32(r["HDBANDUOC"].ToString());
                        n.TenNV = r["TenNV"].ToString();
                        
                        LN.Add(n);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "chưa có nhân viên giỏi nhất đâu chưa có dữ liệu!";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var responeObj = new { LN, reply };
            string json = JsonConvert.SerializeObject(responeObj);
            this.Response.Write(json);
        }


        void SanPhamTopBan()
        {
            List<SanPham> LS = new List<SanPham>();
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "Top_SanPham";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        SanPham s = new SanPham();
                        s.idSP = Convert.ToInt32(r["QuantitySoldSanPhamMAX"].ToString());
                        s.TenSP = r["TenSp"].ToString();
                        LS.Add(s);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "chưa có San Pham Ban chay nhất đâu chưa có dữ liệu!";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { LS, reply };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }

        void dateTopBan()
        {
            List<HoaDonBan> LD = new List<HoaDonBan>();
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "Top_NgayBanNhieuNhat";
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();
                cn.Close();
                cn.Dispose();
                if (dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach (DataRow r in dt.Rows)
                    {
                        HoaDonBan h = new HoaDonBan();
                        h.NhanVienID = Convert.ToInt32(r["NgayChayNhat"].ToString());
                        h.ngayBan =Convert.ToDateTime(r["ngayBan"].ToString());
                        LD.Add(h);
                    }
                }
                else
                {
                    reply.ok = true;
                    reply.msg = "chưa có San Pham Ban chay nhất đâu chưa có dữ liệu!";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message;
            }
            var obj = new { LD, reply };
            string json = JsonConvert.SerializeObject(obj);
            this.Response.Write(json);
        }
        void ShowDetailByMaHDB()
        {
            Reply reply = new Reply();
            List<HDChiTiet> LHDB = new List<HDChiTiet>();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HDChiTiet", cn);
                cm.CommandType = CommandType.StoredProcedure; //showDetailbyMaHDB
                cm.Parameters.Add("@action", SqlDbType.VarChar,50).Value = "showDetailbyMaHDB";
                cm.Parameters.Add("@MaHDBan", SqlDbType.VarChar, 50).Value = Request["maHDBan"] ;
                SqlDataReader dr = cm.ExecuteReader();
                DataTable dt = new DataTable();
                dt.Load(dr);
                cm.Dispose();  //hủy cm
                cn.Close();    //đóng kết nối
                cn.Dispose();
                if(dt.Rows.Count > 0)
                {
                    reply.ok = true;
                    foreach(DataRow r in dt.Rows)
                    {
                        HDChiTiet H = new HDChiTiet();
                        H.MaHD = r["MaHDBan"].ToString();
                        H.TenSP = r["TenSp"].ToString();
                        H.idSP = Convert.ToInt32(r["idSanPam"].ToString());
                        H.GiaBan =Convert.ToDouble(r["DonGiaBan"].ToString());
                        H.SoLuong = Convert.ToInt32(r["SoLuong"].ToString());
                        H.giamGia = Convert.ToDouble(r["giamGia"].ToString());
                        H.ThanhTien =Convert.ToDouble(r["ThanhTien"].ToString());
                        LHDB.Add(H);
                    }
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Không lấy chỉ Tiết by MaHDB được!!";
                }

            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message + ex.GetHashCode();
            }
            var responseObj = new { reply, LHDB };
            string json = JsonConvert.SerializeObject(responseObj);
            this.Response.Write(json);

        }
        void updateHoaDonBan()
        {
            Reply reply = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "update_HDB";
                cm.Parameters.Add("@MaHDBan", SqlDbType.NVarChar, 50).Value = Request["maHDBan"];
                cm.Parameters.Add("@NhanVienID", SqlDbType.Int, 50).Value = Request["nhanVienID"];
                cm.Parameters.Add("@ngayBan", SqlDbType.Date, 50).Value = Request["ngayBan"];

                //loại action này ko trả về dữ liệu dạng bảng
                //mà trả về số bản ghi bị tác động
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    reply.ok = true;
                }
                else
                {
                    reply.ok = false;
                    reply.msg = "Lỗi rồi ko thể update Hóa Đơn Bàn";
                }
                cm.Dispose();
                cn.Close();   
                cn.Dispose(); 
            }
            catch (Exception ex)
            {
                reply.ok = false;
                reply.msg = ex.Message + ex.GetHashCode();
            }
            string json = JsonConvert.SerializeObject(reply);
            this.Response.Write(json);
        }
        void DeleteHoaDonBan()
        {
            Reply r = new Reply();
            try
            {
                SqlConnection cn = new SqlConnection(conStr);
                cn.Open();
                SqlCommand cm = new SqlCommand("SP_HoaDonBan", cn);
                cm.CommandType = CommandType.StoredProcedure;
                cm.Parameters.Add("@action", SqlDbType.VarChar, 50).Value = "delete_HDB";
                cm.Parameters.Add("@MaHDBan", SqlDbType.NVarChar, 50).Value = Request["maHDBan"];

                //loại action này ko trả về dữ liệu dạng bảng
                //mà trả về số bản ghi bị tác động
                int n = cm.ExecuteNonQuery();
                if (n > 0)
                {
                    r.ok = true;
                }
                else
                {
                    r.ok = false;
                    r.msg = "Lỗi rồi ko thể Delete Hóa Đơn Bàn";
                }
                cm.Dispose();
                cn.Close();   //đóng kết nối
                cn.Dispose(); //giải 
            }
            catch (Exception ex)
            {
                r.ok = false;
                r.msg = ex.Message + ex.GetHashCode();
            }
            string json = JsonConvert.SerializeObject(r);
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
                case "them_HDBan":
                    them_HDBan();
                    break;
                case "get_all_SanPham":
                    getAllSanPham();
                    break;
                case "auto_Generate_MaHDBan":
                    getOnlyMaHoaDonBanGenerate();
                    break;
                case "themHDChiTiet":
                    ThemHDBanChiTiet();
                    break;
                case "ds_HDBan":
                    getDsHoaDonBan();
                    break;
                case "delete_HDB":
                    DeleteHoaDonBan();
                    break;
                case "update_HDB":
                    updateHoaDonBan();
                    break;
                case "showDetailbyMaHDB":
                    ShowDetailByMaHDB();
                    break;
                case "dsSanpham":
                    ds_SanPham();
                    break;
                case "ds_NV":
                    ds_NV();
                    break;
                case "ds_NCC":
                    DsNCC();
                    break;
                case "edit_DetailHDBChiTiet":
                    edit_HDBChiTiet();
                    break;
                case "delete_DetailHDBChitTiet":
                    delete_HDBChiTiet();
                    break;
                case "them_NV":
                    them_NV();
                    break;
                case "delete_NV":
                    delete_NV();
                    break;
                case "edit_NV":
                    edit_NV();
                    break;
                case "themSanPham":
                    themSanPham();
                    break;
                case "edit_SanPham":
                    edit_sanPham();
                    break;
                case "delete_SanPham":
                    delete_sanPham();
                    break;
                case "themNCC":
                    them_ncc();
                    break;
                case "them_HDNhap":
                    them_HDNhap();
                    break;
                case "ds_HDNhap":
                    DsHoaDonNhap();
                    break;
                case "edit_HDNhap":
                    edit_HDNcc();
                    break;
                case "delet_HDNhap":
                    delete_HDNcc();
                    break;
                case "edit_NCC":
                    edit_ncc();
                    break;
                case "delete_NCC":
                    delete_ncc();
                    break;
                case "showDetailNCC":
                    showDetailNCC();
                    break;
                case "ds_report":
                    dsReport();
                    break;
                case "ds_report_HD":
                    showDetailHDThongke();
                    break;
                case "ds_report_HD_detail":
                    dsDetailHDThongkeCT();
                    break;
                case "Top_NVBanNhieuNhat":
                    NVTopBan();
                    break;
                case "Top_SanPham":
                    SanPhamTopBan();
                    break;
                case "Top_NgayBanNhieuNhat":
                    dateTopBan();
                    break;
            }
        }
    }
}