const router = require("express").Router();
const multer = require("multer");
const os = require("os");
const upload = multer({ dest: os.tmpdir() }).single("image");
const productController = require("./controller");
const { police_check } = require("../../middlewares");

router.get("/products", productController.index);

router.post(
    "/products",
    upload,
    police_check("create", "Product"),
    productController.store
);

router.put(
    "/products/:id",
    upload,
    police_check("update", "Product"),
    productController.update
);

router.delete(
    "/products/:id",
    police_check("delete", "Product"),
    productController.destroy
);

module.exports = router;
