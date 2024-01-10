from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException

def obtener_valor(driver, xpath):
    try:
        elemento = driver.find_element(By.XPATH, xpath)
        return elemento.text.strip()
    except NoSuchElementException:
        return "0"
