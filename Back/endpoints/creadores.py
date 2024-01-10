import sys
from flask import Blueprint, request, jsonify
from utils.database_utils import verificar_y_guardar_creadores
from models.main import Session, Creador, CreadorCategoriaAssociation, Categoria
from sqlalchemy import asc, func



creadores_bp = Blueprint('creadores_bp', __name__)

@creadores_bp.route('/creador', methods=['POST'])
def agregar_creador():
    data = request.get_json()

    session = Session()
    try:
        # Verifica si el creador ya existe en la base de datos por ID
        existing_creador = session.query(Creador).filter(Creador.creador_id == data['creador_id']).first()

        if existing_creador:
            return jsonify({"message": "El creador con este ID ya existe en la base de datos."}), 409
        else:
            # Crea un nuevo objeto Creador con los datos proporcionados
            nuevo_creador = Creador(
                creador_id=data['creador_id'],
                nombre=data['nombre'],
                biografia=data.get('biografia', ''),
                precio_suscripcion=data.get('precio_suscripcion', ''),
                videos=data.get('videos', 0),
                fotos=data.get('fotos', 0),
                streams=data.get('streams', 0),
                likes=data.get('likes', 0),
                fans=data.get('fans', 0),
                redes_sociales=data.get('redes_sociales', []),
                verificado=data.get('verificado', False),
                pais=data.get('pais', ''),
                estado=data.get('estado', ''), 
                actualizacion=data.get('actualizacion', '')  
            )
            session.add(nuevo_creador)

            categorias = data.get('categorias', [])  
            for categoria_nombre in categorias:
                categoria = session.query(Categoria).filter(Categoria.nombre == categoria_nombre).first()
                if categoria:
                    creador_categoria = CreadorCategoriaAssociation(creador=nuevo_creador, categoria=categoria)
                    session.add(creador_categoria)

            session.commit()
            return jsonify({"message": "Creador agregado exitosamente."}), 201

    except Exception as e:
        session.rollback()
        return jsonify({"message": f"Error al guardar los datos en la base de datos: {e}"}), 500

    finally:
        session.close()


# Endpoint para obtener los nombres de los creadores

@creadores_bp.route('/creadores', methods=['GET'])
def obtener_creadores():
    # Inicializa la sesión
    session = Session()

    try:
        # Realiza la consulta para obtener todos los creadores ordenados por fecha de creación ascendente
        creadores = (
            session.query(Creador)
            .order_by(asc(func.ifnull(Creador.actualizacion, '9999-12-31')))
            .all()
        )

        # Extrae los creador_id en una lista
        creador_ids = [creador.creador_id for creador in creadores]

        # Cierra la sesión
        session.close()

        # Devuelve los creador_ids en formato JSON
        return jsonify(creador_ids)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint para eliminar creadores por nombre
@creadores_bp.route('/creador/<string:nombre>', methods=['DELETE'])
def eliminar_creador(nombre):
    session = Session()
    creador = session.query(Creador).filter_by(nombre=nombre).first()

    if creador:
        session.delete(creador)
        session.commit()
        session.close()
        return jsonify({"message": f"Creador '{nombre}' eliminado correctamente."})
    else:
        session.close()
        return jsonify({"message": f"Creador '{nombre}' no encontrado."}), 404

@creadores_bp.route('/creadores/detalles', methods=['GET'])
def obtener_detalles_creadores():
    session = Session()
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)  # Define per_page here

        # Nueva consulta para obtener creadores paginados y filtrados por estado "actualizado"
        creadores = (
            session.query(Creador)
            .filter(Creador.estado == 'actualizado')
            .limit(per_page)
            .offset((page - 1) * per_page)
            .all()
        )

        detalles_creadores = []

        for creador in creadores:
            detalles_creador = {
                'creador_id': creador.creador_id,
                'nombre': creador.nombre,
            
                'biografia': creador.biografia,
                'precio_suscripcion': creador.precio_suscripcion,
                'videos': creador.videos,
                'fotos': creador.fotos,
                'streams': creador.streams,
                'likes': creador.likes,
                'fans': creador.fans,
                'redes_sociales': creador.redes_sociales,
                'verificado': creador.verificado,
                'pais': creador.pais,
                'estado': creador.estado,
                'actualizacion': creador.actualizacion,
            }
            detalles_creadores.append(detalles_creador)

        # Configura la respuesta con los detalles de los creadores
        response = jsonify(detalles_creadores)
        return response

    except Exception as e:
        return jsonify({"message": str(e)}), 500

    finally:
        session.close()
        
        