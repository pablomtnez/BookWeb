# BOOKS MICROSERVICE 📖
This microservice is developed in Node.js and uses a MongoDB database. It is responsible for managing all actions related to books, including fetching, adding, and updating book data.

## INSTALLATION ⚙️
To run it, you need to download or clone the repository and have MongoDB and Node.js installed.

You need to download the following dependencies:

**axios, cors, dotenv, express, mongoose, swagger-jsdoc, and swagger-ui-express**

To do this, run the following command:

    npm install axios cors dotenv express mongoose swagger-jsdoc swagger-ui-express

## CONFIGURATION ⚙️
1. Create a `.env` file in the root directory with the following content:

       MONGO_URI=<your_mongodb_connection_string>
       PORT=9000

   Replace `<your_mongodb_connection_string>` with your MongoDB connection string.

2. Ensure MongoDB is running on your machine or accessible remotely.

## EXECUTION ▶️
To run the project, simply execute the following command:

    npm start

## DOCUMENTATION 📄
If you want to see the documentation of the API, you can access it at this [link](http://localhost:9000/api-docs) after starting the server.
