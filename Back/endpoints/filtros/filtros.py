from flask import Blueprint, jsonify, request
from models.main import Session, Creador
from sqlalchemy.sql.expression import case
import re

filtros_bp = Blueprint('filtros_bp', __name__)

@filtros_bp.route('/filtrar_por_likes', methods=['GET'])
def filtrar_creadores_por_likes():
    try:
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = 20

        # Obtener la lista de creadores desde la base de datos
        with Session() as session:
            # Filtrar por creadores con estado "actualizado"
            creadores = (
                session.query(Creador)
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



def convertir_likes_a_numero(likes):
    if likes is None:
        return 0.0

    # Expresión regular para extraer números y letras de la cadena
    match = re.match(r"(\d+(\.\d+)?)\s*([kKmM]?)", str(likes))
    if match:
        numero = float(match.group(1))
        unidad = match.group(3).lower()

        # Convertir a millones o miles según la unidad
        if unidad == "k":
            numero *= 1_000
        elif unidad == "m":
            numero *= 1_000_000

        # Redondear a dos decimales
        numero = round(numero, 2)
        
        return numero
    else:
        # Devolver 0 si no se puede convertir
        return 0.0
