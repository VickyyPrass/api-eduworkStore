const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const deliveryAddressSchema = Schema(
    {
        name: {
            type: String,
            maxlength: [255, "Panjang maksimal nama alamat 255 karakter"],
            required: [true, "Nama alamat harus diisi"],
        },
        kelurahan: {
            type: String,
            required: [true, "Nama kelurahan harus diisi"],
            maxlength: [255, "Panjang maksimal nama kelurahan 255 karakter"],
        },
        kecamatan: {
            type: String,
            required: [true, "Nama kecamatan harus diisi"],
            maxlength: [255, "Panjang maksimal nama kecamatan 255 karakter"],
        },
        kabupaten: {
            type: String,
            required: [true, "Nama kabupaten harus diisi"],
            maxlength: [255, "Panjang maksimal nama kabupaten 255 karakter"],
        },
        provinsi: {
            type: String,
            required: [true, "Nama provinsi harus diisi"],
            maxlength: [255, "Panjang maksimal nama provinsi 255 karakter"],
        },
        detail: {
            type: String,
            required: [true, "Nama detail harus diisi"],
            maxlength: [1000, "Panjang maksimal nama detail 1000 karakter"],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = model("DeliveryAdress", deliveryAddressSchema);
