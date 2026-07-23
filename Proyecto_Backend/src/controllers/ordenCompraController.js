const mongoose = require('mongoose');
const OrdenCompra = require('../models/OrdenCompra');
const Movimiento = require('../models/Movimiento');
const { aplicarMovimiento } = require('../services/inventarioService');
const manejarError = require('../utils/manejarError');

const POPULATE = [
    { path: 'proveedor', select: 'nombre correo telefono' },
    { path: 'producto', select: 'nombre codigo' }
];

const crearOrdenCompra = async (req, res) => {
    try {
        // Campos permitidos explícitamente. El estado inicial solo puede ser
        // 'pendiente' o 'aprobada': una orden nunca nace 'recibida' (eso saltaría
        // el movimiento de entrada automático) ni 'cancelada'.
        const { proveedor, producto, cantidad, fecha, estado } = req.body;

        const estadosIniciales = ['pendiente', 'aprobada'];
        const estadoInicial = estado === undefined ? 'pendiente' : estado;

        if (!estadosIniciales.includes(estadoInicial)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Una orden de compra solo puede crearse en estado pendiente o aprobada'
            });
        }

        const orden = new OrdenCompra({ proveedor, producto, cantidad, fecha, estado: estadoInicial });
        const ordenGuardada = await orden.save();
        await ordenGuardada.populate(POPULATE);

        res.status(201).json({
            ok: true,
            orden: ordenGuardada
        });
    } catch (error) {
        manejarError(res, error, 'Error creando orden de compra');
    }
};

const getOrdenesCompra = async (req, res) => {
    try {
        const filtro = req.usuario.rol === 'proveedor'
            ? { proveedor: req.usuario.proveedorId }
            : {};

        const ordenes = await OrdenCompra.find(filtro).populate(POPULATE).sort({ fecha: -1 });

        res.status(200).json({
            ok: true,
            ordenes
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo órdenes de compra');
    }
};

const getOrdenCompraById = async (req, res) => {
    try {
        const orden = await OrdenCompra.findById(req.params.id).populate(POPULATE);

        if (!orden) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Orden de compra no encontrada'
            });
        }

        if (req.usuario.rol === 'proveedor' && String(orden.proveedor._id) !== String(req.usuario.proveedorId)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'No tienes acceso a esta orden de compra'
            });
        }

        res.status(200).json({
            ok: true,
            orden
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo la orden de compra');
    }
};

/*
    Actualizar una orden de compra. Si el estado cambia a 'recibida', se genera automáticamente
    un Movimiento de tipo 'entrada' por la cantidad de la orden, que a su vez actualiza el
    Inventario del producto. 'recibida' es un estado TERMINAL: una orden ya recibida no puede
    modificarse (su efecto sobre el inventario ya quedó registrado y no debe revertirse).
*/
const actualizarOrdenCompra = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const ordenActual = await OrdenCompra.findById(req.params.id);

        if (!ordenActual) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Orden de compra no encontrada'
            });
        }

        // Estado terminal: bloquea tanto re-recibir como cualquier otra edición.
        if (ordenActual.estado === 'recibida') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Una orden ya recibida no puede modificarse'
            });
        }

        // Solo campos permitidos (sin dejar pasar el body completo).
        const { proveedor, producto, cantidad, fecha, estado } = req.body;
        const cambios = {};
        if (proveedor !== undefined) cambios.proveedor = proveedor;
        if (producto !== undefined) cambios.producto = producto;
        if (cantidad !== undefined) cambios.cantidad = cantidad;
        if (fecha !== undefined) cambios.fecha = fecha;
        if (estado !== undefined) cambios.estado = estado;

        const pasaARecibida = estado === 'recibida';

        // Si la recepción llega junto con un cambio de cantidad/producto en la misma
        // petición, el movimiento debe reflejar los valores finales de la orden.
        const productoFinal = cambios.producto !== undefined ? cambios.producto : ordenActual.producto;
        const cantidadFinal = cambios.cantidad !== undefined ? cambios.cantidad : ordenActual.cantidad;

        let ordenActualizada;

        await session.withTransaction(async () => {
            if (pasaARecibida) {
                await aplicarMovimiento({
                    producto: productoFinal,
                    tipoMovimiento: 'entrada',
                    cantidad: cantidadFinal
                }, session);

                await Movimiento.create([{
                    producto: productoFinal,
                    tipoMovimiento: 'entrada',
                    cantidad: cantidadFinal,
                    usuario: req.usuario.uid,
                    notas: `Generado automáticamente al recibir la orden de compra ${ordenActual._id}`
                }], { session });
            }

            ordenActual.set(cambios);
            ordenActualizada = await ordenActual.save({ session });
        });

        await ordenActualizada.populate(POPULATE);

        res.status(200).json({
            ok: true,
            orden: ordenActualizada
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando orden de compra');
    } finally {
        session.endSession();
    }
};

const eliminarOrdenCompra = async (req, res) => {
    try {
        const orden = await OrdenCompra.findById(req.params.id);

        if (!orden) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Orden de compra no encontrada'
            });
        }

        if (orden.estado === 'recibida') {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar una orden de compra ya recibida'
            });
        }

        await orden.deleteOne();

        res.status(200).json({
            ok: true,
            mensaje: 'Orden de compra eliminada'
        });
    } catch (error) {
        manejarError(res, error, 'Error eliminando la orden de compra');
    }
};

module.exports = {
    crearOrdenCompra,
    getOrdenesCompra,
    getOrdenCompraById,
    actualizarOrdenCompra,
    eliminarOrdenCompra
};