const Inventario = require('../models/Inventario');
const manejarError = require('../utils/manejarError');

const POPULATE = { path: 'producto', select: 'nombre codigo precio stock' };

const getInventario = async (req, res) => {
    try {
        const { q } = req.query;

        let inventario = await Inventario.find().populate(POPULATE).sort({ fechaActualizacion: -1 });

        if (q) {
            const termino = q.toLowerCase();
            inventario = inventario.filter(item =>
                item.producto?.nombre?.toLowerCase().includes(termino) ||
                item.producto?.codigo?.toLowerCase().includes(termino) ||
                item.ubicacion?.toLowerCase().includes(termino)
            );
        }

        res.status(200).json({
            ok: true,
            inventario
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo el inventario');
    }
};

const getInventarioById = async (req, res) => {
    try {
        const item = await Inventario.findById(req.params.id).populate(POPULATE);

        if (!item) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro de inventario no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            inventario: item
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo el registro de inventario');
    }
};

/*
    Actualización manual de un registro de Inventario. Solo permite corregir la ubicación;
    la cantidadDisponible se modifica exclusivamente a través de Movimientos u Órdenes de Compra
    para mantener la trazabilidad.
*/
const actualizarInventario = async (req, res) => {
    try {
        const { ubicacion } = req.body;

        const item = await Inventario.findByIdAndUpdate(
            req.params.id,
            { ubicacion, fechaActualizacion: new Date() },
            { new: true, runValidators: true }
        ).populate(POPULATE);

        if (!item) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro de inventario no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            inventario: item
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando inventario');
    }
};

module.exports = {
    getInventario,
    getInventarioById,
    actualizarInventario
};
