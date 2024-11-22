const express = require('express');
const router = express.Router();
const { create, list, remove, update, read, createImage, removeImage, addMenuToCategory,  } = require('../controllers/category')
const { authCheck, adminCheck } = require('../middlewares/authCheck');
const { createQr } = require('../controllers/createQr');


router.post('/category', authCheck, adminCheck ,create)
router.get('/categoryAll/:count', list)
router.get('/category/:id', read)
router.put('/category/:id', update)  //add authCheck
router.delete('/category/:id' , authCheck, adminCheck,remove)

router.post('/images-category', createImage) //add authCheck
router.post('/remove-images-category', removeImage) //add authCheck

router.post('/category/add-menu', authCheck, adminCheck, addMenuToCategory);



module.exports = router;