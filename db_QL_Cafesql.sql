USE [QLcafeWeb]
GO
/****** Object:  StoredProcedure [dbo].[SP_NhanVien]    Script Date: 10/25/2023 12:50:36 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
create PROCEDURE [dbo].[SP_NhanVien]
    @action varchar(15),
    -- Fields for adding a new employee
    @TenNV nvarchar(50) = null,
    @Sdt nvarchar(12) = null,
    @GT bit = null,
    @Luong float = null,
    @NgayLamViec date = null

AS
BEGIN
    if (@action = 'them_NV')
    begin
        -- Check for duplicate phone number
        if exists (select * from NhanVien where Sdt = @Sdt)
        begin
            select @TenNV = TenNV from NhanVien where Sdt = @Sdt;
            RaisError('Trùng SĐT của %s rồi!', 16, 1, @TenNV);
            return;
        end

        -- No duplicates, so insert Nhanvien ok
        insert into NhanVien (TenNV, Sdt, GT, Luong, ngayLamViec)
        values (@TenNV, @Sdt, @GT, @Luong, GETDATE());
    end
    else if (@action ='check_login')
    begin
		--check if parameter pass request ok  
      select TenNV, Sdt from NhanVien where TenNV = @TenNV and Sdt = @Sdt
    end
	else if(@action = 'get_allNV')
	begin
		select * from NhanVien where idNV > 1;
	end
	--chua xong
END
GO

--EXEC SP_NhanVien 'check_login', @TenNV = 'admin', @Sdt = '123';






--HDChiTiet==========================================================
--chua exec
Create PROCEDURE [dbo].[SP_HDChiTiet]
	@action varchar(50),
	@MaHDBan nvarchar(50) = null,
	@IdSanPham int = null,
	@SoLuong int = null,
	@ThanhTien float = null

AS
BEGIN
	if(@action = 'ds_Hd_chiTiet') 
	begin
		--Trả về danh sách mà ta cần show
		select A.MaHDBan, C.TenSp,A.idSanPam, C.DonGiaBan, A.SoLuong, A.SoLuong*C.DonGiaBan as ThanhTien from HDBanChiTiet A 
		inner join HoaDonBan B on A.MaHDBan = B.MaHDBan
		inner join SanPham C on C.id = A.idSanPam
	end
	else if(@action = 'themHDChiTiet')
	begin 
	---
		insert into HDBanChiTiet(MaHDBan,idSanPam,SoLuong,ThanhTien)
		values(@MaHDBan, @IdSanPham,@SoLuong, @ThanhTien);
	end
	---chua xong 
END
Go
EXEC SP_HDChiTiet 'ds_Hd_chiTiet';
--SanPham====================================================
--chua exec
Create PROCEDURE [dbo].[SP_SanPham]
	@action varchar(50) ,
	@TenSP nvarchar(50) = null,
	@DVT nvarchar(10) = null,
	@GiaBan float = null

As
BEGIN
	if(@action = 'get_all_SanPham')
	begin
		select id,TenSp from SanPham ;
	end
	else if(@action = 'themSanPham')
	begin
	    -- Check if @DVT is null or an empty string, and set the default value if needed
		IF (@DVT IS NULL OR @DVT = '')
        SET @DVT = 'coc';
		insert into SanPham(TenSp,DVT,DonGiaBan)
		values(@TenSP,@DVT,@GiaBan);
	end
END
GO

select * from HoaDonBan
select MaHDBan,NhanVienID,ngayBan from HoaDonBan