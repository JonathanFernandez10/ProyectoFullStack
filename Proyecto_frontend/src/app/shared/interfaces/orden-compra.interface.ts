export type EstadoOrden = 'pendiente' | 'aprobada' | 'recibida' | 'cancelada';

export interface OrdenCompra {
    _id?: string;
    proveedor: { _id: string; nombre: string; correo: string; telefono: string } | string;
    producto: { _id: string; nombre: string; codigo: string } | string;
    cantidad: number;
    fecha?: string;
    estado: EstadoOrden;
}
