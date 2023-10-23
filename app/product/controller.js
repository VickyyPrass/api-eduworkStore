const path = require("path");
const fs = require("fs");
const config = require("../config");
const Product = require("./model");
const Category = require("../category/model");
const Tag = require("..//tags/model");

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        // cek relasi dengan tabel category
        if (payload.category) {
            let category = await Category.findOne({
                name: { $regex: payload.category, $options: "i" },
            });
            if (category) {
                payload = { ...payload, category: category._id };
            } else {
                delete payload.category;
            }
        }

        // cek relasi dengan tabel tags
        if (payload.tags && payload.tags.length > 0) {
            let tags = await Tag.find({
                name: { $in: payload.tags },
            });
            if (tags.length) {
                payload = {
                    ...payload,
                    tags: tags.map((arrTag) => arrTag._id),
                };
            } else {
                delete payload.tags;
            }
        }

        // cek file image sebelum upload
        if (req.file) {
            console.log("req.file => ", req.file);
            // konfigurasi upload image
            // 1. ambil path
            let temp_path = req.file.path;
            // 2. mengambil ekstensi file
            let originalExt =
                req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                ];
            // 3. create nama ulang file secara random dengan ekstensi yang di ambil agar tidak duplicate
            let filename = req.file.filename + "." + originalExt;
            // 4. ambil path image
            let target_path = path.resolve(
                config.rootPath,
                `public/images/products/${filename}`
            );
            // akhir konfigurasi upload

            const src = fs.createReadStream(temp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on("end", async () => {
                try {
                    // simpan data
                    let product = new Product({
                        ...payload,
                        image_url: filename,
                    });
                    await product.save();
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
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
            });

            src.on("error", async () => {
                next(err);
            });
            // akhir cek file
        } else {
            // simpan data tanpa gambar
            let product = new Product(payload);
            const insertdata = await product.save();
            return res.status(201).json(insertdata);
        }
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
        let { id } = req.params;

        if (payload.category) {
            let category = await Category.findOne({
                name: { $regex: payload.category, $options: "i" },
            });
            if (category) {
                payload = { ...payload, category: category._id };
            } else {
                delete payload.category;
            }
        }

        // cek relasi dengan tabel tags
        if (payload.tags && payload.tags.length > 0) {
            let tags = await Tag.find({
                name: { $in: payload.tags },
            });
            if (tags.length) {
                payload = {
                    ...payload,
                    tags: tags.map((arrTag) => arrTag._id),
                };
            } else {
                delete payload.tags;
            }
        }

        if (req.file) {
            console.log("req.file => ", req.file);
            // konfigurasi upload image
            let temp_path = req.file.path;
            let originalExt =
                req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                ];
            let filename = req.file.filename + "." + originalExt;
            let target_path = path.resolve(
                config.rootPath,
                `public/images/products/${filename}`
            );
            // akhir konfigurasi upload

            const src = fs.createReadStream(temp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on("end", async () => {
                try {
                    // cari gambar per ID
                    let product = await Product.findById(id);
                    // ambil data gambar per ID
                    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

                    // hapus gambar sebelumnya di lokal sesuai ID
                    if (fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage);
                    }

                    // update dan simpan data
                    const newData = { ...payload, image_url: filename };
                    product = await Product.findByIdAndUpdate(id, newData, {
                        new: true,
                        runValidators: true,
                    });
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
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
            });

            src.on("error", async () => {
                next(err);
            });
            // akhir cek file
        } else {
            // simpan data tanpa gambar
            let product = await Product.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true,
            });
            return res.status(201).json(product);
        }
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
        let product = await Product.findByIdAndDelete(req.params.id);
        let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
        // hapus gambar di lokal sesuai ID
        if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
        }
        return res.json(product);
    } catch (err) {
        next(err);
    }
};

const index = async (req, res, next) => {
    try {
        let {
            skip = 0,
            limit = "",
            q = "",
            category = "",
            tags = [],
        } = req.query;
        let criteria = {};

        if (q.length) {
            criteria = {
                ...criteria,
                name: { $regex: `${q}`, $options: "i" },
            };
        }

        if (category.length) {
            let categoryResult = await Category.findOne({
                $regex: `${category}`,
                $options: "i",
            });

            if (categoryResult) {
                criteria = { ...criteria, category: categoryResult._id };
            }
        }

        if (tags.length) {
            let tagsResult = await Tag.find({ name: { $in: tags } });

            if (tagsResult.length > 0) {
                criteria = {
                    ...criteria,
                    tags: { $in: tagsResult.map((tag) => tag._id) },
                };
            }
        }

        let count = await Product.find().countDocuments();
        let product = await Product.find()
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate("category")
            .populate("tags");
        // populate("nama field di tabel product")
        return res.json({
            data: product,
            count,
        });
    } catch (err) {
        next(err);
    }
};

const indexByID = async (req, res, next) => {
    try {
        let ObjectId = require("mongodb").ObjectId;
        let product_id = new ObjectId(req.params.id);
        let product = await Product.find({
            _id: product_id,
        })
            .populate("category")
            .populate("tags");
        return res.json({
            data: product,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    store,
    index,
    update,
    destroy,
    indexByID,
};
