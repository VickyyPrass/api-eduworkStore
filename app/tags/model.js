const mongoose = require("mongoose");
const { model, Schema } = mongoose;

let TagSchema = Schema({
    name: {
        type: String,
        minlength: [3, "Panjang nama kategori minimal 3 karakter"],
        maxlength: [20, "Panjang nama kategori maksimal 20 karakter"],
        required: [true, "Nama kategori harus di isi"],
    },
});

module.exports = model("Tag", TagSchema);
