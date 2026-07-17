const mongoose = require('mongoose');

const InventarioSchema = new mongoose.Schema({

    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        unique: true
    },

    cantidadDisponible: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'La cantidad disponible no puede ser negativa']
    },

    ubicacion: {
        type: String,
        trim: true,
        default: 'Bodega Principal'
    },

    fechaActualizacion: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Inventario', InventarioSchema);
