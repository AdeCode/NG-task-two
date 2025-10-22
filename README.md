# Node.js Express String Analysis API

A Node.js + Express + JSON Server project that analyzes strings, stores their properties, and allows advanced querying — including natural language filters.

---

## Features
- Create string and store in the db
- Query strings
- Analyze strings for:
- Length (including spaces and punctuation)
- Word count
- Unique characters
- Character frequency map
- SHA-256 hash
- Palindrome check (case-insensitive)
- Store and retrieve analyzed strings in a JSON database
- Prevent duplicates with conflict detection
- Filter by multiple query parameters or natural language (e.g. “all single word palindromic strings”)
- Delete stored strings
- Uses json-server as a lightweight database

---

## Tech Stack
- **Node.js**
- **Express.js**
- **Dotenv** (for environment variables)
- **Nodemon** (for live development reload)
- **Axios** (HTTP client)
- **JSON Server** (mock database)
- **Crypto** (for unique IDs and SHA-256 hash)
- **Custom validators**

---



## Installation & Local Setup

### Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

2️⃣ Install dependencies
run npm install to install all dependencies

3️⃣ Create a .env file
In the project root, create a file named .env and add:
PORT=3000

4️⃣ Scripts in package.json

Ensure your package.json contains the following scripts:
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}

5️⃣ Run JSON Server (for database)

npx json-server --watch db/db.json --port 6000

This runs a mock API at: http://localhost:6000/stringData

6 Run the application
npm run dev

Open your browser or API client (like Postman) and visit:
http://localhost:5000/stringData

POST API to post new string: http://localhost:5000/strings
Request body =
{
  "value": "string to analyze"
}


API to get all records from the db: http://localhost:5000/strings
API to fetch string by string value: http://localhost:5000/strings/:string_value
API to filter string by natural language: http://localhost:5000/strings/filter-by-natural-language
API to delete string by string value: http://localhost:5000/strings/:string_value


