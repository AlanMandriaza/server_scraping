from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
import json
import os

# Configuración y conexión a la base de datos
CONFIG_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'config.json')
with open(CONFIG_FILE_PATH, 'r') as config_file:
    config_data = json.load(config_file)

db_url = f"mysql+pymysql://{config_data['db_user']}:{config_data['db_password']}@{config_data['db_host']}:{config_data['db_port']}/{config_data['db_name']}"
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
Base = declarative_base()

# Definición de modelos
class Creador(Base):
    __tablename__ = 'creadores'

    creador_id = Column(String(50), primary_key=True, index=True, unique=True, nullable=False)
    nombre = Column(String(100), index=True)
    pais = Column(String(250), index=True)
    biografia = Column(String(1000))
    categorias_asociadas = Column(JSON, default=list)
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
    categorias_asociacion = relationship('CreadorCategoriaAssociation', back_populates='creador')
    creadores_promocionados = relationship('CreadorPromocionado', back_populates='creador')

class Categoria(Base):
    __tablename__ = 'categorias'

    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), index=True, nullable=False)
    __table_args__ = (UniqueConstraint('nombre', name='_nombre_uc'), )
    creadores = relationship('CreadorCategoriaAssociation', back_populates='categoria')

class CreadorCategoriaAssociation(Base):
    __tablename__ = 'creador_categoria_association'

    creador_id = Column(String(50), ForeignKey('creadores.creador_id'), primary_key=True)
    categoria_id = Column(Integer, ForeignKey('categorias.id'), primary_key=True)
    creador = relationship('Creador', back_populates='categorias_asociacion')
    categoria = relationship('Categoria', back_populates='creadores')

class CreadorNoProcesado(Base):
    __tablename__ = 'creadores_no_procesados'

    id = Column(Integer, primary_key=True)
    creador_id = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(100), index=True)
    estado_proceso = Column(String(20))

class CreadorPromocionado(Base):
    __tablename__ = 'creadores_promocionados'

    id = Column(Integer, primary_key=True)
    creador_id = Column(String(50), ForeignKey('creadores.creador_id'), unique=True, nullable=False)
    detalles_promocion = Column(String(100), index=True)
    creador = relationship('Creador', back_populates='creadores_promocionados')

# Creación de las tablas en la base de datos
Base.metadata.create_all(engine)

# Obtener la lista de creadores desde la base de datos
with Session() as session:
    creadores = session.query(Creador).all()


    session.commit()