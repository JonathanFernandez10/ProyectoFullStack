/*
    Siembra de datos de demostración para SmartInventory / Bodegas del Istmo.

    - Rellena Categorías, Proveedores, Productos (con su Inventario), Movimientos
      y Órdenes de Compra con datos coherentes entre sí.
    - El inventario de cada producto se calcula aplicando su historial de movimientos
      con la MISMA lógica que src/services/inventarioService.js (entrada/devolución suman,
      salida resta, ajuste fija el valor absoluto), de modo que la data es consistente.
    - Reemplaza los datos existentes de esas colecciones (NO toca al admin sembrado
      admin@smartinventory.com; sí elimina otros usuarios de prueba previos).

    Uso:  node scripts/seedData.js
*/
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Usuario = require('../src/models/Usuario');
const Categoria = require('../src/models/Categoria');
const Proveedor = require('../src/models/Proveedor');
const Producto = require('../src/models/Producto');
const Inventario = require('../src/models/Inventario');
const Movimiento = require('../src/models/Movimiento');
const OrdenCompra = require('../src/models/OrdenCompra');

const dias = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const passwordDemo = bcrypt.hashSync('Clave123*', 10);

// Replica la lógica de inventarioService.aplicarMovimiento sobre una cantidad.
function aplicar(cantidadActual, tipo, cantidad) {
    switch (tipo) {
        case 'entrada':
        case 'devolucion':
            return cantidadActual + cantidad;
        case 'salida':
            return cantidadActual - cantidad;
        case 'ajuste':
            return cantidad;
        default:
            return cantidadActual;
    }
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB. Sembrando datos...');

    // Eliminar índice huérfano del esquema anterior (codigo_sku, renombrado a codigo).
    try {
        await mongoose.connection.collection('productos').dropIndex('codigo_sku_1');
        console.log('Índice huérfano codigo_sku_1 eliminado.');
    } catch (e) {
        // No existe: nada que hacer.
    }

    // 1. Limpiar colecciones de dominio y usuarios de prueba (conservando al admin).
    await Promise.all([
        Categoria.deleteMany({}),
        Proveedor.deleteMany({}),
        Producto.deleteMany({}),
        Inventario.deleteMany({}),
        Movimiento.deleteMany({}),
        OrdenCompra.deleteMany({}),
        Usuario.deleteMany({ email: { $ne: 'admin@smartinventory.com' } })
    ]);

    // 2. Categorías
    const categoriasDef = [
        { nombre: 'Equipos Informáticos', descripcion: 'Computadoras, periféricos y accesorios de cómputo.' },
        { nombre: 'Ferretería y Herramientas', descripcion: 'Herramientas manuales y eléctricas para mantenimiento.' },
        { nombre: 'Suministros de Oficina', descripcion: 'Papelería y material de oficina.' },
        { nombre: 'Limpieza e Higiene', descripcion: 'Productos de limpieza y aseo institucional.' },
        { nombre: 'Electrodomésticos', descripcion: 'Equipos eléctricos para áreas comunes.' }
    ];
    const categorias = {};
    for (const c of categoriasDef) {
        categorias[c.nombre] = await Categoria.create(c);
    }

    // 3. Proveedores
    const proveedoresDef = [
        { nombre: 'Tecnología Global, S.A.', contacto: 'Ricardo Him', telefono: '507-300-1122', correo: 'ventas@tecnoglobal.com', direccion: 'Vía España, Ciudad de Panamá' },
        { nombre: 'Distribuidora Ferretera del Istmo', contacto: 'Lucía Batista', telefono: '507-260-4590', correo: 'compras@ferreteristmo.com', direccion: 'Juan Díaz, Ciudad de Panamá' },
        { nombre: 'Suministros de Oficina Panamá', contacto: 'Carlos Mendoza', telefono: '507-214-7788', correo: 'info@suministrospanama.com', direccion: 'Calle 50, Ciudad de Panamá' },
        { nombre: 'Alimentos y Consumo Masivo, S.A.', contacto: 'Ana Ruiz', telefono: '507-236-9021', correo: 'pedidos@consumomasivo.com', direccion: 'Tocumen, Ciudad de Panamá' },
        { nombre: 'Equipos Industriales Centroamérica', contacto: 'Jorge Salazar', telefono: '507-279-3344', correo: 'contacto@equiposca.com', direccion: 'Costa del Este, Ciudad de Panamá' }
    ];
    const proveedores = {};
    for (const p of proveedoresDef) {
        proveedores[p.nombre] = await Proveedor.create(p);
    }

    // 4. Usuarios (el admin sembrado se conserva; se agrega el equipo + un proveedor)
    const usuariosDef = [
        { nombre: 'Jonathan Fernández', email: 'jonathan.fernandez@bodegasdelistmo.com', rol: 'admin' },
        { nombre: 'Gabriel Domínguez', email: 'gabriel.dominguez@bodegasdelistmo.com', rol: 'user' },
        { nombre: 'Marian Zabala', email: 'marian.zabala@bodegasdelistmo.com', rol: 'user' },
        { nombre: 'Edwin González', email: 'edwin.gonzalez@bodegasdelistmo.com', rol: 'guest' }
    ];
    const usuarios = {};
    for (const u of usuariosDef) {
        usuarios[u.rol + ':' + u.nombre] = await Usuario.create({ ...u, password: passwordDemo, estado: 'activo' });
    }
    // Usuario proveedor vinculado a Tecnología Global (para el portal "Mis Órdenes").
    const usuarioProveedor = await Usuario.create({
        nombre: 'Ricardo Him (Tecnología Global)',
        email: 'proveedor@tecnoglobal.com',
        password: passwordDemo,
        rol: 'proveedor',
        estado: 'activo',
        proveedor: proveedores['Tecnología Global, S.A.']._id
    });

    const autores = [
        usuarios['admin:Jonathan Fernández'],
        usuarios['user:Gabriel Domínguez'],
        usuarios['user:Marian Zabala']
    ];
    const autor = (i) => autores[i % autores.length]._id;

    // 5. Productos + Inventario + Movimientos
    // Cada producto define su historial; el inventario final se calcula plegando ese historial.
    const productosDef = [
        { codigo: 'LAP-1001', nombre: 'Laptop Dell Inspiron 15', descripcion: 'Core i5, 16GB RAM, 512GB SSD.', cat: 'Equipos Informáticos', prov: 'Tecnología Global, S.A.', precio: 899.99, stock: 5, ubicacion: 'Pasillo A-01',
          movs: [ ['entrada', 20, 60], ['salida', 8, 30], ['salida', 9, 10] ] },
        { codigo: 'MON-1002', nombre: 'Monitor LG 24" Full HD', descripcion: 'Panel IPS 1080p, HDMI.', cat: 'Equipos Informáticos', prov: 'Tecnología Global, S.A.', precio: 189.50, stock: 8, ubicacion: 'Pasillo A-02',
          movs: [ ['entrada', 30, 55], ['salida', 12, 25] ] },
        { codigo: 'TEC-1003', nombre: 'Teclado mecánico Logitech', descripcion: 'Switches táctiles, retroiluminado.', cat: 'Equipos Informáticos', prov: 'Tecnología Global, S.A.', precio: 79.99, stock: 10, ubicacion: 'Estante B-11',
          movs: [ ['entrada', 40, 50], ['salida', 15, 20], ['devolucion', 3, 12] ] },
        { codigo: 'MOU-1004', nombre: 'Mouse inalámbrico Logitech', descripcion: 'Conexión USB 2.4GHz.', cat: 'Equipos Informáticos', prov: 'Tecnología Global, S.A.', precio: 25.99, stock: 15, ubicacion: 'Estante B-12',
          movs: [ ['entrada', 25, 50], ['salida', 20, 15] ] },
        { codigo: 'IMP-1005', nombre: 'Impresora HP LaserJet', descripcion: 'Monocromática, red y USB.', cat: 'Equipos Informáticos', prov: 'Tecnología Global, S.A.', precio: 245.00, stock: 4, ubicacion: 'Pasillo A-03',
          movs: [ ['entrada', 10, 45], ['salida', 3, 18] ] },
        { codigo: 'TAL-2001', nombre: 'Taladro Bosch 650W', descripcion: 'Percutor con maletín.', cat: 'Ferretería y Herramientas', prov: 'Distribuidora Ferretera del Istmo', precio: 120.00, stock: 6, ubicacion: 'Zona C-04',
          movs: [ ['entrada', 15, 40], ['salida', 6, 22], ['salida', 4, 8] ] },
        { codigo: 'MAR-2002', nombre: 'Martillo de uña 16oz', descripcion: 'Mango de fibra de vidrio.', cat: 'Ferretería y Herramientas', prov: 'Distribuidora Ferretera del Istmo', precio: 12.50, stock: 20, ubicacion: 'Zona C-05',
          movs: [ ['entrada', 60, 48], ['salida', 18, 20] ] },
        { codigo: 'DES-2003', nombre: 'Juego destornilladores 12 pzs', descripcion: 'Puntas planas y de estrella.', cat: 'Ferretería y Herramientas', prov: 'Distribuidora Ferretera del Istmo', precio: 18.75, stock: 15, ubicacion: 'Zona C-06',
          movs: [ ['entrada', 35, 44], ['salida', 10, 16] ] },
        { codigo: 'RES-3001', nombre: 'Resma papel bond A4', descripcion: 'Paquete de 500 hojas, 75g.', cat: 'Suministros de Oficina', prov: 'Suministros de Oficina Panamá', precio: 4.25, stock: 50, ubicacion: 'Estante D-01',
          movs: [ ['entrada', 200, 60], ['salida', 80, 30], ['salida', 40, 10] ] },
        { codigo: 'BOL-3002', nombre: 'Bolígrafo azul (caja 50)', descripcion: 'Tinta de secado rápido.', cat: 'Suministros de Oficina', prov: 'Suministros de Oficina Panamá', precio: 8.90, stock: 30, ubicacion: 'Estante D-02',
          movs: [ ['entrada', 100, 58], ['salida', 35, 26] ] },
        { codigo: 'ARC-3003', nombre: 'Archivador colgante (caja)', descripcion: 'Carpetas colgantes tamaño carta.', cat: 'Suministros de Oficina', prov: 'Suministros de Oficina Panamá', precio: 15.40, stock: 12, ubicacion: 'Estante D-03',
          movs: [ ['entrada', 40, 42], ['salida', 22, 14], ['ajuste', 15, 5] ] },
        { codigo: 'DES-4001', nombre: 'Desinfectante multiusos galón', descripcion: 'Concentrado aroma cítrico.', cat: 'Limpieza e Higiene', prov: 'Alimentos y Consumo Masivo, S.A.', precio: 6.75, stock: 25, ubicacion: 'Zona E-01',
          movs: [ ['entrada', 80, 52], ['salida', 30, 24], ['salida', 25, 9] ] },
        { codigo: 'PAP-4002', nombre: 'Papel toalla institucional', descripcion: 'Rollo de 200 metros.', cat: 'Limpieza e Higiene', prov: 'Alimentos y Consumo Masivo, S.A.', precio: 22.00, stock: 18, ubicacion: 'Zona E-02',
          movs: [ ['entrada', 50, 46], ['salida', 40, 11] ] },
        { codigo: 'MIC-5001', nombre: 'Microondas Panasonic 1.1cu', descripcion: 'Panel digital, 1100W.', cat: 'Electrodomésticos', prov: 'Equipos Industriales Centroamérica', precio: 135.00, stock: 5, ubicacion: 'Pasillo F-01',
          movs: [ ['entrada', 12, 38], ['salida', 5, 13] ] }
    ];

    const productos = {};
    let totalMovs = 0;
    for (let i = 0; i < productosDef.length; i++) {
        const d = productosDef[i];
        const producto = await Producto.create({
            nombre: d.nombre,
            codigo: d.codigo,
            descripcion: d.descripcion,
            categoria: categorias[d.cat]._id,
            proveedor: proveedores[d.prov]._id,
            precio: d.precio,
            stock: d.stock
        });
        productos[d.codigo] = producto;

        // Plegar historial para obtener la cantidad disponible final.
        let disponible = 0;
        const notasPorTipo = {
            entrada: 'Ingreso de mercancía',
            salida: 'Despacho a departamento',
            devolucion: 'Devolución de producto',
            ajuste: 'Ajuste por conteo físico'
        };
        for (let j = 0; j < d.movs.length; j++) {
            const [tipo, cantidad, diasAtras] = d.movs[j];
            disponible = aplicar(disponible, tipo, cantidad);
            await Movimiento.create({
                producto: producto._id,
                tipoMovimiento: tipo,
                cantidad,
                usuario: autor(i + j),
                fecha: dias(diasAtras),
                notas: notasPorTipo[tipo]
            });
            totalMovs++;
        }

        await Inventario.create({
            producto: producto._id,
            cantidadDisponible: disponible,
            ubicacion: d.ubicacion,
            fechaActualizacion: dias(d.movs[d.movs.length - 1][2])
        });
    }

    // 6. Órdenes de Compra en varios estados (el proveedor debe coincidir con el del producto)
    const ordenesDef = [
        { codigo: 'LAP-1001', prov: 'Tecnología Global, S.A.', cantidad: 15, estado: 'pendiente', diasAtras: 5 },
        { codigo: 'MOU-1004', prov: 'Tecnología Global, S.A.', cantidad: 30, estado: 'aprobada', diasAtras: 3 },
        { codigo: 'TAL-2001', prov: 'Distribuidora Ferretera del Istmo', cantidad: 20, estado: 'pendiente', diasAtras: 2 },
        { codigo: 'PAP-4002', prov: 'Alimentos y Consumo Masivo, S.A.', cantidad: 60, estado: 'aprobada', diasAtras: 4 },
        { codigo: 'TEC-1003', prov: 'Tecnología Global, S.A.', cantidad: 10, estado: 'recibida', diasAtras: 20 },
        { codigo: 'MAR-2002', prov: 'Distribuidora Ferretera del Istmo', cantidad: 20, estado: 'recibida', diasAtras: 18 },
        { codigo: 'IMP-1005', prov: 'Tecnología Global, S.A.', cantidad: 8, estado: 'cancelada', diasAtras: 15 },
        { codigo: 'RES-3001', prov: 'Suministros de Oficina Panamá', cantidad: 150, estado: 'pendiente', diasAtras: 6 }
    ];
    for (const o of ordenesDef) {
        await OrdenCompra.create({
            proveedor: proveedores[o.prov]._id,
            producto: productos[o.codigo]._id,
            cantidad: o.cantidad,
            estado: o.estado,
            fecha: dias(o.diasAtras)
        });
    }

    console.log('--- Siembra completada ---');
    console.log(`Categorías:  ${categoriasDef.length}`);
    console.log(`Proveedores: ${proveedoresDef.length}`);
    console.log(`Usuarios:    ${usuariosDef.length} + 1 proveedor (+ admin conservado)`);
    console.log(`Productos:   ${productosDef.length} (cada uno con su inventario)`);
    console.log(`Movimientos: ${totalMovs}`);
    console.log(`Órdenes:     ${ordenesDef.length}`);
    console.log('Credenciales de demo (todas con contraseña Clave123*):');
    console.log('  admin  -> jonathan.fernandez@bodegasdelistmo.com');
    console.log('  user   -> gabriel.dominguez@bodegasdelistmo.com / marian.zabala@bodegasdelistmo.com');
    console.log('  guest  -> edwin.gonzalez@bodegasdelistmo.com');
    console.log('  prov.  -> proveedor@tecnoglobal.com');

    await mongoose.disconnect();
    console.log('Desconectado.');
}

seed().catch((err) => {
    console.error('Error en la siembra:', err);
    process.exit(1);
});
