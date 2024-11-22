const express= require('express');
const { authCheck } = require('../middlewares/authCheck');
const router = express.Router();
const { changeOrderStatus, getOrderAdmin} = require("../controllers/admin");
const { createQr, deleteQrCode } = require('../controllers/createQr');


router.put('/admin/order-status', authCheck, changeOrderStatus)
router.get('/admin/orders', authCheck,getOrderAdmin)

// Route สำหรับสร้าง QR Code
router.post('/admin/create-qr', authCheck,createQr);
router.delete('/admin/create-qr/:tableId', authCheck, deleteQrCode);

// Route สำหรับดึงข้อมูล QR Code ทั้งหมด
// router.get('/admin/get-qr-codes', getAllQrCodes);




module.exports = router;