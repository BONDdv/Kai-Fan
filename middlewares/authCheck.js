const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')


exports.authCheck = async (req,res, next) => {
    try{
        const headerToken = req.headers.authorization
        
        if(!headerToken) {
            return res.status(400).json({ message: "No token, Authorization"})
        }
        const token = headerToken.split(" ")[1]
        const decode = jwt.verify(token,process.env.SECRET)
        req.user = decode

        const user = await prisma.user.findFirst( {
            where : {
                email: req.user.email
            }
        })
        if(!user.enabled) {
            res.status(400).json({ message : "This account cannot access"})
        }

        // console.log("User---->", user)
        // console.log('Hello middleware')
        next()
    }catch (err) {
        console.log(err)
        res.status(500).json({ message : "Token Invalid"})
    }
}


exports.adminCheck = async( req, res, next) => {
    try{
        const {email} = req.user
        const adminUser = await prisma.user.findFirst({
            where : {
                email
            }
        })
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Admin only" });
        }        
        // console.log('admin check',adminUser)
        next()
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "Admin access denied"})
    }
}