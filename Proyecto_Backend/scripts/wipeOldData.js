/*
    Limpieza única de los datos de prueba del esquema anterior (CRM) antes de migrar
    a SmartInventory. Borra TODOS los documentos de usuarios y productos existentes.
    Uso: node scripts/wipeOldData.js
*/
require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const db = mongoose.connection.db;

    const usuarios = await db.collection('usuarios').deleteMany({});
    const productos = await db.collection('productos').deleteMany({});

    console.log(`usuarios eliminados: ${usuarios.deletedCount}`);
    console.log(`productos eliminados: ${productos.deletedCount}`);

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
