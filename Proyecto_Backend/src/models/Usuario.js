const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria']
    },
    rol: {
      type: String,
      enum: ['admin', 'user', 'guest', 'proveedor'],
      default: 'user'
    },

    refreshToken:
    {
    type: String,
    default: null
    },

    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    },

    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Usuario', UsuarioSchema);
