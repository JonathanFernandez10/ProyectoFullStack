export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'devolucion';

export interface Movimiento {
    _id?: string;
    producto: { _id: string; nombre: string; codigo: string } | string;
    tipoMovimiento: TipoMovimiento;
    cantidad: number;
    usuario?: { _id: string; nombre: string; email: string } | string;
    fecha?: string;
    notas?: string;
}
