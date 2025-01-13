from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
import datetime
import pymysql
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from jwt.exceptions import ExpiredSignatureError, DecodeError
import logging
from fastapi.security import OAuth2PasswordBearer

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

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Conexión a la base de datos
try:
    db_connection = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "bookweb"),
        port=int(os.getenv("DB_PORT", 3306)),
    )
except pymysql.MySQLError as e:
    logger.error(f"Error al conectar a la base de datos: {e}")
    raise RuntimeError("No se pudo conectar a la base de datos.")

# Inicializar FastAPI
app = FastAPI()

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class User(BaseModel):
    name: str
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AddFavoriteBook(BaseModel):
    book: str

class DeleteFavoriteBook(BaseModel):
    book: str

# Funciones Auxiliares
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

# Endpoints

# Endpoint de Registro
@app.post("/register")
async def register_user(user: User):
    with db_connection.cursor() as cursor:
        cursor.execute("SELECT username FROM users WHERE username = %s", (user.username,))
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya existe.")

        hashed_password = get_password_hash(user.password)
        cursor.execute(
            "INSERT INTO users (name, username, password_hash) VALUES (%s, %s, %s)",
            (user.name, user.username, hashed_password),
        )
        db_connection.commit()
        logger.info(f"Usuario {user.username} registrado correctamente.")
    return {"message": "Usuario registrado con éxito."}

# Endpoint de Inicio de Sesión
@app.post("/login", response_model=Token)
async def login_user(login_request: LoginRequest):
    with db_connection.cursor() as cursor:
        cursor.execute("SELECT password_hash FROM users WHERE username = %s", (login_request.username,))
        user = cursor.fetchone()
        if not user or not verify_password(login_request.password, user[0]):
            raise HTTPException(status_code=400, detail="Nombre de usuario o contraseña inválidos.")

        access_token = create_access_token(data={"sub": login_request.username})
        logger.info(f"Usuario {login_request.username} inició sesión.")
        return {"access_token": access_token, "token_type": "bearer"}

# Endpoint para Agregar Favoritos
@app.post("/favorites/add")
async def add_favorite_book(favorite: AddFavoriteBook, username: str = Depends(get_current_user)):
    with db_connection.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        cursor.execute(
            "INSERT INTO favorites (user_id, book) VALUES (%s, %s)",
            (user[0], favorite.book),
        )
        db_connection.commit()
        logger.info(f"Libro {favorite.book} agregado a favoritos por {username}.")
    return {"message": f"Libro '{favorite.book}' agregado a favoritos."}

# Endpoint para Eliminar Favoritos
@app.delete("/favorites/delete")
async def delete_favorite_book(favorite: DeleteFavoriteBook, username: str = Depends(get_current_user)):
    with db_connection.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        cursor.execute(
            "DELETE FROM favorites WHERE user_id = %s AND book = %s",
            (user[0], favorite.book),
        )
        db_connection.commit()
        logger.info(f"Libro {favorite.book} eliminado de favoritos por {username}.")
    return {"message": f"Libro '{favorite.book}' eliminado de favoritos."}

# Endpoint para Obtener Favoritos
@app.get("/favorites")
async def get_favorite_books(username: str = Depends(get_current_user)):
    with db_connection.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        cursor.execute("SELECT book FROM favorites WHERE user_id = %s", (user[0],))
        favorites = cursor.fetchall()
        logger.info(f"Favoritos recuperados para {username}.")
    return {"favorites": [f[0] for f in favorites]}
