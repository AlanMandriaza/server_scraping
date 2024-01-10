import os
import json
import sys
import logging
import requests
import time
from selenium.common.exceptions import TimeoutException
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime, timedelta
import validators
# Constants
WAIT_TIMEOUT = 5
MONTHS_TO_MARK_CREATED = 1

logging.basicConfig(level=logging.INFO)

script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(script_dir, '..')
sys.path.insert(0, parent_dir)
from models.main import Session, Creador, CreadorNoProcesado
from utils.utils import obtener_valor


def obtener_respuesta_api(url_api):
    try:
        response = requests.get(url_api)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Error al realizar la solicitud HTTP: {e}")
        return []

def esta_url_en_linea(url):
    try:
        response = requests.head(url, timeout=WAIT_TIMEOUT)
        return response.status_code == 200
    except requests.RequestException:
        return False

def descargar_imagen(url, nombre_archivo):
    try:
        response = requests.get(url)
        response.raise_for_status()
        with open(nombre_archivo, 'wb') as f:
            f.write(response.content)
        return True
    except requests.RequestException as e:
        logging.error(f"Error al descargar la imagen")
    return False

def obtener_pais(driver):
    try:
        boton_info = driver.find_element(By.CSS_SELECTOR, "#content > div.l-wrapper.m-guest > div.l-wrapper__holder-content > div > div.l-profile-container > div > div.b-profile__header__user.g-sides-gaps > div.b-profile__content > div.b-user-info.m-mb-sm > div > span")
        boton_info.click()
        # Agregar una espera de 3 segundos antes de buscar el elemento
        time.sleep(3)
        try:
            # Imprimir el HTML actual de la página
            html = driver.page_source
            # Buscar el elemento sin esperar a que esté presente
            pais_elemento = driver.find_element(By.CSS_SELECTOR, 'div.b-user-info__detail p')
            # No es necesario esperar a que esté presente, ya que se buscó directamente
            pais = pais_elemento.text
            logging.info(f"País extraído: {pais}")
            return pais
        except Exception as inner_exception:
            logging.error(f"Error al obtener el país: {inner_exception}")
            return "sin pais"

    except Exception as e:
        logging.error(f"Error al hacer clic en el botón de información: {e}")
        return "sin pais"


def obtener_verificacion(driver):
    try:
        elemento = driver.find_element(By.CSS_SELECTOR, '#content > div.l-wrapper.m-content-one-column > div.l-wrapper__holder-content > div > div.b-compact-header.g-sides-gaps.js-compact-sticky-header > div > div.b-compact-header__user > div.b-username-row.m-gap-clear > div > div > svg')
        logging.info("El creador está verificado.")
        return True
    except Exception as e:
        logging.info("El creador no está verificado.")
        return False

def obtener_redes_sociales(driver):
    try:
        # Esperar a que aparezcan los elementos de redes sociales con un tiempo máximo de 5 segundos
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.b-tabs__nav.m-tab-rounded.m-single-current.m-mb-25 a')))
        # Obtener los elementos de las redes sociales
        redes_sociales_elements = driver.find_elements(By.CSS_SELECTOR, 'div.b-tabs__nav.m-tab-rounded.m-single-current.m-mb-25 a')
        redes_sociales = []
        if not redes_sociales_elements:
            logging.info("No se encontraron redes sociales.")
            redes_sociales.append({"nombre": "No tiene redes", "enlace": "N/A"})
        else:
            for elemento in redes_sociales_elements:
                enlace = elemento.get_attribute('href')
                nombre = elemento.find_element(By.CSS_SELECTOR, 'span.b-tabs__nav__text').text.strip()
                redes_sociales.append({"nombre": nombre, "enlace": enlace})
                logging.info(f"{nombre}: {enlace}")

        return redes_sociales
    except TimeoutException:
        logging.warning("No se encontraron elementos de redes sociales")
        return [{"nombre": "No tiene redes", "enlace": "N/A"}]
    except Exception as e:
        logging.error(f"Error al obtener las redes sociales")
        return [{"nombre": "No tiene redes", "enlace": "N/A"}]


