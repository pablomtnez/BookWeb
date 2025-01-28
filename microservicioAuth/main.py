from fastapi import FastAPI, HTTPException, Depends, Form
from pydantic import BaseModel, Field
from passlib.context import CryptContext
import jwt
import datetime
import pymysql
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from jwt.exceptions import ExpiredSignatureError, DecodeError
import logging
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel, OAuthFlowPassword
from fastapi.security import OAuth2

# Configuración de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de encriptación de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración personalizada de OAuth2
class CustomOAuth2PasswordBearer(OAuth2):
    def __init__(self, tokenUrl: str):
        flows = OAuthFlowsModel(
            password=OAuthFlowPassword(tokenUrl=tokenUrl)
        )
        super().__init__(flows=flows)

oauth2_scheme = CustomOAuth2PasswordBearer(tokenUrl="/login")

# Inicializar FastAPI
app = FastAPI()

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Cambiar a "*" si deseas permitir cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador para solicitudes preflight (CORS)
@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return {"message": "CORS preflight successful"}

# Modelos Pydantic y ajustes
class User(BaseModel):
    name: str
    username: str
    password: str

class LoginRequest:
    def __init__(self, username: str = Form(...), password: str = Form(...)):
        self.username = username
        self.password = password

class Token(BaseModel):
    access_token: str
    token_type: str

class AddFavoriteBook(BaseModel):
    book: str = Field(..., min_length=1, max_length=255, description="Título del libro a agregar.")

class DeleteFavoriteBook(BaseModel):
    book: str = Field(..., min_length=1, max_length=255, description="Título del libro a eliminar.")

# Funciones auxiliares
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido.")
        return username
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado.")
    except DecodeError:
        raise HTTPException(status_code=401, detail="Token inválido.")

# Conexión a la base de datos
async def get_db():
    db = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "bookweb"),
        port=int(os.getenv("DB_PORT", 3306)),
    )
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.post("/register")
async def register_user(user: User, db=Depends(get_db)):
    try:
        with db.cursor() as cursor:
            cursor.execute("SELECT username FROM users WHERE username = %s", (user.username,))
            existing_user = cursor.fetchone()
            if existing_user:
                raise HTTPException(status_code=400, detail="El nombre de usuario ya existe.")

            hashed_password = get_password_hash(user.password)
            cursor.execute(
                "INSERT INTO users (name, username, password_hash) VALUES (%s, %s, %s)",
                (user.name, user.username, hashed_password),
            )
            db.commit()
            logger.info(f"Usuario {user.username} registrado correctamente.")
        return {"message": "Usuario registrado con éxito."}
    except Exception as e:
        logger.error(f"Error en /register: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

@app.post("/login", response_model=Token)
async def login_user(username: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    try:
        logger.info(f"[LOG] Intentando login con usuario: {username}")
        with db.cursor() as cursor:
            cursor.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user or not verify_password(password, user[0]):
                raise HTTPException(status_code=400, detail="Nombre de usuario o contraseña inválidos.")

            access_token = create_access_token(data={"sub": username})
            logger.info(f"Usuario {username} inició sesión.")
            return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"[ERROR] Error en /login: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

@app.post("/favorites/add")
async def add_favorite_book(favorite: AddFavoriteBook, username: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        logger.info(f"[LOG] Usuario autenticado: {username}")
        logger.info(f"[LOG] Intentando agregar el libro: {favorite.book}")

        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado.")

            cursor.execute(
                "SELECT id FROM favorites WHERE user_id = %s AND book = %s",
                (user[0], favorite.book),
            )
            existing_favorite = cursor.fetchone()
            if existing_favorite:
                raise HTTPException(status_code=400, detail="El libro ya está en favoritos.")

            cursor.execute(
                "INSERT INTO favorites (user_id, book) VALUES (%s, %s)",
                (user[0], favorite.book),
            )
            db.commit()
            logger.info(f"[LOG] Libro '{favorite.book}' agregado a favoritos por el usuario: {username}")
        return {"message": f"Libro '{favorite.book}' agregado a favoritos."}
    except Exception as e:
        logger.error(f"[ERROR] Error en /favorites/add: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

@app.delete("/favorites/delete")
async def delete_favorite_book(favorite: DeleteFavoriteBook, username: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        logger.info(f"[LOG] Usuario autenticado: {username}")
        logger.info(f"[LOG] Intentando eliminar el libro: {favorite.book}")

        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado.")

            cursor.execute(
                "SELECT id FROM favorites WHERE user_id = %s AND book = %s",
                (user[0], favorite.book),
            )
            existing_favorite = cursor.fetchone()
            if not existing_favorite:
                raise HTTPException(status_code=404, detail="El libro no está en favoritos.")

            cursor.execute(
                "DELETE FROM favorites WHERE user_id = %s AND book = %s",
                (user[0], favorite.book),
            )
            db.commit()
            logger.info(f"[LOG] Libro '{favorite.book}' eliminado de favoritos por el usuario: {username}")
        return {"message": f"Libro '{favorite.book}' eliminado de favoritos."}
    except Exception as e:
        logger.error(f"[ERROR] Error en /favorites/delete: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

@app.get("/favorites")
async def get_favorite_books(username: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        logger.info(f"[LOG] Usuario autenticado: {username}")
        logger.info("[LOG] Intentando recuperar favoritos.")

        with db.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado.")

            cursor.execute("SELECT book FROM favorites WHERE user_id = %s", (user[0],))
            favorites = cursor.fetchall()
            logger.info(f"[LOG] Favoritos recuperados para el usuario: {username}")
        return {"favorites": [f[0] for f in favorites]}
    except Exception as e:
        logger.error(f"[ERROR] Error en /favorites: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

# Cerrar conexión al apagar la aplicación
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Cerrando conexiones.")