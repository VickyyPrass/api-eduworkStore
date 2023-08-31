const { subject } = require("@casl/ability");
const DeliveryAdressModel = require("./model");
const { policyFor } = require("../../utils");

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        let user = req.user;
        let address = new DeliveryAdressModel({
            ...payload,
            user: user._id,
        });
        await address.save();
        return res.json(address);
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

const update = async (req, res, next) => {
    try {
        let { _id, ...payload } = req.body; // _id : id user
        let { id } = req.params; //id : id delivery address
        let address = await DeliveryAdressModel.findById(id); // search address by id
        let subjectAddress = subject("DeliveryAddress", {
            ...address,
            user_id: address.user,
        });
        let policy = policyFor(req.user);
        if (!policy.can("update", subjectAddress)) {
            return res.json({
                error: 1,
                message: "You are not allowed to modify this resource",
            });
        }

        address = await DeliveryAdressModel.findByIdAndUpdate(id, payload, {
            new: true,
        });
        res.json();
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

const destroy = async (req, res, next) => {
    try {
        let { id } = req.params;
        let address = await DeliveryAdressModel.findById(id);
        let subjectAddress = subject("DeliveryAddress", {
            ...address,
            user_id: address.user,
        });
        let policy = policyFor(req.user);
        if (!policy.can("delete", subjectAddress)) {
            return res.json({
                error: 1,
                message: "You are not allowed to delete this resource",
            });
        }
        address = await DeliveryAdressModel.findByIdAndDelete(id);
        res.json(address);
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
        let count = await DeliveryAdressModel.find({
            user: req.user._id,
        }).countDocuments();
        let address = await DeliveryAdressModel.find({ user: req.user._id })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .sort("-createdAt");

        return res.json({ data: address, count });
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
    update,
    destroy,
    index,
};
