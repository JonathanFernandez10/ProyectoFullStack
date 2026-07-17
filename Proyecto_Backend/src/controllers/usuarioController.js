const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const manejarError = require('../utils/manejarError');

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, estado, proveedor } = req.body;

    if (rol === 'proveedor' && !proveedor) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Un usuario con rol proveedor debe estar vinculado a un proveedor'
      });
    }

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordHash,
      rol,
      estado,
      proveedor: rol === 'proveedor' ? proveedor : null
    });

    const usuarioGuardado = await nuevoUsuario.save();
    const usuarioSeguro = usuarioGuardado.toObject();
    delete usuarioSeguro.password;
    delete usuarioSeguro.refreshToken;

    res.status(201).json({
      ok: true,
      usuario: usuarioSeguro
    });

  } catch (error) {
    manejarError(res, error, 'Error al crear usuario');
  }
};

/*
    Obtener todos los usuarios
*/
const getUsers = async (req, res) => {
    try {
        const users = await Usuario.find()
            .select('-password -refreshToken')
            .populate('proveedor', 'nombre');
        res.status(200).json({
            ok: true,
            usuarios: users
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo usuarios');
    }
};

/*
    Obtener usuario por ID
*/
const getUserById = async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id)
            .select('-password -refreshToken')
            .populate('proveedor', 'nombre');
        if (!user) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            ok: true,
            usuario: user
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo usuario');
    }
};

/*
    Actualizar usuario
*/
const actualizarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, estado, proveedor } = req.body;

        // Solo se actualizan los campos presentes en la petición; el vínculo
        // con proveedor únicamente se toca cuando la petición incluye el rol.
        const cambios = {};
        if (nombre !== undefined) cambios.nombre = nombre;
        if (email !== undefined) cambios.email = email;
        if (estado !== undefined) cambios.estado = estado;
        if (rol !== undefined) {
            if (rol === 'proveedor' && !proveedor) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Un usuario con rol proveedor debe estar vinculado a un proveedor'
                });
            }
            cambios.rol = rol;
            cambios.proveedor = rol === 'proveedor' ? proveedor : null;
        }

        if (password) {
            const salt = bcrypt.genSaltSync(10);
            cambios.password = bcrypt.hashSync(password, salt);
        }

        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            cambios,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            usuario
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando usuario');
    }
};

/*
    Eliminar usuario
*/
const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado'
        });
    } catch (error) {
        manejarError(res, error, 'Error eliminando usuario');
    }
};


module.exports = {
  crearUsuario,
  getUsers,
  getUserById,
  actualizarUsuario,
  eliminarUsuario
};
