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
Alter PROCEDURE [dbo].[SP_NhanVien]
    @action varchar(15),
	@id int = null,
    @TenNV nvarchar(50) = null,
    @Password nvarchar(12) = null,
    @GT bit = null,
    @Luong float = null,
    @NgayLamViec date = null

AS
BEGIN
    if (@action = 'them_NV')
    begin
        -- Check for duplicate name 
        if exists (select * from NhanVien where TenNV = @TenNV)
        begin
            select @TenNV = TenNV from NhanVien where Password = @Password;
            RaisError('Trùng Ten NhanVien của  %s rồi!', 16, 1, @TenNV);
            return;
        end

        -- No duplicates, so insert Nhanvien ok
        insert into NhanVien (TenNV, Password, GT, Luong, ngayLamViec)
        values (@TenNV, @Password, @GT, @Luong, GETDATE());
    end
    else if (@action ='check_login')
    begin
		--check if parameter pass request ok  
      select idNV,TenNV,ngayLamViec,Luong 
	  from NhanVien where TenNV = @TenNV and Password = @Password;
    end
	else if(@action = 'get_allNV')
	begin 
		--id = 1 Admin
		select * from NhanVien where idNV > 1;
	end
	else if(@action='edit_NV')
	begin
		update NhanVien set TenNV = @TenNV,ngayLamViec=@NgayLamViec,
		Password=@Password,
		Luong=@Luong,GT=@GT 
		where idNV = @id;
	end
	else if(@action='delete_NV')
	begin
		if(@id=1)
		RaisError(N'Ko xóa được Admin',16,1);
		Delete from NhanVien where idNV = @id and idNV<>1;
	end
	else if(@action = 'ds_NV')
	begin
		select idNV,TenNV,Password,Luong,ngayLamViec,GT from NhanVien ;
	end
END
GO

---NhaCungCap===================
ALTER PROCEDURE [dbo].[SP_NhaCupCap]
	@action varchar(50) ,
	@MaNCC nvarchar(50) = null,
	@TenNCC nvarchar(100) = null,
	@DiaChi nvarchar(50) = null,
	@sdt nvarchar(12) = null
AS
BEGIN
	if(@action='themNCC')
	begin
		if exists(select * from NhaCupCap where MaNCC=@MaNCC)
		begin
			RaisError(N'bị trùng Mã Nhà cùng cấp rồi ạ!',16,1);
		end
		--
		insert into NhaCupCap(MaNCC,TenNCC,DiaChi,Sdt)
		values(@MaNCC,@TenNCC,@DiaChi,@sdt);
	end
	else if(@action='ds_NCC')
	begin
		select MaNCC,TenNCC,DiaChi,Sdt from NhaCupCap;
	end
	else if(@action='edit_NCC')
	begin
		update NhaCupCap set TenNCC=@TenNCC,DiaChi=@DiaChi,Sdt=@sdt where MaNCC=@MaNCC;
	end
	else if(@action='delete_NCC')
	begin
		Delete from NhaCupCap where MaNCC=@MaNCC;
	end
	else if(@action='showDetailNCC')
	begin
		select HN.MaNcc, HN.TenSP,HN.DVT,HN.SoLuong,HN.GiaNhap,HN.TongTien,HN.ngayNhap from NhaCupCap N  
		inner join HoaDonNhap HN on N.MaNCC = HN.MaNcc where N.MaNCC = @MaNCC;
	end
END
Go




--HoaDonNhap======================= 
--
ALTER PROCEDURE [dbo].[SP_HoaDonNhap]
	@action varchar(50), 
	@id int = null,
	@MaNCC nvarchar(50)=null,
	@TenSP nvarchar(50)=null,
	@Soluong int = null,
	@DVT nvarchar(10)=null,
	@GiaNhap float = null,
	@TongTien float = null,
	@NgayNhap date = null

AS 
BEGIN
	if(@action='ds_HDNhap')
	begin
		select id,MaNcc,TenSP,DVT,GiaNhap,SoLuong,TongTien,ngayNhap from HoaDonNhap ;
	end
	else if(@action='them_HDNhap')
	begin
		Insert into HoaDonNhap(MaNcc,TenSP,DVT,GiaNhap,SoLuong,TongTien,ngayNhap)
		values(@MaNCC,@TenSP,@DVT,@GiaNhap,@Soluong,(@Soluong*@GiaNhap),Getdate());
	end
	else if(@action='edit_HDNhap')
	begin
		Update HoaDonNhap set TenSP=@TenSP,DVT=@DVT,GiaNhap=@GiaNhap,SoLuong=@Soluong,ngayNhap=@NgayNhap,TongTien=(@Soluong*@GiaNhap) where id=@id;
	end
	else if(@action='delet_HDNhap')
	begin
		Delete from HoaDonNhap where id=@id;
	end
