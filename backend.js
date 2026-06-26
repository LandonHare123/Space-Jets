// server.js
import http, { get } from "http";
import "dotenv/config";
import mariadb from "mariadb";
import https from "https";
import fs from "fs";
import crypto from "crypto";
const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

const PORT = 3000;
const server = https.createServer(
  {
    key: fs.readFileSync("127.0.0.1-key.pem"),
    cert: fs.readFileSync("127.0.0.1.pem"),
  },
  (req, res) => {
    // CORS

    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "GET" && req.url === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === "POST" && req.url === "/api/logout") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        const data = JSON.parse(body);
        let responseData = {};
        console.log(req.headers.cookie);
        const logoutResult = await delSession(req.headers.cookie.split("=")[1]);
        if (logoutResult) {
          responseData.message = "logged out";
          res.setHeader(
            "Set-Cookie",
            `session=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
          );
        } else {
          console.log("errorlogout");
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        responseData.success = true;
        res.end(JSON.stringify(responseData));
        console.log("logged out");
      });
      return;
    }
    if (req.method === "POST" && req.url === "/api/login") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        const data = JSON.parse(body);
        let responseData = {};

        // login path
        if (data.Action === "login") {
          //login function creates a session and returns the session id if successful, otherwise returns -1 for wrong pass and -2 for username dne
          const loginResult = await login(data.Email, data.Password);
          if (loginResult != -1 && loginResult != -2) {
            responseData.message = "logged in";
            responseData.curHighScore = await getHighScore(loginResult);
            res.setHeader(
              "Set-Cookie",
              `session=${loginResult}; HttpOnly; Path=/; SameSite=None; Secure`,
            );
          } else if (loginResult == -1) {
            responseData.message = "wrong pass";
          } else if (loginResult == -2) {
            responseData.message = "username dne";
          } else {
            console.log("errorlogin");
          }
          //if username dne is returned is creates an account and notifies the user, if
        } else if (data.Action === "create") {
          // create account path
          const createResult = await login(data.Email, data.Password);
          // doesnt = -2 means the username exists, if it also doesn't equal -1 then the account "logged in" on the server side, the session is deleted to "log out" on the server side
          if (createResult != -2) {
            responseData.message = "username exists";
            if (createResult != -1) {
              delSession(createResult);
            }
          } else if (createResult == -2) {
            await createAccount(data.Email, data.Password);
            responseData.message = "account created";
          } else {
            console.log("errorcreate");
          }
        } else {
          console.log("invalid action");
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        responseData.success = true;
        console.log(responseData);
        res.end(JSON.stringify(responseData));
      });

      return;
    }
    if (req.method === "POST" && req.url === "/api/writescore") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        const data = JSON.parse(body);
        const score = data.score;

        res.writeHead(200, { "Content-Type": "application/json" });
        const updateResult = await updateHighScore(
          req.headers.cookie.split("=")[1],
          score,
        );
        if (updateResult) {
          res.end(JSON.stringify({ success: true, message: "Score updated" }));
        } else {
          res.end(
            JSON.stringify({
              success: false,
              message: "Failed to update score",
            }),
          );
        }
      });
      return;
    }

    // fallback 404 for unknown routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  },
);

server.listen(PORT, () => {
  console.log(`Server running at https://127.0.0.1:${PORT}`);
});

async function createAccount(username, password) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      "INSERT INTO users (email, password_hash, highscore) VALUES (?, ?, ?)",
      [username, password, 0],
    );
  } finally {
    conn.release();
  }
}

async function login(username, password) {
  const conn = await pool.getConnection();
  try {
    const dbRes = await conn.query(
      "SELECT id,email,password_hash FROM users WHERE email = ?",
      [username],
    );
    if (dbRes.length > 0) {
      if (dbRes[0].password_hash == password) {
        return createSession(dbRes[0].id);
      } else {
        return -1;
      }
    } else {
      return -2;
    }
  } finally {
    conn.release();
  }
}

async function getUserId(sessionId) {
  const conn = await pool.getConnection();
  try {
    const dbRes = await conn.query(
      "SELECT user_id FROM sessions WHERE session_hash = ?",
      [sessionId],
    );
    return dbRes[0].user_id;
  } finally {
    conn.release();
  }
}
async function getHighScore(sessionId) {
  const conn = await pool.getConnection();
  console.log(sessionId);

  try {
    const dbRes = await conn.query(
      "SELECT highscore FROM users JOIN sessions ON users.id = sessions.user_id WHERE session_hash = ?",
      [sessionId],
    );
    console.log(dbRes);
    return dbRes[0].highscore;
  } finally {
    conn.release();
  }
}
async function updateHighScore(sessionId, score) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      "UPDATE users JOIN sessions ON users.id = sessions.user_id SET highscore = ? WHERE sessions.session_hash = ?",
      [score, sessionId],
    );
    return true;
  } finally {
    conn.release();
  }
}

async function delSession(sessionId) {
  const conn = await pool.getConnection();
  try {
    await conn.query("DELETE FROM sessions WHERE session_hash = ?", [
      sessionId,
    ]);
    return true;
  } finally {
    conn.release();
  }
}

async function createSession(userId) {
  const conn = await pool.getConnection();
  try {
    const sessionId = crypto.randomUUID();
    await conn.query(
      "INSERT INTO sessions (user_id, session_hash) VALUES (?, ?)",
      [userId, sessionId],
    );
    return sessionId;
  } finally {
    conn.release();
  }
}
