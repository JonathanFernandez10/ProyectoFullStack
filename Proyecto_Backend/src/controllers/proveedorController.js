const Proveedor = require('../models/Proveedor');
const Producto = require('../models/Producto');
const OrdenCompra = require('../models/OrdenCompra');
const Usuario = require('../models/Usuario');
const manejarError = require('../utils/manejarError');

const crearProveedor = async (req, res) => {
try {
       const proveedor = new Proveedor(req.body);

       const proveedorGuardado = await proveedor.save();



       res.status(201).json({

            ok: true,
            proveedor: proveedorGuardado
        });
    } catch (error) {
        manejarError(res, error, 'Error creando proveedor');
    }
};

const getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find().sort({ nombre: 1 });
        res.status(200).json({
            ok: true,
            proveedores
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo proveedores');
    }
};

const getProveedorById = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Proveedor no encontrado'
            });
        }
        res.status(200).json({
            ok: true,
            proveedor
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo el proveedor');
    }
};

const actualizarProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!proveedor) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Proveedor no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            proveedor
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando proveedor');
    }
};

const eliminarProveedor = async (req, res) => {
    try {
        const [productoEnUso, ordenEnUso, usuarioVinculado] = await Promise.all([
            Producto.exists({ proveedor: req.params.id }),
            OrdenCompra.exists({ proveedor: req.params.id }),
            Usuario.exists({ proveedor: req.params.id })
        ]);

        if (productoEnUso || ordenEnUso) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: hay productos u órdenes de compra asociadas a este proveedor'
            });
        }

        if (usuarioVinculado) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: hay un usuario del sistema vinculado a este proveedor'
            });
        }

        const proveedor = await Proveedor.findByIdAndDelete(req.params.id);

        if (!proveedor) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Proveedor no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Proveedor eliminado'
        });
    } catch (error) {
        manejarError(res, error, 'Error eliminando el proveedor');
    }
};

module.exports = {
    crearProveedor,
    getProveedores,
    getProveedorById,
    actualizarProveedor,
    eliminarProveedor
};
