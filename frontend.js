const loginAcc = document.getElementById("login");
const createAcc = document.getElementById("create");
const user = document.getElementById("user");
const pass = document.getElementById("pass");
const spacejets = document.getElementById("spacejets");
const loginPage = document.getElementById("loginpage");
const loginMessage = document.getElementById("loginmessage");
const signOutbtn = document.getElementById("signout");
let gameOver = false;
const gameSpace = document.getElementById("gameBody");
const gameScreen = document.getElementById("gameScreen");
const toggle = document.getElementById("Toggle");
const gameOverElement = document.getElementById("gameover");
const highscoreElement = document.getElementById("highscorenum");
const currentscoreElement = document.getElementById("currentscorenum");
let alreadyRunning = false;
const rows = 32;
const columns = 100;

let clock = 0;
//dbHighscore stores hs currently in db, highscore stores the hs for use in code
let dbHighScore = null;
let highScore = 0;
let objectArray = [];
let meteorArray = [];
let starArray = [];

//Game Assets//
/*blank array for frame generation*/

const screenBlank = Array.from({ length: rows }, () =>
  Array(columns).fill(" "),
);

/*creates li elements for html */
for (let i = 0; i < screenBlank.length; i++) {
  let newLine = document.createElement("li");
  newLine.id = i;
  newLine.textContent = "";
  gameScreen.appendChild(newLine);
}
const gameScreenElements = gameScreen.querySelectorAll("li");

/*class for space objects */
class spaceObject {
  constructor(name, x, y, slope, graphic, width, height) {
    this.name = name;
    //position
    this.x = x;
    this.y = y;

    //slope (will be added later)
    this.slope = slope;
    //animation
    this.graphic = graphic;

    //size
    this.width = width;
    this.height = height;

    //hitbox
    this.top = this.y;
    this.bottom = this.y + this.height;
    this.left = this.x;
    this.right = this.x + this.width;
  }

  moveObj(vert, horiz) {
    this.y += vert;
    this.x += horiz;
    this.top = this.y;
    this.bottom = this.y + this.height;
    this.left = this.x;
    this.right = this.x + this.width;
  }
}

document.addEventListener("keydown", (event) => {
  if ((event.key === "w" || event.key === "ArrowUp") & (jet.y >= 1))
    jet.moveObj(-1, 0);
  if (
    (event.key === "s" || event.key === "ArrowDown") &
    (jet.y + jet.height < 32)
  )
    jet.moveObj(1, 0);
  if ((event.key === "a" || event.key === "ArrowLeft") & (jet.x >= 1))
    jet.moveObj(0, -1);
  if (
    (event.key === "d" || event.key === "ArrowRight") &
    (jet.x + jet.width < 100)
  )
    jet.moveObj(0, 1);
});

function withIn(val1, val2, val3, val4) {
  if (val1 < val3 && val3 < val2) return true;
  if (val1 < val4 && val4 < val2) return true;
  return false;
}

function collisionCheck(meteor) {
  const checkOne = withIn(meteor.top, meteor.bottom, jet.top, jet.bottom);
  const checkTwo = withIn(meteor.left, meteor.right, jet.left, jet.right);
  if (checkOne && checkTwo) return true;
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateNewMeteor() {
  const meteorgraphic = ["X101X", "11110", "10111", "X110X"];
  const meteor = new spaceObject(
    "meteor",
    96,
    randInt(2, 28),
    "0,0",
    meteorgraphic,
    5,
    4,
  );
  meteorArray.push(meteor);
}
function generateNewStar(randomness) {
  const starGraphicArray = ["'", "^", "*", '"', "+"];
  const random1 = randInt(0, 4);
  let startpoint = 101;
  const newStarGrapic = starGraphicArray[random1];
  if (randomness) startpoint = randomness;
  const newStar = new spaceObject(
    "star",
    startpoint,
    randInt(0, 31),
    "0,0",
    newStarGrapic,
    1,
    1,
  );
  starArray.push(newStar);
}

function writeToScreen(Array) {
  for (const [i, li] of gameScreenElements.entries()) {
    let screenFrontNewLine = "";
    let curLine = Array[i];
    for (const j of curLine) {
      screenFrontNewLine += j;
    }
    li.textContent = screenFrontNewLine;
  }
}

function populateNewFrame(spaceBodyArray, frame) {
  if (Array.isArray(spaceBodyArray)) {
    for (const spaceBody of spaceBodyArray) {
      const startX = spaceBody.x;
      const startY = spaceBody.y;
      try {
        for (const [i, line] of spaceBody.graphic.entries()) {
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char != "X") {
              frame[startY + i][startX + j] = char;
            }
          }
        }
      } catch (TypeError) {
        frame[startY][startX] = spaceBody.graphic;
      }
    }
  } else {
    const startX = spaceBodyArray.x;
    const startY = spaceBodyArray.y;
    for (const [i, line] of spaceBodyArray.graphic.entries()) {
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char != "X") frame[startY + i][startX + j] = char;
      }
    }
  }
  return frame;
}

