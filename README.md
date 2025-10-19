# Node.js Express Profile API with Cat Facts

A simple Node.js + Express API that returns a dynamic profile along with a random cat fact fetched from [https://catfact.ninja/fact](https://catfact.ninja/fact).

---

## Features
- Node.js + Express backend
- Fetches random cat facts from an external API
- Returns JSON responses with timestamps
- Environment variable support using `.env`
- Ready for Railway deployment

---

## Tech Stack
- **Node.js**
- **Express.js**
- **Dotenv** (for environment variables)
- **Nodemon** (for live development reload)

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

5️⃣ Run the application
npm run dev

Open your browser or API client (like Postman) and visit:
http://localhost:3000/me

You should see a response like:
{
    "status":"success",
    "user":{
        "email":"codeadex@gmail.com",
        "name":"Agoro Habeeb Adekorede",
        "stack":"Node.js/Express"
    },
    "timestamp":"2025-10-19T09:42:56.336Z",
    "fact":"It may take as long as 2 weeks for a kitten to be able to hear well.  Their eyes usually open between 7 and 10 days, but sometimes it happens in as little as 2 days."
}
