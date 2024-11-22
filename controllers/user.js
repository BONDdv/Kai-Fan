const prisma = require("../config/prisma")
const { create } = require("./Menu")

exports.listUser = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })
        res.json(user)

        // res.send('Hello user controller')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        console.log(id, enabled)
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enabled }
        })
        res.send('Update status success')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role }
        })
        res.send('Update role success')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body
        // console.log("cart---->", cart)
        // console.log("req.user.id---->",req.user.id)

        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) }
        })
        // console.log(user)

        for (const item of cart) {
            // console.log(item)
            const menu = await prisma.menu.findUnique({
                where: { id: item.id },
                select: { quantity: true, title: true },
            })
            // console.log("item--->",item)
            // console.log("menu--->",menu)
            if (!menu || item.count > menu.quantity) {
                return res.status(400).json({
                    ok: false,
                    message: `ขออภัยรายการ ${menu?.title || 'menu'} ไม่พอลองเช็คกับร้านครับว่ามีออร์เดอร์เหลือเท่าไหร่`
                })
            }
        }

        await prisma.menuOnCart.deleteMany({
            where: {
                cart: {
                    orderById: user.id
                }
            }
        })
        await prisma.cart.deleteMany({
            where: { orderById: user.id }
        })
        let menu = cart.map((item) => ({
            menuId: item.id,
            count: item.count,
            price: item.price
        }))
        // console.log("menu---->", menu)
        let cartTotal = menu.reduce((sum, item) =>
            sum + item.price * item.count, 0)

        const newCart = await prisma.cart.create({
            data: {
                menu: {
                    create: menu
                },
                cartTotal: cartTotal,
                orderById: user.id
            }
        })

        console.log(newCart)
        res.send('Add Cart')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getUserCart = async (req, res) => {
    try {
        // ตรวจสอบว่า req.user.id มีค่า
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // ดึงข้อมูลตะกร้าสำหรับผู้ใช้
        const cart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id),
            },
            include: {
                menu: {
                    include: {
                        menu: true,
                    },
                },
            },
        });
        console.log(req.user)
        // ดีบักค่าของ cart
        console.log("Retrieved cart:", cart);

        // ตรวจสอบว่า cart เป็น null หรือไม่
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // ตรวจสอบว่ามีเมนูในตะกร้าหรือไม่
        if (!cart.menu || cart.menu.length === 0) {
            return res.status(200).json({ message: "Cart is empty", cartTotal: 0 });
        }

        // ส่งข้อมูลกลับ
        res.json({
            menu: cart.menu,
            cartTotal: cart.cartTotal,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};



exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderById: Number(req.user.id) }
        })
        if (!cart) {
            return res.status(400).json({ message: 'No cart' })
        }
        await prisma.menuOnCart.deleteMany({
            where: { cartId: cart.id }
        })
        const result = await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        })
        console.log(result)
        res.send({
            message: 'Cart Empty success',
            deletedCount: result.count
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        res.json({ ok: true, message: "address update sucess" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.saveOrder = async (req, res) => {
    try {
        const { id, amount, status, currency } = req.body.paymentIntent;
        const userCart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            },
            include: { menu: true }
        });

        if (!userCart || userCart.menu.length === 0) {
            return res.status(400).json({ ok: false, message: "Cart is Empty" });
        }

        const amountTHB = Number(amount) / 100;  // Convert amount to THB

        // Create the order
        const order = await prisma.order.create({
            data: {
                menu: {
                    create: userCart.menu.map((item) => ({
                        menuId: item.menuId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderBy: {
                    connect: { id: req.user.id },
                },
                cartTotal: userCart.cartTotal,
                stripePaymentId: id,
                amount: amountTHB,
                status: status,
                currency: currency,
            },
        });

        // Update menu stock based on the order
        const update = userCart.menu.map((item) => ({
            where: { id: item.menuId },
            data: {
                quantity: { decrement: item.count },
                sold: { increment: item.count }
            }
        }));

        await Promise.all(
            update.map((updated) => prisma.menu.update(updated))
        );

        // Empty the cart after the order is placed
        await prisma.cart.deleteMany({
            where: { orderById: Number(req.user.id) }
        });

        res.json({ ok: true, order });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.getOrder = async (req, res) => {
    try {
        const order = await prisma.order.findMany({
            where: { orderById: Number(req.user.id) },
            include: {
                menu: {
                    include: {
                        menu: true
                    }
                }
            }
        })
        if (order.length === 0) {
            return res.status(400).json({ ok: false, message: 'No order' })
        }

        res.json({ ok: true, order })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}