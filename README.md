Blogging Platform API
This repository contains the backend code for a simple Blogging Platform API built with Node.js, Express.js, and MongoDB. The API allows users to register, login, create, and retrieve blogs.

Features
User Authentication: Users can register and login securely using bcrypt for password hashing and JWT for token-based authentication.

Create Blogs: Authenticated users can create blogs by providing a title, content, and specifying the author ID.

Retrieve Blogs: Users can retrieve blogs by providing the author ID. This endpoint is protected, and only authenticated users can access it.

Procedure
Clone the Repository: Clone this repository to your local machine using git clone.

Install Dependencies: Run npm install to install all the required dependencies listed in package.json.

Set Up Environment Variables: Create a .env file in the root directory and define the following variables:

makefile
Copy code
MONGODB_URI=<your_mongodb_uri>
ACCESS_TOKEN_SECRET=<your_access_token_secret>
PORT=<port_number>
Start the Server: Run npm start to start the server. By default, it will run on port 3000 unless specified otherwise in the .env file.

API Endpoints
POST /api/register: Register a new user by providing a username and password in the request body.

POST /api/login: Login with an existing username and password. Upon successful login, it returns a JWT access token.

POST /api/blogs: Create a new blog by providing a blog title, content, and author ID. The author ID is stored as a foreign key in the blog schema.

GET /api/blogs/:authorId: Retrieve blogs written by a specific author by providing the author ID.

GET /api/blogs: Retrieve all blogs.

Authentication
Authentication is done using JWT tokens. Upon successful login, a token is generated, which should be included in the headers of subsequent requests as Authorization: <token>

To access protected endpoints such as creating or retrieving blogs, clients need to include the JWT token obtained during login.

Middleware
Application Level Middleware:

Error handling middleware and JSON body parsing middleware are implemented at the application level.
Router Level Middleware:

Authentication middleware is implemented at the router level for protecting routes that require authentication.

Dependencies
Express.js: Fast, unopinionated, minimalist web framework for Node.js.
Mongoose: MongoDB object modeling tool designed to work in an asynchronous environment.
Bcrypt: Library for hashing passwords.
JSONWebToken: Implementation of JSON Web Tokens for authentication.
dotenv: Loads environment variables from a .env file into process.env.
