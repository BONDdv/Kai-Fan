const express = require('express');
const { create, list, remove, listBy, searchFilters, update, read, createImage, removeImage} = require('../controllers/Menu');
const router = express.Router();
const { authCheck, adminCheck} = require('../middlewares/authCheck')

router.post('/menu', create)
router.get('/menus/:count',list)
router.get('/menu/:id',read)
router.put('/menu/:id',update)
router.delete('/menu/:id',remove)
router.post('/menuBy',listBy)
router.post('/search/filters',searchFilters)

router.post('/images', authCheck, adminCheck,createImage)
router.post('/remove-images', authCheck, adminCheck,removeImage)


module.exports = router