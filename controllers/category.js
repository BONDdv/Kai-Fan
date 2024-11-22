const prisma = require("../config/prisma");
const cloudinary  = require('cloudinary').v2 ;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});





exports.create = async (req, res) => {
    try {
        const { name, image, menu = [] } = req.body;  // Default to empty array if no menu provided

        console.log('Received data:', { name, image, menu }); // Log the data

        const category = await prisma.category.create({
            data: {
                name: name,
                image: {
                    create: image.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    })),
                },
                menu: {
                    create: menu.map((item) => ({
                        // Specify the necessary fields for the Menu
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        quantity: item.quantity,
                        // If you have any other required fields, add them here
                    })),
                },
            },
        });

        console.log('Category created:', category); // Log the created category

        res.send(category);
    } catch (err) {
        console.error('Error creating category:', err); // Log any errors
        res.status(500).json({ message: 'Server error' });
    }
};


exports.addMenuToCategory = async (req, res) => {
    try {
        const { categoryId, menuId } = req.body;

        // ตรวจสอบว่า category และ menu มีอยู่หรือไม่
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        const menu = await prisma.menu.findUnique({ where: { id: menuId } });

        if (!category || !menu) {
            return res.status(404).json({ message: 'Category or Menu not found' });
        }

        // อัปเดต category ให้เชื่อมโยงกับ menu
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                menu: {
                    connect: { id: menuId },
                },
            },
        });

        return res.status(200).json(updatedCategory);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};




exports.list = async (req,res) => {
    try{
        const {count} = req.params
        const category = await prisma.category.findMany({
            take: parseInt(count),
            include: {
                image: true
            }
        })

        res.send(category)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}
// exports.listById = async (req,res) => {
//     try{
//         const {id} = req.params
//         const category = await prisma.category.findFirst({
//             where: {
//                 id: +id
//             },
            
//             include: {
//                 image: true
//             }
//         })

//         res.send(category)
//     }catch (err) {
//         console.log(err)
//         res.status(500).json( { message : 'Server error'})
//     }
// }
exports.read = async (req,res) => {
    try{
        const {id} = req.params
        const category = await prisma.category.findFirst({
           where: {
            id: Number(id)
           },
           include:{
            image: true
           }
        })
console.log("category read" , category)
        res.send(category)
    }catch (err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}

exports.update = async (req,res) => {
    try{
        const {name, image} = req.body

        await prisma.image.deleteMany({
            where: {
                id: Number(req.params.id)
            }
        })

        const category = await prisma.category.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                name,
                image: {
                    create: image.map((item)=> ({
                        asset_id : item.asset_id,
                        public_id  :item.public_id,
                        url        :item.url,      
                        secure_url :item.secure_url,
                    }))
                }
            }
        })

        // console.log(name, image)


        res.send(category)

    }catch(err) {
        console.log(err)
        res.status(500).json( { message : 'Server error'})
    }
}

exports.remove = async (req,res) => {
    try{
        const {id} = req.params
        const category = await prisma.category.findFirst({
            where: {
                id : Number(id)
            },
            include: {image:true}
        })
        if(!category) {
            return res.status(400).json({ message: "ไม่มีหมวดรายการเมนูนี้"})
        }
        const deleteImg = category.image.map( (img)=>
            new Promise((resolve, reject)=> {
                cloudinary.uploader.destroy(img.public_id, (error, result)=>{
                    if(error) {
                        reject(error)
                    }
                    else resolve(result)
                }
            )
            })
        )
        await Promise.all(deleteImg)

        await prisma.category.delete({
            where: {
                id: Number(id)
            }
        })




        res.send({name: category.name})
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


// exports.removeImage = async(req,res) => {
//     try{
//         const {public_id} = req.body
//         // console.log(public_id)
//         cloudinary.uploader.destroy(public_id, (result)=>{
//             res.send("Delete success")

//         })
//     }catch (err){
//         console.log(err)
//         res.status(500).json({ message: "Server Error"})
//     }
// }



exports.removeImage = async (req, res) => {
    try {
        const { public_id } = req.body;

        // ลบภาพจาก Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(public_id);

        // ตรวจสอบผลลัพธ์จาก Cloudinary
        if (cloudinaryResult.result !== 'ok') {
            return res.status(400).json({ message: "Error deleting image from Cloudinary" });
        }

        // ลบข้อมูลจากฐานข้อมูล MySQL
        const deletedImage = await prisma.image.deleteMany({
            where: {
                public_id: public_id, // ลบข้อมูลที่มี public_id ตรงกัน
            }
        });

        // เช็คว่ามีการลบข้อมูลในฐานข้อมูลหรือไม่
        if (deletedImage.count === 0) {
            return res.status(404).json({ message: "Image not found in database" });
        }

        // ส่งผลลัพธ์กลับไป
        res.json({ message: "Delete success" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
