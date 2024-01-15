import re
import logging
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from models.main import Categoria, CreadorCategoriaAssociation, Creador, engine

sortbycat_bp = Blueprint('sortbycat', __name__)
Session = sessionmaker(bind=engine)

@sortbycat_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        with Session() as session:
            categories = session.query(
                Categoria.id, 
                Categoria.nombre, 
                func.count(CreadorCategoriaAssociation.categoria_id).label('num_asociaciones')
            ).join(
                CreadorCategoriaAssociation
            ).group_by(
                Categoria.id
            ).order_by(
                func.count(CreadorCategoriaAssociation.categoria_id).desc()
            ).all()

            categories_list = [{'id': category.id, 'nombre': category.nombre, 'asociaciones': category.num_asociaciones} for category in categories]

        return jsonify(categories_list)

    except Exception as e:
        logging.exception("Error while fetching categories: %s", e)
        return jsonify({'error': 'Internal Server Error'}), 500

def convertir_likes_a_numero(likes):
    if likes is None:
        return 0.0

    # Regular expression to extract numbers and letters from the string
    match = re.match(r"(\d+(\.\d+)?)\s*([kKmM]?)", str(likes))
    if match:
        numero = float(match.group(1))
        unidad = match.group(3).lower()

        # Convert to millions or thousands based on the unit
        if unidad == "k":
            numero *= 1_000
        elif unidad == "m":
            numero *= 1_000_000

        # Round to two decimals
        numero = round(numero, 2)
        
        return numero
    else:
        # Return 0 if it cannot be converted
        return 0.0


@sortbycat_bp.route('/categories/<string:category_name>', methods=['GET'])
def filtrar_creadores_por_likes(category_name):
    try:
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = 20

        # Obtener la lista de creadores desde la base de datos
        with Session() as session:
            # Filtrar creadores por categoría y estado "actualizado"
            # Modificar la consulta para que sea insensible a mayúsculas y minúsculas
            creadores = (
                session.query(Creador)
                .join(Creador.categorias_asociacion)
                .join(Categoria)
                .filter(func.lower(Categoria.nombre) == func.lower(category_name))  # Filtrar por nombre de categoría (insensible a mayúsculas/minúsculas)
                .filter(Creador.estado == "actualizado")  # Filtrar solo por creadores con estado "actualizado"
                .all()
            )

            # Convertir los likes a números y filtrar de mayor a menor
            creadores_filtrados = sorted(
                [
                {
                        "creador_id": creador.creador_id,
                        "nombre": creador.nombre,
                        "pais": creador.pais,
                        "biografia": creador.biografia,
                        "categorias_asociadas": creador.categorias_asociadas,
                        "precio_suscripcion": creador.precio_suscripcion,
                        "videos": creador.videos,
                        "fotos": creador.fotos,
                        "streams": creador.streams,
                        "likes": convertir_likes_a_numero(creador.likes),
                        "fans": creador.fans,
                        "redes_sociales": creador.redes_sociales,
                        "verificado": creador.verificado,
                        "estado": creador.estado,
                        "actualizacion": creador.actualizacion,
                    }


                    for creador in creadores
                ],
                key=lambda x: x["likes"],
                reverse=True,
            )

            # Realizar la paginación
            total_creators = len(creadores_filtrados)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            paginated_creators = creadores_filtrados[start_idx:end_idx]

            # Calcular el número total de páginas
            total_pages = (total_creators + per_page - 1) // per_page

            return jsonify({
                "creadores": paginated_creators,
                "total_paginas": total_pages,
                "pagina_actual": page,
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ...

