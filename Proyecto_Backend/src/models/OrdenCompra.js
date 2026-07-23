const mongoose = require('mongoose');

const OrdenCompraSchema = new mongoose.Schema({

    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: true
    },

    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },

    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser mayor a 0']
    },

    fecha: {
        type: Date,
        default: Date.now
    },

    estado: {
        type: String,
        enum: {
            values: ['pendiente', 'aprobada', 'recibida', 'cancelada'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'pendiente'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('OrdenCompra', OrdenCompraSchema);