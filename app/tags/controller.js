const TagModel = require("./model");

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        let tag = new TagModel(payload);
        await tag.save();
        return res.json(tag);
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
        let payload = req.body;
        let tag = await TagModel.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true,
        });
        return res.json(tag);
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
        let tag = await TagModel.findByIdAndDelete(req.params.id);
        return res.json(tag);
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
        let tag = await TagModel.find();
        return res.json(tag);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    store,
    update,
    destroy,
    index,
};
