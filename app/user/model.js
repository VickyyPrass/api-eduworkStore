const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");

let userSchema = Schema(
    {
        full_name: {
            type: String,
            required: [true, "Nama harus di isi"],
            maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
            minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
        },
        customer_id: {
            type: Number,
        },
        email: {
            type: String,
            required: [true, "Email hasrus di isi"],
            maxlength: [255, "Panjang email maksimal 255 karakter"],
        },
        password: {
            type: String,
            required: [true, "Password hasrus di isi"],
            maxlength: [255, "Panjang password maksimal 255 karakter"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        token: [String],
    },
    { timestamps: true }
);

// cek validasi email yang benar
userSchema.path("email").validate(
    function (value) {
        const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
        return EMAIL_RE.test(value);
    },
    (attr) => `${attr.value} harus merupakan email yang valid`
);

// cek email sudah terdaftar atau belum
userSchema.path("email").validate(
    async function (value) {
        try {
            // (1) lakukan pencarian ke collection User berdasarkan email
            const count = await this.model("User").count({ email: value });
            // (2) kode ini mengindikasikan bahwa jika user ditemukan akan mengembalikan nilai false, jika tidak ditemukan mengen=mbalikan nilai true
            // jika false maka validasi gagal
            // jika true maka validasi berhasil
            return !count;
        } catch (err) {
            throw err;
        }
    },
    (attr) => `${attr.value} sudah terdaftar`
);

// hash password dengan bcrypt
const HASH_ROUND = 10;
userSchema.pre("save", function (next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

// menambahkan auto increment pada model
userSchema.plugin(AutoIncrement, {
    inc_field: "customer_id",
    disable_hooks: true,
});

module.exports = model("User", userSchema);
