import re
import logging
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.main import Creador, Session as DBSession

sortbyname_bp = Blueprint('sortbyname', __name__)

# Configure the logging level
logging.basicConfig(level=logging.DEBUG)

def convertir_likes_a_numero(likes):
    if likes is None:
        return 0.0

    match = re.match(r"(\d+(\.\d+)?)\s*([kKmM]?)", str(likes))
    if match:
        numero = float(match.group(1))
        unidad = match.group(3).lower()

        if unidad == "k":
            numero *= 1_000
        elif unidad == "m":
            numero *= 1_000_000

        return round(numero, 2)
    else:
        return 0.0

def get_creador_details(creador_id: str, session: Session) -> dict:
    try:
        creador = session.query(Creador).filter(Creador.creador_id == creador_id).first()
        if creador:
            result = {
                'creador_id': creador.creador_id,
                'nombre': creador.nombre,
                'pais': creador.pais,
                'biografia': creador.biografia,
                'categorias_asociadas': creador.categorias_asociadas,
                'precio_suscripcion': creador.precio_suscripcion,
                'videos': creador.videos,
                'fotos': creador.fotos,
                'streams': creador.streams,
                'likes': convertir_likes_a_numero(creador.likes),  # Converted likes
                'fans': creador.fans,
                'redes_sociales': creador.redes_sociales,
                'verificado': creador.verificado,
                'estado': creador.estado,
                'actualizacion': creador.actualizacion,
            }
            return result
        return None
    except Exception as e:
        logging.error(f"Error retrieving creator details: {e}")
        return None

def get_suggestions(query: str, session: Session, limit: int = 5) -> list:
    try:
        suggestions = session.query(Creador).filter(
            or_(Creador.nombre.ilike(f"%{query}%"), Creador.creador_id.ilike(f"%{query}%")),
            Creador.estado == "actualizado"
        ).limit(limit).all()
        results = [{'creador_id': creador.creador_id} for creador in suggestions]
        return results
    except Exception as e:
        logging.error(f"Error retrieving creator suggestions: {e}")
        return []

@sortbyname_bp.route('/search', methods=['GET'])
def get_creador_or_suggestions() -> jsonify:
    query: str = request.args.get('query', default=None, type=str)
    creador_id: str = request.args.get('creador_id', default=None, type=str)

    logging.debug(f"Received request with query: {query} and creador_id: {creador_id}")

    with DBSession() as session:
        if creador_id:
            result = get_creador_details(creador_id, session)
            if result:
                logging.debug("Returning creador details: %s", result)
                return jsonify(result)
            else:
                logging.warning("Creador not found")
                return jsonify({'message': 'Creador no encontrado'}), 404
        elif query:
            results = get_suggestions(query, session)
            logging.debug("Returning suggestions: %s", results)
            return jsonify(results)
        else:
            logging.warning("Missing required parameters")
            return jsonify({'message': 'Se requiere el parámetro creador_id o query'}), 400
