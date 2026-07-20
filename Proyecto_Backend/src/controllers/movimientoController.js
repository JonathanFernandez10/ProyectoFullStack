const mongoose = require('mongoose');
const Movimiento = require('../models/Movimiento');
const { aplicarMovimiento, revertirMovimiento } = require('../services/inventarioService');
const manejarError = require('../utils/manejarError');

const POPULATE = [
    { path: 'producto', select: 'nombre codigo' },
    { path: 'usuario', select: 'nombre email' }
];

const crearMovimiento = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { producto, tipoMovimiento, cantidad, notas } = req.body;

        let movimientoGuardado;

        await session.withTransaction(async () => {
            await aplicarMovimiento({ producto, tipoMovimiento, cantidad }, session);

            const movimiento = new Movimiento({
                producto,
                tipoMovimiento,
                cantidad,
                notas,
                usuario: req.usuario.uid
            });

            movimientoGuardado = await movimiento.save({ session });
        });

        await movimientoGuardado.populate(POPULATE);

        res.status(201).json({
            ok: true,
            movimiento: movimientoGuardado
        });
    } catch (error) {
        manejarError(res, error, 'Error registrando movimiento');
    } finally {
        session.endSession();
    }
};

const getMovimientos = async (req, res) => {
    try {
        const movimientos = await Movimiento.find().populate(POPULATE).sort({ fecha: -1 });
        res.status(200).json({
            ok: true,
            movimientos
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo movimientos');
    }
};

const getMovimientoById = async (req, res) => {
    try {
        const movimiento = await Movimiento.findById(req.params.id).populate(POPULATE);
        if (!movimiento) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Movimiento no encontrado'
            });
        }
        res.status(200).json({
            ok: true,
            movimiento
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo el movimiento');
    }
};

/*
    Editar un movimiento: revierte el efecto original sobre el Inventario y aplica el nuevo.
    Los movimientos de tipo 'ajuste' no se pueden editar (no tienen un delta reversible de forma
    segura al ser una fijación de valor absoluto) - se recomienda registrar un nuevo ajuste.
*/
const actualizarMovimiento = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const movimientoActual = await Movimiento.findById(req.params.id);

        if (!movimientoActual) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Movimiento no encontrado'
            });
        }

        if (movimientoActual.tipoMovimiento === 'ajuste' || req.body.tipoMovimiento === 'ajuste') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Los movimientos de tipo ajuste no se pueden editar. Registra un nuevo ajuste para corregir el inventario.'
            });
        }

        const { producto, tipoMovimiento, cantidad, notas } = req.body;
        let movimientoActualizado;

        await session.withTransaction(async () => {
            await revertirMovimiento({
                producto: movimientoActual.producto,
                tipoMovimiento: movimientoActual.tipoMovimiento,
                cantidad: movimientoActual.cantidad
            }, session);

            await aplicarMovimiento({ producto, tipoMovimiento, cantidad }, session);

            movimientoActual.set({ producto, tipoMovimiento, cantidad, notas });
            movimientoActualizado = await movimientoActual.save({ session });
        });

        await movimientoActualizado.populate(POPULATE);

        res.status(200).json({
            ok: true,
            movimiento: movimientoActualizado
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando movimiento');
    } finally {
        session.endSession();
    }
};

const eliminarMovimiento = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const movimiento = await Movimiento.findById(req.params.id);

        if (!movimiento) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Movimiento no encontrado'
            });
        }

        if (movimiento.tipoMovimiento === 'ajuste') {
            return res.status(400).json({
                ok: false,
                mensaje: 'Los movimientos de tipo ajuste no se pueden eliminar. Registra un nuevo ajuste para corregir el inventario.'
            });
        }

        await session.withTransaction(async () => {
            await revertirMovimiento({
                producto: movimiento.producto,
                tipoMovimiento: movimiento.tipoMovimiento,
                cantidad: movimiento.cantidad
            }, session);

            await movimiento.deleteOne({ session });
        });

        res.status(200).json({
            ok: true,
            mensaje: 'Movimiento eliminado y stock revertido'
        });
    } catch (error) {
        manejarError(res, error, 'Error eliminando el movimiento');
    } finally {
        session.endSession();
    }
};

module.exports = {
    crearMovimiento,
    getMovimientos,
    getMovimientoById,
    actualizarMovimiento,
    eliminarMovimiento
};