function generateNewFrame(genObjArray) {
  let newFrame = screenBlank.map((row) => [...row]);
  for (const obj of genObjArray) {
    newFrame = populateNewFrame(obj, newFrame);
  }
  return newFrame;
}

function gameLoop() {
  let startTime = performance.now();
  const msPerFrame = 50;

  for (const meteor of meteorArray) {
    meteor.moveObj(0, -1);
    if (meteor.x + meteor.width <= 0)
      meteorArray.splice(meteorArray.indexOf(meteor), 1);

    if (collisionCheck(meteor)) gameOver = true;
  }
  if (gameOver == true) {
    gameOverChores();
    return;
  }
  if (clock % 8 == 0) {
    if (randInt(1, 100) >= 50) {
      generateNewMeteor();
    }
  }
  if (clock % 16 == 0) {
    generateNewStar();
    for (const star of starArray) {
      star.moveObj(0, -1);
      if (star.x < 0) starArray.splice(starArray.indexOf(star), 1);
    }
  }
  clock++;
  if (clock > highScore) {
    highscoreElement.textContent = String(clock);
    highScore = clock;
  }
  currentscoreElement.textContent = String(clock);
  const nf = generateNewFrame(objectArray);
  writeToScreen(nf);
  //console.log(performance.now() - startTime);
  setTimeout(
    () => {
      gameLoop();
    },
    msPerFrame - (performance.now() - startTime),
  );
}

//end Game Assets//

//encryption//
let sharedSecret = null;
let netKeyObject = null;
let netTranscript = "";
let logKeyObject = null;
let logTranscript = "";
//generated by AI
function b64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

// takes utf8 plaintext and Cryptokey Object key and returns ciphertext as a base64 string and iv as a b64 string
async function encryptAESGCM(plaintext, key) {
  const rawiv = crypto.getRandomValues(new Uint8Array(12));

  const ptEncoded = new TextEncoder().encode(plaintext);

  const ciphertextbuf = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: rawiv,
      tagLength: 128,
    },
    key,
    ptEncoded,
  );

  // debug
  const ctnauth = new Uint8Array(ciphertextbuf);
  const ctOnly = ctnauth.subarray(0, ctnauth.length - 16);
  const authTag = ctnauth.subarray(ctnauth.length - 16);

  const toHex = (bytes) =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));

  const hashBuf = await crypto.subtle.digest("SHA-256", ctnauth);
  const hashHex = toHex(new Uint8Array(hashBuf));

  //console.log("=== AES-GCM Encrypt Debug ===");
  // console.log({
  //   plaintextLength: ptEncoded.length,

  //   ivLength: rawiv.length,
  //   ivBase64: toB64(rawiv),
  //   ivHex: toHex(rawiv),

  //   totalCiphertextAndTagLength: ctnauth.length,
  //   ciphertextOnlyLength: ctOnly.length,
  //   authTagLength: authTag.length,

  //   authTagHex: toHex(authTag),

  //   ciphertextFirst32Hex: toHex(ctOnly.subarray(0, 32)),
  //   ciphertextLast32Hex: toHex(
  //     ctOnly.subarray(Math.max(0, ctOnly.length - 32)),
  //   ),

  //   ciphertextAndTagSHA256: hashHex,
  // });

  //debug end
  return {
    frontiv: btoa(String.fromCharCode(...rawiv)),
    frontciphertext: btoa(
      String.fromCharCode(...new Uint8Array(ciphertextbuf)),
    ),
  };
}

