const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true
    },

    descripcion: {
        type: String,
        trim: true,
        default: ''
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Categoria', CategoriaSchema);
