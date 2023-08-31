const CartItemModel = require("../cart-items/model");
const DeliveryAddressModel = require("../deliveryAddress/model");
const OrderModel = require("../order/model");
const OrderItemModel = require("../order-item/model");
const { Types } = require("mongoose");

const store = async (req, res, next) => {
    try {
        let { delivery_fee, deliivery_address } = req.body;
        let items = await CartItemModel.find({ user: req.user._id }).populate(
            "product"
        );
        if (!items) {
            return res.json({
                error: 1,
                message: `You're not create order because you have not items in cart`,
            });
        }

        let address = await DeliveryAddressModel.findById(deliivery_address);
        // set/rancangan/blueprint isi dari order
        let order = new OrderItemModel({
            _id: new Types.ObjectId(),
            status: "waiting payment",
            delivery_fee: delivery_fee,
            deliivery_address: {
                provinsi: address.provinsi,
                kabupaten: address.kabupaten,
                kecamatan: address.kecamatan,
                kelurahan: address.kelurahan,
                detail: address.detail,
            },
            user: req.user._id,
        });

        let orderItems = await OrderItemModel.insertMany(
            items.map((item) => ({
                ...item,
                name: item.product.name,
                qty: parseInt(item.qty),
                price: parseInt(item.product.price),
                order: order._id,
                product: item.product._id,
            }))
        );

        // push / tambah data ke tabel order
        orderItems.forEach((item) => {
            order.order_items.push(item);
        });
        order.save();
        await CartItemModel.deleteMany({ user: req.user._id });
        return res.json(order);
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
            });
        }
        // mengembalikan hasil error
        next(err);
    }
};

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10 } = req.query;
        let count = await OrderModel.find({
            user: req.user._id,
        }).countDocuments();
        let orders = await OrderModel.find({ user: req.user._id })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate("order_items")
            .sort("-createdAt");
        return res.json({
            data: orders.map((order) => order.toJSON({ virtuals: true })),
            count,
        });
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors,
            });
        }
        // mengembalikan hasil error
        next(err);
    }
};

module.exports = {
    store,
    index,
};
