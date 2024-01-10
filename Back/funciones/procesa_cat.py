import sys
import os
from sqlalchemy.orm import joinedload
from sqlalchemy import func
import json
# Obtener la ruta del directorio actual del script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Obtener la ruta del directorio superior (padre)
parent_dir = os.path.join(current_dir, '..')

# Añadir el directorio padre al sys.path
sys.path.append(parent_dir)

from models.main import Categoria, CreadorCategoriaAssociation, Creador, Session


def procesar_categorias(session, creador):
    # Verificar si la biografía existe y no está vacía
    if creador.biografia:
        # Obtener el contenido de la biografía en minúsculas con casefold
        biografia_lower = creador.biografia.casefold()

        # Eliminar todas las asociaciones existentes para el creador
        session.query(CreadorCategoriaAssociation).filter_by(
            creador_id=creador.creador_id).delete()

        # Lista para almacenar las nuevas categorías asociadas
        nuevas_categorias_asociadas = []

        # Fetch all categories outside the loop
        all_categories = session.query(Categoria).all()

        # Iterar sobre las categorías existentes
        for categoria in all_categories:
            # Obtener el nombre de la categoría en minúsculas con casefold
            categoria_nombre_lower = categoria.nombre.casefold()

            # Imprimir para depuración
            print(f"Buscando {categoria_nombre_lower} en {biografia_lower}")

            # Si la categoría está en la biografía, agregarla a la lista
            if categoria_nombre_lower in biografia_lower:
                # Crear una instancia de la asociación CreadorCategoriaAssociation
                asociacion = CreadorCategoriaAssociation(
                    creador_id=creador.creador_id,
                    categoria_id=categoria.id
                )

                # Agregar la instancia de la asociación a la sesión
                session.add(asociacion)

                nuevas_categorias_asociadas.append(categoria.nombre)

        # Convertir la lista de categorías a formato JSON y asignarla a la columna correspondiente
        creador.categorias_asociadas = json.dumps(nuevas_categorias_asociadas)


# Luego, en tu script principal o donde sea que estés usando esta lógica:

with Session() as session:
    creadores = session.query(Creador).all()

    for creador in creadores:
        procesar_categorias(session, creador)

    # Guardar los cambios en la base de datos
    session.commit()
