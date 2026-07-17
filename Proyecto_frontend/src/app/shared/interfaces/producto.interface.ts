export interface Producto {
    _id?: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
    categoria: { _id: string; nombre: string } | string;
    proveedor: { _id: string; nombre: string } | string;
    precio: number;
    stock: number;
    cantidadInicial?: number;
    ubicacion?: string;
    createdAt?: string;
    updatedAt?: string;
}