END
Go

--HDChiTiet==========================================================
Alter PROCEDURE [dbo].[SP_HDChiTiet]
	@action varchar(50),
	@id int = null,
	@MaHDBan nvarchar(50) = null,
	@IdSanPham int = null,
	@giamGia float = null,
	@SoLuong int = null,
	@ThanhTien float = null

AS
BEGIN
	if(@action = 'ds_Hd_chiTiet') 
	begin
		--ta cần show
		select A.id,A.MaHDBan, C.TenSp,A.idSanPam, C.DonGiaBan, A.SoLuong,A.giamGia, A.ThanhTien from HDBanChiTiet A 
		inner join HoaDonBan B on A.MaHDBan = B.MaHDBan
		inner join SanPham C on C.id = A.idSanPam
	end
	else if(@action = 'themHDChiTiet')
	begin 
		-- Insert new invoice detail 
		if((@giamGia = null)or (@giamGia=''))
		BEGIN
		set @giamGia = 0 ;
		END
		---
		INSERT INTO HDBanChiTiet (MaHDBan, idSanPam,giamGia, SoLuong, ThanhTien)
		VALUES (@MaHDBan, @IdSanPham,@giamGia, @SoLuong, ((@SoLuong * (SELECT DonGiaBan FROM SanPham WHERE id = @IdSanPham))-(@SoLuong * (SELECT DonGiaBan FROM SanPham WHERE id = @IdSanPham)*(@giamGia/100))));

		--have two way to update TongTien in Table HoaDonBan this the first way and second use Trigger
		-- Update the 'TongTien' column in the 'HoaDonBan' table when inserting a new invoice detail
		UPDATE HoaDonBan
		SET TongTien = (SELECT SUM(ThanhTien) FROM HDBanChiTiet WHERE MaHDBan = @MaHDBan)
		WHERE MaHDBan = @MaHDBan;

	end
	else if(@action = 'showDetailbyMaHDB')
	begin 
		-- danh sách chỉ tiết by MaHDB
		select A.MaHDBan, C.TenSp,A.idSanPam, C.DonGiaBan, A.SoLuong,A.giamGia, A.ThanhTien from HDBanChiTiet A 
		inner join HoaDonBan B on A.MaHDBan = B.MaHDBan
		inner join SanPham C on C.id = A.idSanPam where A.MaHDBan = 'HD01' ;
	end
	else if(@action='edit_DetailHDBChiTiet')
	begin
		update HDBanChiTiet set idSanPam=@IdSanPham,giamGia=@giamGia,SoLuong=@SoLuong,
		ThanhTien=((@SoLuong * (SELECT DonGiaBan FROM SanPham WHERE id = @IdSanPham))-(@SoLuong * (SELECT DonGiaBan FROM SanPham WHERE id = @IdSanPham)*(@giamGia/100)))
		where id=@id;
	end
	else if(@action='delete_DetailHDBChitTiet')
	begin
		Delete from HDBanChiTiet where id=@id;
	end
END
Go

--update TongTien table HOaDonBan ===============
--the Second way To update Column TongTien in Table HoaDonBan
CREATE TRIGGER TRG_UpdateTongTien
ON HDBanChiTiet
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Calculate and update the 'TongTien' column in 'HoaDonBan'
    DECLARE @MaHDBan nvarchar(50);

    -- Get the 'MaHDBan' from the inserted or deleted rows
    SELECT @MaHDBan = MaHDBan
    FROM inserted;

    -- Update 'TongTien' in 'HoaDonBan'
    UPDATE HoaDonBan
    SET TongTien = (
        SELECT SUM(ThanhTien)
        FROM HDBanChiTiet
        WHERE MaHDBan = @MaHDBan
    )
    WHERE MaHDBan = @MaHDBan;
END;
--============================



--SanPham====================================================
Alter PROCEDURE [dbo].[SP_SanPham]
	@action varchar(50) ,
	@id int = null,
	@TenSP nvarchar(50) = null,
	@DVT nvarchar(10) = null,
	@GiaBan float = null

