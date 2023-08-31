const ProductModel = require("../product/model");
const CartItemsModel = require("../cart-items/model");

const update = async (req, res, next) => {
    try {
        const { items } = req.body;
        const productID = items.map((item) => item.product._id);
        const products = await ProductModel.find({ id: { $in: productID } });
        let cartItems = items.map((item) => {
            let relatedProduct = products.find(
                (product) => product._id.toString() === item.product._id
            );
            return {
                product: relatedProduct._id,
                price: relatedProduct.price,
                image_url: relatedProduct.image_url,
                name: relatedProduct.name,
                user: req.user._id,
                qty: item.qty,
            };
        });
        await CartItemsModel.deleteMany({ user: req.user._id });
        await CartItemsModel.bulkWrite(
            cartItems.map((item) => {
                return {
                    updateOne: {
                        filter: {
                            user: req.user._id,
                            product: item.product,
                        },
                        update: item,
                        upsert: true,
                    },
                };
            })
        );

        return res.json(cartItems);
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
        let items = await CartItemsModel.find({ user: req.user._id }).populate(
            "product"
        );

        return res.json(items);
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
    update,
    index,
};
