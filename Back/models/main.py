from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.orm import declarative_base
import json
import os

# Adjust the path to config.json based on the location of main.py
CONFIG_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'config.json')

with open(CONFIG_FILE_PATH, 'r') as config_file:
    config_data = json.load(config_file)

# Crear la URL de conexión a la base de datos
db_url = f"mysql+pymysql://{config_data['db_user']}:{config_data['db_password']}@{config_data['db_host']}:{config_data['db_port']}/{config_data['db_name']}"

# Crear una instancia del motor SQLAlchemy
engine = create_engine(db_url)

# Crear una clase de sesión para interactuar con la base de datos
Session = sessionmaker(bind=engine)

# Crear una instancia de declarative_base
Base = declarative_base()
# Definir las clases de tabla utilizando SQLAlchemy
class Creador(Base):
    __tablename__ = 'creadores'

    creador_id = Column(String(50), primary_key=True, index=True, unique=True, nullable=False)
    nombre = Column(String(100), index=True)
    pais = Column(String(50), index=True)
    biografia = Column(String(1000))
    categorias_asociadas = Column(String(1000))
    precio_suscripcion = Column(String(50))
    videos = Column(String(100))
    fotos = Column(String(100))
    streams = Column(String(100))
    likes = Column(String(100))
    fans = Column(String(100))
    redes_sociales = Column(JSON, default='')
    verificado = Column(Boolean)
    estado = Column(String(100))
    actualizacion = Column(DateTime)

    # Relación con la tabla 'categorias' a través de la tabla de asociación
    categorias_asociacion = relationship('CreadorCategoriaAssociation', back_populates='creador')

class Categoria(Base):
    __tablename__ = 'categorias'

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), index=True, nullable=False)
    __table_args__ = (UniqueConstraint('nombre', name='_nombre_uc'), )
    # Relación con la tabla 'creadores' a través de la tabla de asociación
    creadores = relationship('CreadorCategoriaAssociation', back_populates='categoria')

class CreadorCategoriaAssociation(Base):
    __tablename__ = 'creador_categoria_association'

    creador_id = Column(String(50), ForeignKey('creadores.creador_id'), primary_key=True)
    categoria_id = Column(Integer, ForeignKey('categorias.id'), primary_key=True)

    # Añadir relación con la tabla 'Creador'
    creador = relationship('Creador', back_populates='categorias_asociacion')
    # Añadir relación con la tabla 'Categoria'
    categoria = relationship('Categoria', back_populates='creadores')

class CreadorNoProcesado(Base):
    __tablename__ = 'creadores_no_procesados'

    id = Column(Integer, primary_key=True)
    creador_id = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(100), index=True)
    estado_proceso = Column(String(20))

# Crear las tablas en la base de datos
Base.metadata.create_all(engine)

# Obtener la lista de creadores desde la base de datos
with Session() as session:
    creadores = session.query(Creador).all()


    session.commit()