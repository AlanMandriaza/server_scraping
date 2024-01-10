import re
import logging
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from models.main import Categoria, CreadorCategoriaAssociation, Creador, engine

sortbycat_bp = Blueprint('sortbycat', __name__)
Session = sessionmaker(bind=engine)


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
def get_creators_in_category_by_name(category_name):
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        with Session() as session:
            # Query for the category based on the name
            category = session.query(Categoria).filter(Categoria.nombre == category_name).first()
            if not category:
                return jsonify({'message': 'Category not found'}), 404

            # Fetch all details of creators associated with the category
            creators = session.query(Creador).join(
                CreadorCategoriaAssociation, Creador.creador_id == CreadorCategoriaAssociation.creador_id
            ).filter(
                CreadorCategoriaAssociation.categoria_id == category.id
            ).all()

            # Convert likes to numbers for all creators and sort by likes
            creators_list = sorted(
                [
                    {
                        'creador_id': creador.creador_id,
                        'nombre': creador.nombre,
                        # Include other fields as needed
                        'likes': convertir_likes_a_numero(creador.likes),
                        # Add other fields from Creador as required
                    } for creador in creators
                ], 
                key=lambda x: x['likes'], 
                reverse=True
            )

            # Implementing pagination
            total_creators = len(creators_list)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            paginated_creators = creators_list[start_idx:end_idx]
            total_pages = (total_creators + per_page - 1) // per_page

            return jsonify({
                'categoria': category_name, 
                'cantidad_creadores': total_creators, 
                'creadores': paginated_creators,
                'total_paginas': total_pages,
                'pagina_actual': page
            })

    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500