export interface Inventario {
    _id?: string;
    producto: { _id: string; nombre: string; codigo: string; precio: number; stock: number } | string;
    cantidadDisponible: number;
    ubicacion: string;
    fechaActualizacion?: string;
}
