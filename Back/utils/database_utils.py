from models.main import Session, Creador

# Lista de nombres de creadores
nombres_creadores = ["cocalicemodel"]

# Crea una instancia de la sesión
session = Session()

def verificar_y_guardar_creadores(nombres_creadores):
    try:
        # Iterate over the list of creator names and check if they already exist
        for nombre in nombres_creadores:
            # Check if the creator_id already exists in the 'creadores' table
            existing_creador = session.query(Creador).filter(Creador.creador_id == nombre).first()

            if existing_creador is None:
                # If it doesn't exist, create a new instance with the creator_id
                creador = Creador(creador_id=nombre, nombre=nombre)
                session.add(creador)
            else:
                # If it already exists, display a warning message but continue processing
                print(f"The creator with creator_id '{nombre}' already exists in the database and will be skipped.")

        # Confirm the changes to the database
        session.commit()

    except Exception as e:
        # In case of an error, rollback to undo the changes
        session.rollback()
        print(f"Error saving data to the database: {e}")

    finally:
        # Close the session
        session.close()
