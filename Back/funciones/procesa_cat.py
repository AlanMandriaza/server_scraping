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

def obtener_cantidad_total_creadores(session):
    return session.query(Creador).count()

def procesar_categorias(session, creador, numero_creador, cantidad_total):
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

        # Calcular el porcentaje de progreso
        porcentaje_progreso = (numero_creador / cantidad_total) * 100

        # Mostrar solo el porcentaje de progreso
        sys.stdout.write("\rProgreso: %.2f%%" % porcentaje_progreso)
        sys.stdout.flush()

# Obtener la ruta del directorio actual del script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Obtener la ruta del directorio superior (padre)
parent_dir = os.path.join(current_dir, '..')

# Añadir el directorio padre al sys.path
sys.path.append(parent_dir)

# Lógica principal
if __name__ == "__main__":
    with Session() as session:
        cantidad_total_creadores = obtener_cantidad_total_creadores(session)
        creadores = session.query(Creador).all()
        numero_creador = 0  # Inicializa el número de creador

        for creador in creadores:
            numero_creador += 1  # Incrementa el número de creador en cada iteración
            procesar_categorias(session, creador, numero_creador, cantidad_total_creadores)

        # Imprime una línea en blanco para separar el progreso
        print()

        # Guardar los cambios en la base de datos
        session.commit()