// takes base64ciphertext, base64nonce(iv), crytpoObject key and returns utf8 plaintext
async function decryptAESGCM(ciphertext, passediv, key) {
  const ctArrayBuffer = b64ToBytes(ciphertext);
  const ivArrayBuffer = b64ToBytes(passediv);

  const ptBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivArrayBuffer, tagLength: 128 },
    key,
    ctArrayBuffer,
  );
  const decoder = new TextDecoder("utf-8");

  return decoder.decode(ptBuffer);
}

//takes payload as a json object and returns {encrypted: {frontiv: ... , frontciphertext ...}} as a string for transport of network
async function netLock(payload) {
  const payloadString = JSON.stringify(payload);
  const encryptionJSON = await encryptAESGCM(payloadString, netKeyObject);
  const encryptionString = JSON.stringify({ encrypted: encryptionJSON });
  return encryptionString;
}

async function printKey(inputkey) {
  const rawKey = await crypto.subtle.exportKey("raw", inputkey);
  const hex = Array.from(new Uint8Array(rawKey))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  console.log(hex);
}
//sessiontype - utf8 string describing user versus network session
// messageTranscript - utf8 string tracking the tlshandshake json info for salt
// must be "net" or "log"
async function TLSHandshake(sessiontype, messageTranscript) {
  const keyPairs = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"],
  );
  const exportedPublicKey = await crypto.subtle.exportKey(
    "raw",
    keyPairs.publicKey,
  );
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(exportedPublicKey)),
  );
  let bodyjson = "";
  const bodyjsonPT = {
    Handshake: "ClientHello",
    ClientPublicKey: publicKeyBase64,
    ClientRandom: crypto.randomUUID(),
    SessionType: sessiontype,
  };

  if (sessiontype == "log") {
    bodyjson = await netLock(bodyjsonPT);
  } else if (sessiontype == "net") {
    bodyjson = JSON.stringify(bodyjsonPT);
  } else {
    console.log("invalide session type");
  }

  const response = await fetch("https://192.168.20.15:3000/api/TLSHandshake", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",

    body: bodyjson,
  });
  messageTranscript += bodyjson;
  const data = await response.json();
  messageTranscript += JSON.stringify(data);

  // converts base64 server public key to Uint8Array(Bytes)
  const serverPublicKeyBytes = Uint8Array.from(
    atob(data.ServerPublicKey),
    (c) => c.charCodeAt(0),
  );

  const serverPublicKey = await crypto.subtle.importKey(
    "raw",
    serverPublicKeyBytes,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    false,
    [],
  );

  sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: serverPublicKey },
    keyPairs.privateKey,
    256,
  );
  const sharedSecretBytes = new Uint8Array(sharedSecret);
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveKey"],
  );
  const encoder = new TextEncoder();

  const salt = encoder.encode(messageTranscript).buffer;
  const info = encoder.encode(sessiontype).buffer;

  const AESGCM_key = await crypto.subtle.deriveKey(
    { hash: "sha-512", info: info, name: "HKDF", salt: salt },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  console.log("key generated");

  return AESGCM_key;
}

//end encryption//

signOutbtn.addEventListener("click", async () => {
  gameover = true;
  gameOverChores();
  signOutChores();
  await signOutDB();
});

async function signOutDB() {
  const bodyjson = await netLock({ Action: "logout" });
  const res = await fetch("https://192.168.20.15:3000/api/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },

    body: bodyjson,
  });
}

