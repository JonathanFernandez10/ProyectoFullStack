const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const ADMIN_EMAIL = 'admin@smartinventory.com';
const ADMIN_PASSWORD = 'Admin123*';

/*
    Si no existe ningún usuario con rol admin, crea uno por defecto.
    Se ejecuta una vez al arrancar el backend, después de conectar a MongoDB.
*/
const seedAdmin = async () => {
    const existeAdmin = await Usuario.findOne({ rol: 'admin' });

    if (existeAdmin) {
        console.log('Usuario admin ya existe, se omite la creación automática');
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

    await Usuario.create({
        nombre: 'Administrador',
        email: ADMIN_EMAIL,
        password: passwordHash,
        rol: 'admin',
        estado: 'activo'
    });

    console.log(`Usuario admin creado automáticamente: ${ADMIN_EMAIL}`);
};

module.exports = seedAdmin;
