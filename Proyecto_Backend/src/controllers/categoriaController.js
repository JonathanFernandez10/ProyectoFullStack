const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');
const manejarError = require('../utils/manejarError');

const crearCategoria = async (req, res) => {
    try {
        const categoria = new Categoria(req.body);
        const categoriaGuardada = await categoria.save();

        res.status(201).json({
            ok: true,
            categoria: categoriaGuardada
        });
    } catch (error) {
        manejarError(res, error, 'Error creando categoría');
    }
};

const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find().sort({ nombre: 1 });
        res.status(200).json({
            ok: true,
            categorias
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo categorías');
    }
};

const getCategoriaById = async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);
        if (!categoria) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Categoría no encontrada'
            });
        }
        res.status(200).json({
            ok: true,
            categoria
        });
    } catch (error) {
        manejarError(res, error, 'Error obteniendo la categoría');
    }
};

const actualizarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!categoria) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            categoria
        });
    } catch (error) {
        manejarError(res, error, 'Error actualizando categoría');
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const enUso = await Producto.exists({ categoria: req.params.id });
        if (enUso) {
            return res.status(409).json({
                ok: false,
                mensaje: 'No se puede eliminar: hay productos asociados a esta categoría'
            });
        }

        const categoria = await Categoria.findByIdAndDelete(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Categoría eliminada'
        });
    } catch (error) {
        manejarError(res, error, 'Error eliminando la categoría');
    }
};

module.exports = {
    crearCategoria,
    getCategorias,
    getCategoriaById,
    actualizarCategoria,
    eliminarCategoria
};
