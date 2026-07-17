export type Rol = 'admin' | 'user' | 'guest' | 'proveedor';

export interface Usuario {
    _id?: string;
    nombre: string;
    email: string;
    password?: string;
    rol: Rol;
    estado: 'activo' | 'inactivo';
    proveedor?: { _id: string; nombre: string } | string | null;
    createdAt?: string;
    updatedAt?: string;
}
