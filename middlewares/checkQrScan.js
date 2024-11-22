// middlewares/checkQrScanned.js
const checkQrScanned = (req, res, next) => {
    if (!req.session.qrScanned || !req.session.tableId) {
        return res.status(403).json({ message: 'You must scan QR code to access this route' });
    }
    next();
};

module.exports = checkQrScanned;
