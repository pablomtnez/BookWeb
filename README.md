# BOOKWEB 📚
BookWeb is a project that leverages the OpenLibrary API to allow users to search for books, save their favorites, and view detailed information about each book. The application is built with a microservices architecture, ensuring scalability and modularity.

## MICROSERVICES ⚙️

### 1. AUTHENTICATION MICROSERVICE 🪪
This microservice is developed in Python (FastAPI) and manages user registration, login, and favorite books. User data is stored in a MySQL database.

#### INSTALLATION ⚙️
To run it, you need to download or clone the repository and have Python installed.

Install the dependencies listed in `requirements.txt`:

    pip install -r requirements.txt

You also need to set up the database on your computer:

#### MAC USER
To create the database, run the following command:

    mysql -u root -p < ./db/db.sql

#### WINDOWS USER
To create the database, run the following command:

    mysql -u root -p < .\db\db.sql

When prompted, enter your MySQL root user password (default is usually `root`).

#### EXECUTION ▶️
To run the project, execute the following command:

    uvicorn main:app --reload --host 0.0.0.0 --port 8000

#### DOCUMENTATION 📄
API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs) after starting the server.

---

### 2. BOOKS MICROSERVICE 📖
This microservice is developed in Node.js and interacts with MongoDB to manage book data. It supports operations like adding, retrieving, and updating book records. The API is documented using Swagger.

#### INSTALLATION ⚙️
To run it, you need to download or clone the repository and have Node.js and MongoDB installed.

Install the required dependencies:

    npm install axios cors dotenv express mongoose swagger-jsdoc swagger-ui-express

#### CONFIGURATION ⚙️
- Create a `.env` file in the root directory with the following content:

      MONGO_URI=<your_mongodb_connection_string>
      PORT=9000

- Replace `<your_mongodb_connection_string>` with your MongoDB connection string.

#### EXECUTION ▶️
To run the project, execute the following command:

    npm start

#### DOCUMENTATION 📄
API documentation is available at [http://localhost:9000/api-docs](http://localhost:9000/api-docs) after starting the server.

---

## FRONTEND 🖥️
The frontend is a web application developed using React. It allows users to register, log in, search for books, save favorites, and view detailed book information.

#### INSTALLATION ⚙️
To run it, you need to download or clone the repository and have Node.js installed.

Install the required dependencies:

    npm install react react-dom react-router-dom axios tailwindcss react-modal

#### STRUCTURE ⚙️
- **`src/components`**: Contains reusable React components.
- **`src/hooks`**: Custom hooks for additional functionality.
- **`src/api.js`**: Manages API calls.
- **`public`**: Static files like `favicon.ico` and `index.html`.

#### EXECUTION ▶️
To run the project, execute the following command:

    npm start

The application will be available at [http://localhost:3001](http://localhost:3001).

---

## FURTHER STEPS 🚀
- Ensure `.env` files are set up with correct API keys and database credentials for each microservice.
- Verify the OpenLibrary and MongoDB configurations before running the project.

