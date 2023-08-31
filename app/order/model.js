const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);
const InvoiceModel = require("../invoice/model");

const orderSchema = Schema(
    {
        status: {
            type: String,
            enum: ["waiting payment", "processing", "in delivery", "delivered"],
            default: "waiting payment",
        },
        delivery_fee: {
            type: Number,
            default: 0,
        },
        delivery_address: {
            provinsi: {
                type: String,
                required: [true, "provinsi harus di isi"],
            },
            kabupaten: {
                type: String,
                required: [true, "kabupaten harus di isi"],
            },
            kecamatan: {
                type: String,
                required: [true, "kecamatan harus di isi"],
            },
            kelurahan: {
                type: String,
                required: [true, "kelurahan harus di isi"],
            },
            detail: { type: String },
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        order_items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    },
    { timestamps: true }
);

orderSchema.plugin(AutoIncrement, {
    inc_field: "order_number",
    disable_hooks: true,
});

// membuat tabel secara virtual
orderSchema.virtual("items_count").get(function () {
    // mengitung semua barang yang ada di order item
    return this.order_items.reduce(
        (total, item) => total + parseInt(item.qty),
        0
    );
});

// trigger untuk insert data invoice
orderSchema.post("save", async function () {
    let sub_total = this.order_items.reduce(
        (total, item) => (total += item.price * item.qty),
        0
    );

    let invoice = new InvoiceModel({
        user: this.user,
        order: this._id,
        sub_total: sub_total,
        delivery_fee: parseInt(this.delivery_fee),
        total: parseInt(sub_total + this.delivery_fee),
        delivery_address: this.delivery_address,
    });

    await invoice.save();
});

module.exports = model("Order", orderSchema);
