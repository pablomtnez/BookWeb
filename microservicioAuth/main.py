from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import pymysql
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from passlib.context import CryptContext
from requests_oauthlib import OAuth2Session
import os

def load_env():
    """Cargar las variables de entorno desde el archivo .env"""
    load_dotenv()

# Cargar variables de entorno
load_env()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

db_connection = pymysql.connect(
    host="localhost",
    user="root",
    password="root",
    database="bookweb",
    port=3306
)

# Inicializar FastAPI
app = FastAPI()

# Contexto para manejo de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Manejo de seguridad OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Middleware de CORS para permitir peticiones desde otras aplicaciones
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    password: str

class AddFavoriteBook(BaseModel):
    book: str  # Nombre del libro para agregar a favoritos

class DeleteFavoriteBook(BaseModel):
    book: str  # Nombre del libro para eliminar de favoritos

# Funciones auxiliares
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_google_auth_session():
    return OAuth2Session(
        client_id=GOOGLE_CLIENT_ID,
        redirect_uri="http://localhost:8000/google/callback",
        scope=["openid", "email", "profile"]
    )

# Autenticación con Google
@app.get("/google/login")
async def google_login():
    google = get_google_auth_session()
    authorization_url, _ = google.authorization_url(GOOGLE_AUTHORIZATION_URL, access_type="offline")
    return {"authorization_url": authorization_url}

@app.get("/google/callback")
async def google_callback(code: str):
    google = get_google_auth_session()
    token = google.fetch_token(
        GOOGLE_TOKEN_URL,
        client_secret=GOOGLE_CLIENT_SECRET,
        code=code
    )
    google = OAuth2Session(GOOGLE_CLIENT_ID, token=token)
    user_info = google.get(GOOGLE_USER_INFO_URL).json()

    # Manejo del usuario en la base de datos
    username = user_info.get("email")
    cursor = db_connection.cursor()
    cursor.execute("SELECT username FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.execute("INSERT INTO users (username) VALUES (%s)", (username,))
        db_connection.commit()

    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

# Rutas para manejo de favoritos
@app.post("/favorites/add")
async def add_favorite_book(favorite: AddFavoriteBook, token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    cursor = db_connection.cursor()
    cursor.execute("INSERT INTO favorites (username, book) VALUES (%s, %s)", (username, favorite.book))
    db_connection.commit()
    return {"message": f"Book '{favorite.book}' added to favorites."}

@app.delete("/favorites/delete")
async def delete_favorite_book(favorite: DeleteFavoriteBook, token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    cursor = db_connection.cursor()
    cursor.execute("DELETE FROM favorites WHERE username = %s AND book = %s", (username, favorite.book))
    db_connection.commit()
    return {"message": f"Book '{favorite.book}' removed from favorites."}

@app.get("/favorites")
async def get_favorite_books(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    cursor = db_connection.cursor()
    cursor.execute("SELECT book FROM favorites WHERE username = %s", (username,))
    favorites = cursor.fetchall()
    return {"favorites": [f[0] for f in favorites]}
