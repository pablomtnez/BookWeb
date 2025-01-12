from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.openapi.utils import get_openapi
import jwt
import datetime
import aiomysql
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")  # Usar la clave desde el .env o una por defecto
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # Sin prefijo /auth para simplificar

# Inicializar FastAPI
app = FastAPI(
    docs_url="/docs",  # Swagger estará disponible en /docs
    redoc_url="/redoc"  # ReDoc estará disponible en /redoc
)

# Configuración de conexión a la base de datos
async def get_db():
    connection = await aiomysql.connect(
        host="localhost",
        user="root",
        password="root",
        db="bookweb",
        port=3306,
    )
    try:
        yield connection
    finally:
        connection.close()

# Middleware para registrar solicitudes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"--- Incoming Request ---")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    print(f"Response Status: {response.status_code}")
    return response

# Modelos Pydantic
class User(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=8)

class Token(BaseModel):
    access_token: str
    token_type: str

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

# Endpoints
@app.get("/")
async def root():
    return {"message": "Auth Service is running"}

@app.post("/register")
async def register_user(user: User, db=Depends(get_db)):
    async with db.cursor() as cursor:
        await cursor.execute("SELECT username FROM users WHERE username = %s", (user.username,))
        existing_user = await cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_password = get_password_hash(user.password)
        await cursor.execute(
            "INSERT INTO users (name, username, password_hash) VALUES (%s, %s, %s)",
            (user.name, user.username, hashed_password),
        )
        await db.commit()
    return {"message": "User registered successfully"}

@app.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    async with db.cursor() as cursor:
        await cursor.execute("SELECT password_hash FROM users WHERE username = %s", (form_data.username,))
        user = await cursor.fetchone()
        if not user or not verify_password(form_data.password, user[0]):
            raise HTTPException(status_code=400, detail="Invalid username or password")

        access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}
