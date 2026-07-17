const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const firmarAccessToken = (usuario) => jwt.sign(
    {
        uid: usuario._id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        proveedorId: usuario.proveedor || null
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '15m'
    }
);

const firmarRefreshToken = (usuario) => jwt.sign(
    {
        uid: usuario._id
    },
    process.env.REFRESH_SECRET,
    {
        expiresIn: '7d'
    }
);

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1.  Buscar usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            // Mensaje genérico para no revelar si el correo existe (evita enumeración de usuarios).
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario o contraseña inválidos'
            });
        }

        // 2.  Validar contraseña
        const passwordValido = bcrypt.compareSync(
            password,
            usuario.password
        );
        if (!passwordValido) {
            // Mismo mensaje genérico que "usuario no existe" para no distinguir ambos casos.
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario o contraseña inválidos'
            });
        }

        // 3. Verificar estado de la cuenta (después del password para no revelar
        //    la existencia de la cuenta a quien no conoce las credenciales).
        if (usuario.estado !== 'activo') {
            return res.status(403).json({
                ok: false,
                mensaje: 'La cuenta está inactiva. Contacta a un administrador.'
            });
        }
        // 4.  Generar TOKEN
        const token = firmarAccessToken(usuario);
        const refreshToken = firmarRefreshToken(usuario);

        usuario.refreshToken = refreshToken;
        await usuario.save();

        // 5.  Respuesta (sin exponer el hash de la contraseña ni el refresh token almacenado)
        const usuarioSeguro = usuario.toObject();
        delete usuarioSeguro.password;
        delete usuarioSeguro.refreshToken;

        res.json({
            ok: true,
            usuario: usuarioSeguro,
            token,
            refreshToken
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error en login'
        });
    }
};

// REFRESH TOKEN
const refreshToken = async (req, res) => {

    try {

        // Obtener refresh token enviado por el cliente
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Refresh Token requerido'
            });
        }

        // PASO 1: Verificar firma
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
        );

        // PASO 2: Buscar usuario
        const usuario = await Usuario.findById(decoded.uid);

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // PASO 3: Verificar que el refresh token sea el mismo
        if (usuario.refreshToken !== refreshToken) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Refresh Token inválido'
            });
        }

        if (usuario.estado !== 'activo') {
            return res.status(403).json({
                ok: false,
                mensaje: 'La cuenta está inactiva'
            });
        }

        // PASO 4: Generar nuevo Access Token
        const nuevoAccessToken = firmarAccessToken(usuario);

        // PASO 5: Responder
        res.json({
            ok: true,
            accessToken: nuevoAccessToken
        });

    } catch (error) {

        res.status(401).json({
            ok: false,
            mensaje: 'Refresh Token inválido o expirado'
        });

    };
};
const logout = async (req, res) => {

    try {

        const usuario = await Usuario.findById(
            req.usuario.uid
        );

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        usuario.refreshToken = null;

        await usuario.save();

        res.json({
            ok: true,
            mensaje: 'Sesión cerrada correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error al cerrar sesión'
        });

    }

};


module.exports = {
    login,
    refreshToken,
    logout
};
