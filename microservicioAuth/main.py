from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
import datetime
import aiomysql
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de encriptación de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Inicializar FastAPI con root_path para el gateway
app = FastAPI(
    docs_url="/docs",  # Swagger estará disponible en /auth/docs a través del gateway
    redoc_url="/redoc",  # ReDoc estará disponible en /auth/redoc a través del gateway
    root_path="/auth"  # Este prefijo es manejado por el gateway
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

# Modelos Pydantic
class User(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=8)

class Token(BaseModel):
    access_token: str
    token_type: str

class AddFavoriteBook(BaseModel):
    book: str = Field(..., min_length=1, max_length=255)

class DeleteFavoriteBook(BaseModel):
    book: str = Field(..., min_length=1, max_length=255)

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
@app.post("/register")
async def register_user(user: User, db=Depends(get_db)):
    print("Received request: /register")
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
        print("User registered successfully")
        return {"message": "User registered successfully"}

@app.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    print("Received request: /login")
    async with db.cursor() as cursor:
        await cursor.execute("SELECT password_hash FROM users WHERE username = %s", (form_data.username,))
        user = await cursor.fetchone()
        if not user or not verify_password(form_data.password, user[0]):
            raise HTTPException(status_code=400, detail="Invalid username or password")

        access_token = create_access_token(data={"sub": form_data.username})
        print("Login successful")
        return {"access_token": access_token, "token_type": "bearer"}