def procesar_creador(driver, creador_id, images_folder, session):
    URL_BASE = f'https://onlyfans.com/{creador_id}'

    if not validators.url(URL_BASE) or not esta_url_en_linea(URL_BASE):
        logging.warning(f'La URL {URL_BASE} no está en línea o no es válida.')
        return
    carpeta_creador = os.path.join(images_folder, creador_id)
    os.makedirs(carpeta_creador, exist_ok=True)
    driver.get(URL_BASE)

    try:
        espera = WebDriverWait(driver, WAIT_TIMEOUT)
        espera.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'div.g-avatar__img-wrapper img')))
    except TimeoutException:
        logging.warning("Timed out waiting for element to become visible. Deleting creator from the main table.")
        # Eliminar el creador de la tabla principal
        try:
            creador = session.query(Creador).filter(Creador.creador_id == creador_id).one_or_none()
            if creador:
                session.delete(creador)
                session.commit()
                logging.info(f"Creador '{creador_id}' eliminado.")
        except Exception as e:
            # Manejar excepciones al eliminar el creador
            session.rollback()
            logging.error(f"Error deleting creator: {e}")
        # Crear una instancia de CreadorNoProcesado y agregarla a la base de datos
        non_processed_creator = CreadorNoProcesado(creador_id=creador_id, nombre='', estado_proceso='timed_out')

        try:
            session.add(non_processed_creator)
            session.commit()
        except IntegrityError as e:
            # Manejar la excepción si ya existe un creador con el mismo id en la tabla no procesada
            session.rollback()
            logging.error(f"Error adding non-processed creator: {e}")
        except Exception as e:
            # Manejar otras excepciones de la base de datos
            session.rollback()
            logging.error(f"Error: {e}")
        return

    # Verificar el estado y la última actualización del creador
    try:
        creador = session.query(Creador).filter(Creador.creador_id == creador_id).one_or_none()
    except NoResultFound:
        # Si el creador no se encuentra en la base de datos, puede agregar lógica adicional aquí
        return

    # Verificar si el creador ya ha sido procesado recientemente
    if creador and creador.actualizacion is not None:
        tiempo_pasado = datetime.now() - creador.actualizacion
        if tiempo_pasado >= timedelta(days=30):
            logging.info(f"Actualizando {creador_id} porque la fecha de actualización es mayor a un mes.")
            # Coloca aquí el código para procesar el creador
        elif tiempo_pasado < timedelta(days=30) and (creador.estado is not None and creador.estado != ""):
            logging.info(f"El creador {creador_id} ya ha sido procesado recientemente")
            # Puedes agregar más lógica aquí si es necesario
        else:
            logging.info(f"El creador {creador_id} no necesita ser procesado en este momento.")

    # Si actualizacion es None o la fecha es muy antigua, establecerla al tiempo actual
    if creador and (creador.actualizacion is None or tiempo_pasado >= timedelta(days=30)):   
        creador.actualizacion = datetime.now()
        creador.estado = 'actualizado' 
        session.commit()
        
    html_obtenido = driver.page_source
    soup = BeautifulSoup(html_obtenido, "html.parser")

    # Extraer y descargar la imagen principal
    imagen_tag = soup.select_one('div.g-avatar__img-wrapper img')
    if imagen_tag and imagen_tag.has_attr('src'):
        imagen_url = imagen_tag['src']
        nombre_archivo_principal = os.path.join(carpeta_creador, f"{creador_id}.jpg")
        if descargar_imagen(imagen_url, nombre_archivo_principal):
            logging.info(f"Imagen principal descargada en {carpeta_creador}")

    # Extraer y descargar la imagen HD
    prefijo_original = "https://thumbs.onlyfans.com/public/files/thumbs/c144/"
    prefijo_modificado = "https://public.onlyfans.com/files/"
    url_segunda = imagen_url.replace(prefijo_original, prefijo_modificado)
    nombre_archivo_hd = os.path.join(carpeta_creador, f"{creador_id}_hd.jpg")
    if descargar_imagen(url_segunda, nombre_archivo_hd):
        logging.info(f"Imagen HD descargada en {carpeta_creador}")

    # Extraer y descargar la imagen de la biografía
    imagen_bio_tag = soup.select_one('.b-profile__header__cover-img')
    if imagen_bio_tag and imagen_bio_tag.has_attr('src'):
        imagen_bio_url = imagen_bio_tag['src']
        nombre_archivo_bio = os.path.join(carpeta_creador, f"{creador_id}_bio.jpg")
        if descargar_imagen(imagen_bio_url, nombre_archivo_bio):
            logging.info(f"Imagen de biografía descargada en {carpeta_creador}")
    else:
        logging.warning("No se encontró la imagen de la biografía")

    # Extraer información adicional del creador
    try:
        # Esperar a que aparezcan los elementos de las secciones con un tiempo máximo de 5 segundos
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'ul.b-profile__sections')))

        # Obtener los elementos de las secciones
        secciones_elements = driver.find_elements(By.CSS_SELECTOR, 'ul.b-profile__sections li.b-profile__sections__item')
        fotos_count = None
        videos_count = None
        likes_count = None
        streams_count = None
        subscribers_count = None

        if not secciones_elements:
            logging.info("No se encontraron secciones.")
        else:
            for elemento in secciones_elements:
                nombre_icono = elemento.find_element(By.CSS_SELECTOR, 'span.b-profile__sections__link.has-tooltip [data-icon-name]').get_attribute('data-icon-name')
                count = elemento.find_element(By.CSS_SELECTOR, 'span.b-profile__sections__count').text.strip()

                if nombre_icono == 'icon-image':
                    fotos_count = count
                elif nombre_icono == 'icon-video':
                    videos_count = count
                elif nombre_icono == 'icon-like':
                    likes_count = count
                elif nombre_icono == 'icon-live':
                    streams_count = count
                elif nombre_icono == 'icon-follow':
                    subscribers_count = count

                logging.info(f"{nombre_icono}: {count}")

    except TimeoutException:
        logging.warning("No se encontraron elementos de secciones")
    except Exception as e:
        logging.error(f"Error al obtener las secciones: {e}")

    bio = obtener_valor(driver, '//*[@id="content"]/div[1]/div[1]/div/div[2]/div/div[2]/div[2]/div[1]/div/div/div/p')
    nombre = obtener_valor(driver, '//*[@id="content"]/div[1]/div[1]/div/div[2]/div/div[2]/div[1]/div[2]/div[1]/div/div')
    suscription = obtener_valor(driver, '//*[@class="b-btn-text__small"]')
    if "FREE" in suscription.upper():
        precio_suscripcion = 0.0
    else:
        precio_suscripcion = suscription
    pais = obtener_pais(driver)
    verificado = obtener_verificacion(driver)
    redes_sociales = obtener_redes_sociales(driver)
    if redes_sociales:
        logging.info(f"Redes sociales del creador '{creador_id}':")
        for red_social in redes_sociales:
            logging.info(f"{red_social['nombre']}: {red_social['enlace']}")
    else:
        logging.warning(f"No se encontraron redes sociales para el creador '{creador_id}'")

    additional_data = {
        "nombre": nombre,
        "precio_suscripcion": precio_suscripcion,
        "videos": videos_count,
        "fotos": fotos_count,
        "likes": likes_count,
        "streams": streams_count,
        "fans": subscribers_count,
        "biografia": bio,
        "pais": pais,
        "verificado": verificado,
        "redes_sociales": redes_sociales,
        "estado": creador.estado,
        "actualizacion": creador.actualizacion
    }

    try:
        for key, value in additional_data.items():
            setattr(creador, key, value)
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(f"Error al guardar los datos en la base de datos: {e}")


