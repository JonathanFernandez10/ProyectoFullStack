const mongoose = require('mongoose');

const MovimientoSchema = new mongoose.Schema({

    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },

    tipoMovimiento: {
        type: String,
        enum: {
            values: ['entrada', 'salida', 'ajuste', 'devolucion'],
            message: '{VALUE} no es un tipo de movimiento válido'
        },
        required: true
    },

    // Para entrada/salida/devolucion: cantidad a mover. Para ajuste: nuevo valor absoluto de cantidadDisponible.
    cantidad: {
        type: Number,
        required: true,
        min: [0, 'La cantidad no puede ser negativa']
    },

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    fecha: {
        type: Date,
        default: Date.now
    },

    notas: {
        type: String,
        trim: true,
        default: ''
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Movimiento', MovimientoSchema);