As
BEGIN
	if(@action = 'get_all_SanPham')
	begin
		select DISTINCT id,TenSp,DVT,DonGiaBan from SanPham ;
	end
	else if(@action = 'themSanPham')
	begin
	    -- Check if @DVT is null or an empty string, and set the default value if needed
		IF (@DVT IS NULL OR @DVT = '')
        SET @DVT = 'coc';
		insert into SanPham(TenSp,DVT,DonGiaBan)
		values(@TenSP,@DVT,@GiaBan);
	end
	else if(@action = 'dsSanpham')
	begin
		select id,TenSp,DVT,DonGiaBan from SanPham ; 
	end
	else if(@action = 'edit_SanPham')
	begin
		update SanPham set TenSp=@TenSP,DVT=@DVT,DonGiaBan=@GiaBan where id = @id ;
	end
	else if(@action = 'delete_SanPham')
	begin
		Delete from SanPham where id=@id;
	end
	
END
GO

--HoaDonBan====================================
Alter PROCEDURE [dbo].[SP_HoaDonBan]
	@action varchar(50) ,
	@MaHDBan nvarchar(50) = null,
	@NhanVienID int = null,
	@ngayBan date = null,
	@TongTien float = 0

AS
BEGIN
	if(@action = 'them_HDBan')
	begin
		if exists(select MaHDBan from HoaDonBan where MaHDBan = @MaHDBan)
		begin
			RaisError(N'dublicate MaHDBan',16,1);
		end
		--insert ok not dublicate
		insert into HoaDonBan(MaHDBan,NhanVienID,ngayBan,TongTien)
		values(@MaHDBan,@NhanVienID,Getdate(), @TongTien);
	end
	else if(@action = 'auto_Generate_MaHDBan')
	begin
		DECLARE @NewMaHDBan NVARCHAR(50)
		-- Find the latest MaHDBan in the table 
		--pass value last biggest in table to variable @NewMaHD
		--and then generate increment
		 SELECT TOP 1 @NewMaHDBan = MaHDBan
		 FROM HoaDonBan
		 ORDER BY CAST(SUBSTRING(MaHDBan, 3, LEN(MaHDBan) - 2) AS INT) DESC

		-- If there are no existing MaHDBan records, start with 'HD01'
		IF @NewMaHDBan IS NULL
			SET @NewMaHDBan = 'HD01'
		ELSE
		BEGIN
			-- Extract the numeric part and increment it
			DECLARE @NumericPart INT
			SET @NumericPart = CAST(SUBSTRING(@NewMaHDBan, 3, LEN(@NewMaHDBan) - 2) AS INT) + 1

			-- Create the new MaHDBan with the incremented numeric part
			SET @NewMaHDBan = 'HD' + CAST(@NumericPart AS NVARCHAR(50))
		 END
		 -- Return the generated MaHDBan
		 SELECT @NewMaHDBan AS MaHDBan
	end
	else if(@action = 'ds_HDBan')
	begin 
		SELECT H.MaHDBan, N.TenNV, H.NhanVienID, ngayBan, TongTien
		FROM HoaDonBan H
		INNER JOIN NhanVien N ON H.NhanVienID = N.idNV
		-- Sort by numeric part of MaHDBan
		ORDER BY 
		  CASE
		  --If the substring is numeric (the condition 
		  --ISNUMERIC(SUBSTRING(H.MaHDBan, 3, LEN(H.MaHDBan))) = 1 is true), then it converts this numeric substring to an integer using CAST.
			WHEN ISNUMERIC(SUBSTRING(H.MaHDBan, 3, LEN(H.MaHDBan))) = 1
			THEN CAST(SUBSTRING(H.MaHDBan, 3, LEN(H.MaHDBan)) AS INT)
			ELSE NULL
		  END,
		  H.MaHDBan;
	end
	else if(@action = 'delete_HDB')
	begin
		Delete from HoaDonBan where MaHDBan = @MaHDBan;
	end
	else if(@action = 'update_HDB')
	begin
		update HoaDonBan set NhanVienID = @NhanVienID , ngayBan = @ngayBan
		where MaHDBan = @MaHDBan ;
	end
	else if(@action='ds_report')
	begin
		SELECT ngayBan, SUM(TongTien) AS TotalHDOneDay
		FROM HoaDonBan
		GROUP BY ngayBan --this like distinct the value is unique;
		ORDER BY ngayBan ASC;  --ASC by default 0,1.....-> 8,9....
	end
	else if(@action='ds_report_HD')
	begin
		SELECT MaHDBan,TongTien ,ngayBan
		FROM HoaDonBan WHERE ngayBan = @ngayBan ;
	end
	else if(@action='ds_report_HD_detail')
	begin
		SELECT S.TenSp, HC.SoLuong, S.DonGiaBan, HC.ThanhTien
		FROM HoaDonBan H
		LEFT JOIN HDBanChiTiet HC ON H.MaHDBan = HC.MaHDBan
		INNER JOIN SanPham S ON S.id = HC.idSanPam
		WHERE H.MaHDBan = @MaHDBan
		AND HC.MaHDBan IS NOT NULL;
		--SELECT S.TenSp,HC.SoLuong,S.DonGiaBan,HC.ThanhTien FROM HDBanChiTiet HC
		--INNER JOIN HoaDonBan H  on H.MaHDBan=HC.MaHDBan
		--INNER JOIN SanPham S on S.id=HC.idSanPam
		--WHERE H.MaHDBan=@MaHDBan;

	end
	else if(@action='Top_NVBanNhieuNhat')
	begin
		SELECT TOP 1 H.NhanVienID, COUNT(H.NhanVienID) AS HDBANDUOC,N.TenNV
		FROM HoaDonBan H
		INNER JOIN NhanVien N 
		ON N.idNV=H.NhanVienID
		GROUP BY H.NhanVienID,N.TenNV
		ORDER BY HDBANDUOC DESC --sort from Max -> minimum




	end
	else if(@action='Top_NgayBanNhieuNhat')
	begin
		SELECT TOP 1 ngayBan,
		SUM(TongTien) AS TotalHDOneDay,
		COUNT(H.TongTien) AS NgayChayNhat
		FROM HoaDonBan H
		GROUP BY ngayBan
		ORDER BY TotalHDOneDay DESC ;--Sort Max to Minimum
	end
	else if(@action='Top_SanPham')
	begin
		--Top SanPham BAN nhieu Nhat
		SELECT TOP 1 HC.idSanPam ,COUNT(HC.idSanPam) AS QuantitySoldSanPhamMAX 
		,S.TenSp
		FROM HDBanChiTiet HC
		INNER JOIN  HoaDonBan H
		ON HC.MaHDBan=H.MaHDBan
		INNER JOIN SanPham S
		ON S.id=HC.idSanPam
		GROUP BY HC.idSanPam,S.TenSp
		ORDER BY QuantitySoldSanPhamMAX DESC ;
	end

