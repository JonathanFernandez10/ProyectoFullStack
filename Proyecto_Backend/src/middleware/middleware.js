const jwt = require('jsonwebtoken');
const verificarToken = (req, res, next) => {
    try {
        // 1. Leer header Authorization
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token requerido'       //más adelante generalizar este  por seguridad
            });
        }
        // 2. Formato: Bearer TOKEN
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        }

        // 3. Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Guardar usuario en request
        req.usuario = decoded;

        // 5. Continuar
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    }
};

/*
    Autorización por rol. Debe usarse siempre después de verificarToken.
    Uso: router.get('/', verificarToken, verificarRol('admin', 'user'), controlador)
*/
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'No tienes permisos para realizar esta acción'
            });
        }
        next();
    };
};

module.exports = {
    verificarToken,
    verificarRol
};
