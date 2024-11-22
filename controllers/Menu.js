
const prisma = require("../config/prisma")
const cloudinary  = require('cloudinary').v2 ;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



exports.create = async (req,res) => {
    try{
       const { title, description, price, quantity, image, categoryId} = req.body
    //    console.log(req.body)
        // console.log(title, description, price, quantity, image)
        const menu = await prisma.menu.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                image:{
                    create: image.map((item)=>({
                        asset_id : item.asset_id,
                        public_id  :item.public_id,
                        url        :item.url,      
                        secure_url :item.secure_url,
                    }))
                }
                
            }
        })


        res.send(menu)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
exports.list = async (req,res) => {
    try{
        const {count} = req.params
        const menu = await prisma.menu.findMany({
            take: parseInt(count),
            include: {
                category: true,
                image: true
            }
        })
       

        res.send(menu)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
exports.read = async (req,res) => {
    try{
        const {id} = req.params
        const menu = await prisma.menu.findFirst({
           where: {
            id: Number(id)
           },
            include: {
                category: true,
                image: true
            }
        })
       

        res.send(menu)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
exports.update = async (req,res) => {
    try{
        const { title, description, price, quantity, image, categoryId} = req.body
        // console.log(title, description, price, quantity, image)

        await prisma.image.deleteMany({
            where: {
                menuId: Number(req.params.id)
            }
        })
        const menu = await prisma.menu.update({
            where:{
                id:Number(req.params.id)
            },
            data: {
                title,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                image:{
                    create: image.map((item)=>({
                        asset_id : item.asset_id,
                        public_id  :item.public_id,
                        url        :item.url,      
                        secure_url :item.secure_url,
                    }))
                }
                
            }
        })


        res.send(menu)

       

        
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
exports.remove = async (req,res) => {
    try{
       const { id } = req.params

       const menu = await prisma.menu.findFirst({
        where : { id: Number(id) },
        include : {image: true}
       })
       if(!menu) {
        return res.status(400).json({ message: 'Menu not found'})
       }
    //    console.log("Menu---->",menu)

       const deleteImg = menu.image.map((img)=> 
            new Promise((resolve, reject)=> {
                cloudinary.uploader.destroy(img.public_id, (error, result) =>{
                    if(error) {
                        reject(error)
                    }
                        else resolve(result)
                })
            })
    )
    await Promise.all(deleteImg)

       await prisma.menu.delete({
        where:{
            id: Number(id)
        }
       })

        res.send("Delete Menu")
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
exports.listBy = async (req,res) => {
    try{
        const { sort, order, limit } = req.body
        
        const menus = await prisma.menu.findMany({
            take: limit,
            orderBy: {[sort]:order},
            include: {category: true}
        })
       

        res.send(menus)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}


const hdlQery = async (req, res, query)=> {
    try{
        const menus = await prisma.menu.findMany({
            where: {
                title: {
                    contains: query,
                }
            },
            include : {
                category: true,
                image : true
            }

        })
        res.send(menus)
    }catch (err){
        console.log(err)
        res.status(500).json({ message:"Search Error"})
    }
}

const hdlCategory = async (req,res,categoryId) => {
    try { const menu = await prisma.menu.findMany({
        where: {
            categoryId: {
                in : categoryId.map((id)=> Number(id))
            }
        },
        include: {
            category:true,
            image: true
        }
    })
    res.send(menu)
} catch (err){
    console.log(err)
    res.status(500).json({ message : "Server error"})
}
}


exports.searchFilters = async (req,res) => {
    try{
        const { query, category } = req.body

        if(query) {
            // console.log('query-->', query)
            await hdlQery(req,res,query)
        }
        if(category) {
            // console.log("category-->", category)
            await hdlCategory(req,res, category)
        }
       

        // res.send("Search Menu")
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}





exports.createImage = async (req, res) => {
    try {
        
        if (!req.body.image) {
            return res.status(400).json({ message: "No image provided" });
        }

        // console.log("data form backend",req.body.image)
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `BB-${Date.now()}`, 
            resource_type: 'auto', 
            folder: 'Food_KaiFan' 
        });

        
        res.send(result)
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: "Server Error", error: err.message }); 
    }
};


exports.removeImage = async(req,res) => {
    try{
        const {public_id} = req.body
        // console.log(public_id)
        cloudinary.uploader.destroy(public_id, (result)=>{
            res.send("Delete success")

        })
    }catch (err){
        console.log(err)
        res.status(500).json({ message: "Server Error"})
    }
}