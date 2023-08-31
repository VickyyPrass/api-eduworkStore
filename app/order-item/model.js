// file ini berisi produk apa saja yang dibeli

const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderItemSchema = Schema({
    name: {
        type: String,
        minlength: [5, "Panjang nama makanan minimal 5 karakter"],
        required: [true, "nama harus di isi"],
    },
    price: {
        type: Number,
        required: [true, "Harga item harus di isi"],
    },
    qty: {
        type: Number,
        required: [true, "Kuantitas harus di isi"],
        min: [1, "Kuantitas minimal 1"],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
    },
});

module.exports = model("Orderitem", orderItemSchema);