END
Go



--TongTien tinh HDban theo thang
--when end of month show it
SELECT 
    YEAR(ngayBan) AS Nam,
    MONTH(ngayBan) AS Thang,
    SUM(TongTien) AS TotalTien
FROM HoaDonBan
WHERE 
    ngayBan <= EOMONTH(GETDATE()) -- Only include records up to the end of the previous month
GROUP BY YEAR(ngayBan), MONTH(ngayBan)
HAVING MAX(ngayBan) = EOMONTH(MAX(ngayBan)) -- Ensure the maximum date in the group is the end of the month
ORDER BY YEAR(ngayBan), MONTH(ngayBan) ASC;


---totalTien HoaDonNhap
SELECT 
    YEAR(ngayNhap) AS NAM,
    MONTH(ngayNhap) AS Thang,
    SUM(TongTien) AS TotalHDNhap,
	MAX(ngayNhap) AS LastDate --get last 
FROM HoaDonNhap
WHERE 
    ngayNhap <= EOMONTH(GETDATE()) -- Only include records up to the current date
GROUP BY YEAR(ngayNhap), MONTH(ngayNhap)
HAVING MAX(ngayNhap) = EOMONTH(GETDATE()) OR GETDATE() = EOMONTH(GETDATE()) --'2023-11-30'
ORDER BY YEAR(ngayNhap), MONTH(ngayNhap) ASC;


--when end of month you can show it can show old select on new month
SELECT 
    YEAR(ngayNhap) AS NAM,
    MONTH(ngayNhap) AS Thang,
    SUM(TongTien) AS TotalHDNhap,
    MAX(ngayNhap) AS LastDate
FROM HoaDonNhap
WHERE 
      (ngayNhap <= EOMONTH(GETDATE()))
	  And MONTH(ngayNhap) != MONTH(GETDATE()) --current month not show it
GROUP BY YEAR(ngayNhap), MONTH(ngayNhap)
ORDER BY YEAR(ngayNhap), MONTH(ngayNhap) ASC;


--Last day of Current Month
SELECT EOMONTH(GETDATE())	
--====================================
--TOtalTien NhanVien
	Select SUM(Luong) AS Total
	FROM NhanVien
	GROUP by Luong
	order by Total desc;




-- Execute the stored procedure with the "them_HDBan" action
EXEC [dbo].[SP_HoaDonBan] 'ds_HDBan', @MaHDBan = 'TEST', @NhanVienID = 2,  @TongTien = 0;


