const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const Inventario = require('../models/Inventario');
const Movimiento = require('../models/Movimiento');
const OrdenCompra = require('../models/OrdenCompra');
const manejarError = require('../utils/manejarError');

const POPULATE = [
    { path: 'categoria', select: 'nombre' },
    { path: 'proveedor', select: 'nombre' }
];

/*
    Crear producto. Crea automáticamente su registro de Inventario asociado.
*/
const crearProducto = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const { cantidadInicial, ubicacion, ...datosProducto } = req.body;

        let productoGuardado;

        await session.withTransaction(async () => {
            const producto = new Producto(datosProducto);
            productoGuardado = await producto.save({ session });

            await Inventario.create([{
                producto: productoGuardado._id,
                cantidadDisponible: cantidadInicial || 0,
                ubicacion: ubicacion || 'Bodega Principal'
            }], { session });
        });

        await productoGuardado.populate(POPULATE);

        res.status(201).json({
            ok: true,
            producto: productoGuardado
        });

    } catch (error) {
        manejarError(res, error, 'Error creando producto');
    } finally {
        session.endSession();
    }

};

/*
    Obtener todos
*/
const getProductos = async (req, res) => {

    try {

        const productos = await Producto.find().populate(POPULATE).sort({ nombre: 1 });

        res.status(200).json({
            ok: true,
            productos
        });

    } catch (error) {
        manejarError(res, error, 'Error obteniendo productos');
    }

};

/*
    Obtener por ID
*/
const getProductoById = async (req, res) => {

    try {

        const producto = await Producto.findById(req.params.id).populate(POPULATE);

        if (!producto) {

            return res.status(404).json({
                ok: false,
                mensaje: 'Producto no encontrado'
            });

        }

        res.status(200).json({
            ok: true,
            producto
        });

    } catch (error) {
        manejarError(res, error, 'Error obteniendo el producto');
    }

};

/*
    Actualizar producto (solo campos permitidos del modelo)
*/
const actualizarProducto = async (req, res) => {

    try {

        const { nombre, codigo, descripcion, categoria, proveedor, precio, stock } = req.body;
        const cambios = {};
        if (nombre !== undefined) cambios.nombre = nombre;
        if (codigo !== undefined) cambios.codigo = codigo;
        if (descripcion !== undefined) cambios.descripcion = descripcion;
        if (categoria !== undefined) cambios.categoria = categoria;
        if (proveedor !== undefined) cambios.proveedor = proveedor;
        if (precio !== undefined) cambios.precio = precio;
        if (stock !== undefined) cambios.stock = stock;

        const producto = await Producto.findByIdAndUpdate(
            req.params.id,
            cambios,
            {
                new: true,
                runValidators: true
            }
        ).populate(POPULATE);

        if (!producto) {

            return res.status(404).json({
                ok: false,
                mensaje: 'Producto no encontrado'
            });

        }

        res.status(200).json({
            ok: true,
            producto
        });

    } catch (error) {
        manejarError(res, error, 'Error actualizando producto');
    }

};

/*
    Eliminar producto. Bloqueado si tiene historial de movimientos u órdenes de compra.
    Si no, elimina en cascada su registro de Inventario.
*/
const eliminarProducto = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        const [tieneMovimientos, tieneOrdenes] = await Promise.all([
            Movimiento.exists({ producto: req.params.id }),
            OrdenCompra.exists({ producto: req.params.id })
        ]);

        if (tieneMovimientos || tieneOrdenes) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: el producto tiene movimientos u órdenes de compra asociadas'
            });
        }

        let productoEliminado;

        await session.withTransaction(async () => {
            productoEliminado = await Producto.findByIdAndDelete(req.params.id).session(session);

            if (productoEliminado) {
                await Inventario.deleteOne({ producto: req.params.id }).session(session);
            }
        });

        if (!productoEliminado) {

            return res.status(404).json({
                ok: false,
                mensaje: 'Producto no encontrado'
            });

        }

        res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado'
        });

    } catch (error) {
        manejarError(res, error, 'Error eliminando el producto');
    } finally {
        session.endSession();
    }

};

module.exports = {
    crearProducto,
    getProductos,
    getProductoById,
    actualizarProducto,
    eliminarProducto
};
