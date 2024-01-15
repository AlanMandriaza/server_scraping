import logging
import re
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
from models.main import CreadorPromocionado, Creador, engine

promocionados_bp = Blueprint('promocionados_bp', __name__)
Session = sessionmaker(bind=engine)

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
        numero = round(numero, 2)
        return numero
    else:
        return 0.0

@promocionados_bp.route('/promocionados', methods=['GET'])
def obtener_creadores_promocionados():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        with Session() as session:
            total_creators = session.query(func.count(CreadorPromocionado.id)).scalar()

            creadores_promocionados = session.query(
                CreadorPromocionado.id,
                CreadorPromocionado.detalles_promocion,
                Creador
            ).join(Creador).offset((page - 1) * per_page).limit(per_page).all()

            promocionados_lista = [{
                'id': cp.id,
                'detalles_promocion': cp.detalles_promocion,
                'creador_id': cp.Creador.creador_id,
                'nombre': cp.Creador.nombre,
                'pais': cp.Creador.pais,
                'biografia': cp.Creador.biografia,
                'categorias_asociadas': cp.Creador.categorias_asociadas,
                'precio_suscripcion': cp.Creador.precio_suscripcion,
                'videos': cp.Creador.videos,
                'fotos': cp.Creador.fotos,
                'streams': cp.Creador.streams,
                'likes': convertir_likes_a_numero(cp.Creador.likes),
                'fans': cp.Creador.fans,
                'redes_sociales': cp.Creador.redes_sociales,
                'verificado': cp.Creador.verificado,
                'estado': cp.Creador.estado,
                'actualizacion': cp.Creador.actualizacion,
            } for cp in creadores_promocionados]

            total_pages = (total_creators + per_page - 1) // per_page

            return jsonify({
                "creadores": promocionados_lista,
                "total_paginas": total_pages,
                "pagina_actual": page,
                "creadores_por_pagina": per_page,
                "total_creadores": total_creators
            })

    except Exception as e:
        logging.exception("Error while fetching promoted creators: %s", e)
        return jsonify({'error': 'Internal Server Error'}), 500
