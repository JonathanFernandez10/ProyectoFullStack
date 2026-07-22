const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },

    contacto: {
        type: String,
        trim: true,
        default: ''
    },

    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },

    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido']
    },

    direccion: {
        type: String,
        trim: true,
        default: ''
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Proveedor', ProveedorSchema);