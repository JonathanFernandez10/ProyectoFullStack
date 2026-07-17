/*
    Manejo uniforme de errores para los controladores.

    - CastError (ObjectId malformado)  -> 400 'El ID proporcionado no es válido'
    - 11000 (índice único duplicado)   -> 409 con el campo en conflicto
    - error.status definido (negocio)  -> ese status con error.message
    - ValidationError de Mongoose      -> 400 con el mensaje de validación
    - cualquier otro                   -> 500 genérico (sin filtrar detalles internos)
*/
const manejarError = (res, error, mensajeGenerico = 'Error interno del servidor') => {
    if (error.name === 'CastError') {
        return res.status(400).json({
            ok: false,
            mensaje: 'El ID proporcionado no es válido'
        });
    }

    if (error.code === 11000) {
        const campo = Object.keys(error.keyPattern || {})[0] || 'campo único';
        return res.status(409).json({
            ok: false,
            mensaje: `Ya existe un registro con ese ${campo}`
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            ok: false,
            mensaje: error.message
        });
    }

    if (error.status) {
        return res.status(error.status).json({
            ok: false,
            mensaje: error.message
        });
    }

    console.error(error);
    return res.status(500).json({
        ok: false,
        mensaje: mensajeGenerico
    });
};

module.exports = manejarError;