def get_chrome_service():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Specify the path to the ChromeDriver binary
    chrome_binary_path = "/usr/lib/chromium-browser/chromedriver"
    chrome_service = Service(chrome_binary_path)
    
    return chrome_service, chrome_options

def procesa_creadores(creador_ids):
    images_folder = '/home/alantiwa/proyecto/Front/public/images'
    os.makedirs(images_folder, exist_ok=True)
    chrome_service, chrome_options = get_chrome_service()
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

    try:
        with Session() as session:
            for i, creador_id in enumerate(creador_ids, start=1):
                logging.info(f"Procesando creador {i}/{len(creador_ids)}")
                # Verificar el estado y la última actualización del creador
                try:
                    creador = session.query(Creador).filter(Creador.creador_id == creador_id).one_or_none()
                except NoResultFound:
                    # Si el creador no se encuentra en la base de datos, puede agregar lógica adicional aquí
                    continue
                # Verificar si el creador ya ha sido procesado recientemente
                if creador and creador.actualizacion is not None:
                    tiempo_pasado = datetime.now() - creador.actualizacion
                    if tiempo_pasado < timedelta(days=30):
                        logging.info(f"El creador {creador_id} ya ha sido procesado recientemente. No es necesario volver a procesarlo.")
                        continue
                # Verificar si el creador tiene una fecha de actualización mayor a un mes
                if creador and (creador.actualizacion is None or tiempo_pasado >= timedelta(days=30)):   
                    logging.info(f"Procesando el creador {creador_id}")
                    procesar_creador(driver, creador_id, images_folder, session)
                else:
                    logging.info(f"El creador {creador_id} no necesita ser procesado en este momento.")
                    continue
                # Si el creador fue actualizado, establecer la fecha de actualización y el estado
                creador.actualizacion = datetime.now()
                creador.estado = 'actualizado' 
                session.commit()

    finally:
        driver.quit()

if __name__ == "__main__":
    url_api = 'http://localhost:5000/creadores'
    # Obtener los IDs de los creadores
    creador_ids = obtener_respuesta_api(url_api)

    # Procesar cada creador
    procesa_creadores(creador_ids)