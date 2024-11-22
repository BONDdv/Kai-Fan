const QRCode = require('qrcode');
const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ฟังก์ชันสำหรับสร้าง QR Code
exports.createQr = async (req, res) => {
    try {
        let { tableId } = req.body; // รับแค่ tableId

        if (!tableId) {
            return res.status(400).json({ message: 'Table ID missing' }); // หากไม่มี tableId
        }

        const existingQr = await prisma.table.findUnique({
            where: { number: parseInt(tableId) }
        });

        if (existingQr) {
            return res.status(400).json({ message: `Table ID ${tableId} already exists` });
        }

        // ตั้งค่า baseUrl ให้ลิงค์ไปยังหน้าเมนู
        const baseUrl = `http://localhost:9000/menu`; // แก้ไขให้ตรงกับ URL ของหน้ารายการเมนู
        const qrData = `${baseUrl}/tableId=${tableId}`; // QR Code จะลิงค์ไปยังหน้ารายการเมนูพร้อมกับ tableId

        const qrImgName = `qrcode_table${tableId}`;
        const path = `public/qrcode/${qrImgName}.png`;

        // สร้าง QR Code
        await QRCode.toFile(path, qrData);

        // อัปโหลด QR Code ไปยัง Cloudinary
        const result = await cloudinary.uploader.upload(path, {
            public_id: qrImgName,
            resource_type: 'image',
            folder: 'qr_codes'
        });

        // ลบไฟล์ QR Code ที่สร้างขึ้นชั่วคราว
        fs.unlinkSync(path);

        // บันทึกข้อมูล QR Code ลงในฐานข้อมูล
        await prisma.table.create({
            data: {
                number: parseInt(tableId),
                qrCode: result.secure_url,
                status: "available"
            },
        });

        // ตั้งค่าสถานะการสแกน QR Code ใน session
        req.session.qrScanned = true; // ตั้งค่าสถานะเมื่อมีการสแกน QR Code
        req.session.tableId = tableId; // บันทึกหมายเลขโต๊ะ

        // ส่งผลลัพธ์ URL ของ QR Code ที่อัปโหลดกลับไปที่ Frontend
        res.json({
            success: true,
            qrCodeUrl: result.secure_url,
            message: `QR Code created for Table ${tableId}`,
        });
    } catch (err) {
        console.error('Error generating QR Code:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating QR Code',
        });
    }
};

// ลบ QR Code
exports.deleteQrCode = async (req, res) => {
    const { tableId } = req.params;

    try {
        const table = await prisma.table.findUnique({
            where: { number: parseInt(tableId) },
        });

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const publicId = `qr_codes/qrcode_table${tableId}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

        await prisma.table.delete({
            where: { number: parseInt(tableId) },
        });

        res.json({ success: true, message: 'QR Code deleted successfully' });
    } catch (error) {
        console.error('Error deleting QR Code:', error);
        res.status(500).json({ success: false, message: 'Failed to delete QR Code' });
    }
};
