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

def normalizar_texto(texto):
    return texto.replace('/', '')

def procesar_categorias(session, creador):
    """
    Procesa y asocia categorías a un creador basado en su biografía.
    """
    # Verificar si la biografía existe y no está vacía
    if creador.estado == "actualizado" and creador.biografia:
        # Normalizar y obtener el contenido de la biografía en minúsculas
        biografia_normalizada = normalizar_texto(creador.biografia).casefold()

        # Eliminar todas las asociaciones existentes para el creador
        session.query(CreadorCategoriaAssociation).filter_by(
            creador_id=creador.creador_id).delete()

        # Lista para almacenar las nuevas categorías asociadas
        nuevas_categorias_asociadas = []

        # Fetch all categories outside the loop
        all_categories = session.query(Categoria).all()

        # Iterar sobre las categorías existentes
        for categoria in all_categories:
            # Normalizar el nombre de la categoría
            categoria_nombre_normalizado = normalizar_texto(categoria.nombre).casefold()

            # Si la categoría está en la biografía, agregarla a la lista
            if categoria_nombre_normalizado in biografia_normalizada:
                # Crear una instancia de la asociación CreadorCategoriaAssociation
                asociacion = CreadorCategoriaAssociation(
                    creador_id=creador.creador_id,
                    categoria_id=categoria.id
                )

                # Agregar la instancia de la asociación a la sesión
                session.add(asociacion)

                nuevas_categorias_asociadas.append(categoria.nombre)

        # Asignar la lista directamente a la columna JSON
        creador.categorias_asociadas = nuevas_categorias_asociadas

# Obtener la ruta del directorio actual del script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Obtener la ruta del directorio superior (padre)
parent_dir = os.path.join(current_dir, '..')

# Añadir el directorio padre al sys.path
sys.path.append(parent_dir)

# Lógica principal
if __name__ == "__main__":
    with Session() as session:
        creadores = session.query(Creador).all()

        for creador in creadores:
            procesar_categorias(session, creador)

        # Guardar los cambios en la base de datos
        session.commit()

