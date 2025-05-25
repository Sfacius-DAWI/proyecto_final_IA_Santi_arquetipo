import { Type } from '@sinclair/typebox';

export const TourSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    nombre: Type.String(),
    descripcion: Type.String(),
    precio: Type.Number({ minimum: 0 }),
    duracion: Type.Number({ minimum: 1 }),
    ubicacion: Type.String(),
    fechaInicio: Type.String({ format: 'date' }),
    fechaFin: Type.String({ format: 'date' })
});

export const CreateTourSchema = Type.Object({
    nombre: Type.String(),
    descripcion: Type.String(),
    precio: Type.Number({ minimum: 0 }),
    duracion: Type.Number({ minimum: 1 }),
    ubicacion: Type.String(),
    fechaInicio: Type.String({ format: 'date' }),
    fechaFin: Type.String({ format: 'date' })
});

export const UpdateTourSchema = Type.Partial(CreateTourSchema); 