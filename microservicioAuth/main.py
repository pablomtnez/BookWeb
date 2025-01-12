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

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de encriptación de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Inicializar FastAPI
app = FastAPI()

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

@app.post("/favorites/add")
async def add_favorite_book(favorite: AddFavoriteBook, token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        async with db.cursor() as cursor:
            await cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            await cursor.execute(
                "INSERT INTO favorites (user_id, book) VALUES (%s, %s)",
                (user[0], favorite.book),
            )
            await db.commit()
            return {"message": f"Book '{favorite.book}' added to favorites."}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/favorites")
async def get_favorite_books(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        async with db.cursor() as cursor:
            await cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            await cursor.execute("SELECT book FROM favorites WHERE user_id = %s", (user[0],))
            favorites = await cursor.fetchall()
            return {"favorites": [f[0] for f in favorites]}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
