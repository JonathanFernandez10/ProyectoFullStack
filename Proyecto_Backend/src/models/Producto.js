const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },

    codigo: {
        type: String,
        required: [true, 'El código es obligatorio'],
        unique: true,

        validate: {
            validator: function(valor) {
                return /^[A-Z]{3}-\d{4}$/.test(valor);
            },

            message: props =>
                `${props.value} no cumple el formato AAA-1234`
        }
    },

    descripcion: {
        type: String,
        trim: true,
        default: ''
    },

    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true, 'La categoría es obligatoria']
    },

    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'El proveedor es obligatorio']
    },

    precio: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    },

    // Stock mínimo / punto de reorden. La cantidad real disponible vive en Inventario.
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    }

},
{
    timestamps: true
});

module.exports = mongoose.model('Producto', ProductoSchema);