async function updateHighScore(score) {
  const scoreCTpass = await encryptAESGCM(score.toString(), logKeyObject);
  const bodyjson = await netLock(scoreCTpass);
  const res = await fetch("https://192.168.20.15:3000/api/writescore", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyjson,
  });

  return await res.json();
}

loginAcc.addEventListener("click", async () => {
  logKeyObject = await TLSHandshake("log", logTranscript);
  const safeUser = await encryptAESGCM(user.value, logKeyObject);
  const safePass = await encryptAESGCM(pass.value, logKeyObject);
  const loginAccResult = await login(safeUser, safePass, "login");
  const dataString = await decryptAESGCM(
    loginAccResult.encrypted.backciphertext,
    loginAccResult.encrypted.backiv,
    netKeyObject,
  );
  const data = JSON.parse(dataString);
  if (data.message == "logged in") {
    loginChores(data);
  } else if (data.message == "wrong pass") {
    loginMessage.textContent = "Incorrect password";
  } else if (data.message == "username dne") {
    loginMessage.textContent = "Username does not exist";
  }
  user.value = "";
  pass.value = "";
});
createAcc.addEventListener("click", async () => {
  logKeyObject = await TLSHandshake("log", logTranscript);
  const safeUser = await encryptAESGCM(user.value, logKeyObject);
  const safePass = await encryptAESGCM(pass.value, logKeyObject);

  const createAccResultCT = await login(safeUser, safePass, "create");
  const datastring = await decryptAESGCM(
    createAccResultCT.encrypted.backciphertext,
    createAccResultCT.encrypted.backiv,
    netKeyObject,
  );
  const createAccResult = JSON.parse(datastring);
  console.log(createAccResult);

  if (createAccResult.message == "account created") {
    loginMessage.textContent = "Account created, you can now log in";
  } else if (createAccResult.message == "username exists") {
    loginMessage.textContent = "Username already exists";
  }
  user.value = "";
  pass.value = "";
});
async function login(email, password, action) {
  const bodyjson = await netLock({
    Action: action,
    Email: email,
    Password: password,
  });
  const res = await fetch("https://192.168.20.15:3000/api/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: bodyjson,
  });

  return await res.json();
}

toggle.addEventListener("click", () => {
  highscoreElement.textContent = String(highScore);
  if (alreadyRunning) return;

  alreadyRunning = true;
  gameOverElement.textContent = "";
  toggle.textContent = "Running";

  setTimeout(() => {
    objectArray.push(starArray);
    objectArray.push(meteorArray);
    for (i = 0; i < 87; i++) {
      generateNewStar(randInt(0, 97));
    }
    jet = new spaceObject(
      "name",
      20,
      10,
      "0,0",
      ["XX|\\___X", "<[] ___}", "XX|/XXXX"],
      8,
      3,
    );
    objectArray.push(jet);
    gameLoop();
  }, 250);
});

//Chore Functions
async function loginChores(result) {
  writeToScreen(screenBlank);
  dbHighScore = await decryptAESGCM(
    result.curHighScore.backciphertext,
    result.curHighScore.backiv,
    logKeyObject,
  );
  //setTimeout(() => {
  highScore = dbHighScore;
  highscoreElement.textContent = highScore;
  //}, 1000);

  gameOverElement.textContent = "";
  toggle.textContent = "Start";
  loginPage.style.display = "none";
  spacejets.style.display = "flex";
}

function signOutChores() {
  currentscoreElement.textContent = "0";
  highscoreElement.textContent = "0";
  highScore = 0;
  loginPage.style.display = "flex";
  spacejets.style.display = "none";
}
function gameOverChores() {
  if (highScore > dbHighScore) {
    updateHighScore(highScore);
    dbHighScore = highScore;
  }
  gameOverElement.textContent = "GAME OVER";
  toggle.textContent = "Play Again";
  alreadyRunning = false;
  objectArray.length = 0;
  meteorArray.length = 0;
  gameOver = false;
  clock = 0;
}

async function startup() {
  netKeyObject = await TLSHandshake("net", netTranscript);
}
startup();
