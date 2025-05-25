export const tourSchema = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    descripcion: { type: 'string' },
    precio: { type: 'number' },
    imagen: { type: 'string' },
    duracion: { type: 'number' },
    disponible: { type: 'boolean', nullable: true },
    etiqueta: { type: 'string', nullable: true },
    tipoEtiqueta: { type: 'string', nullable: true },
    categorias: { 
      type: 'array', 
      items: { type: 'string' },
      nullable: true 
    }
  },
  required: ['titulo', 'descripcion', 'precio', 'imagen', 'duracion']
}; 