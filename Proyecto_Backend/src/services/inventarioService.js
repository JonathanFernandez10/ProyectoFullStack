const Inventario = require('../models/Inventario');

/*
    Aplica el efecto de un movimiento de inventario sobre el registro de Inventario
    del producto indicado, dentro de una sesión/transacción de Mongo.

    entrada / devolucion -> suma la cantidad
    salida               -> resta la cantidad (rechaza si el resultado sería negativo)
    ajuste               -> fija cantidadDisponible al valor absoluto indicado
*/
const aplicarMovimiento = async ({ producto, tipoMovimiento, cantidad }, session) => {
    const inventario = await Inventario.findOne({ producto }).session(session);

    if (!inventario) {
        const error = new Error('El producto no tiene un registro de inventario asociado');
        error.status = 404;
        throw error;
    }

    let nuevaCantidad = inventario.cantidadDisponible;

    switch (tipoMovimiento) {
        case 'entrada':
        case 'devolucion':
            nuevaCantidad += cantidad;
            break;
        case 'salida':
            nuevaCantidad -= cantidad;
            break;
        case 'ajuste':
            nuevaCantidad = cantidad;
            break;
        default: {
            const error = new Error('Tipo de movimiento no válido');
            error.status = 400;
            throw error;
        }
    }

    if (nuevaCantidad < 0) {
        const error = new Error('La operación dejaría el inventario en una cantidad negativa');
        error.status = 400;
        throw error;
    }

    inventario.cantidadDisponible = nuevaCantidad;
    inventario.fechaActualizacion = new Date();
    await inventario.save({ session });

    return inventario;
};

/*
    Revierte el efecto de un movimiento ya aplicado (usado al editar/eliminar un Movimiento).
    Es la operación inversa de aplicarMovimiento.
*/
const revertirMovimiento = async ({ producto, tipoMovimiento, cantidad }, session) => {
    const inverso = {
        entrada: 'salida',
        devolucion: 'salida',
        salida: 'entrada'
    };

    if (tipoMovimiento === 'ajuste') {
        // Un ajuste fija un valor absoluto y no tiene un inverso genérico seguro.
        // Por eso el controlador de movimientos BLOQUEA editar/eliminar ajustes
        // (la corrección se hace registrando un nuevo ajuste); esta rama solo
        // existe como salvaguarda y no debería alcanzarse en la práctica.
        return;
    }

    return aplicarMovimiento(
        { producto, tipoMovimiento: inverso[tipoMovimiento], cantidad },
        session
    );
};

module.exports = {
    aplicarMovimiento,
    revertirMovimiento
};
