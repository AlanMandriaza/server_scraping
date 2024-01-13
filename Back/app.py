import os
import json
from flask import Flask
from flask_cors import CORS
from endpoints.filtros.filtros import filtros_bp
from endpoints.creadores import creadores_bp
from utils.database_utils import verificar_y_guardar_creadores, nombres_creadores 
from endpoints.filtros.sortbyname import sortbyname_bp
from endpoints.filtros.sortbycat import sortbycat_bp

app = Flask(__name__)
CORS(app)


CONFIG_FILE_PATH = 'config.json'  

with open(CONFIG_FILE_PATH, 'r') as config_file:
    config_data = json.load(config_file)

db_url = f"mysql+pymysql://{config_data['db_user']}:{config_data['db_password']}@{config_data['db_host']}:{config_data['db_port']}/{config_data['db_name']}"

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

verificar_y_guardar_creadores(nombres_creadores)

app.register_blueprint(creadores_bp, url_prefix='', name='creadores_bp')
app.register_blueprint(filtros_bp, url_prefix='/filtros', name='filtros_bp')
app.register_blueprint(sortbyname_bp, url_prefix='/sortbyname')
app.register_blueprint(sortbycat_bp, url_prefix='/sortbycat')

if __name__ == "__main__":
    app.run()
