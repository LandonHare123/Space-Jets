const gameSpace = document.getElementById("gameBody");
const gameScreen = document.getElementById("gameScreen");
const toggle = document.getElementById("Toggle");
const gameOverElement = document.getElementById("gameover");
const highscoreElement = document.getElementById("highscorenum");
const currentscoreElement = document.getElementById("currentscorenum");
let alreadyRunning = false;
const rows = 32;
const columns = 100;
let test = "a";
let highScore = 0;
let objectArray = [];
let meteorArray = [];
let starArray = [];

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

toggle.addEventListener("click", () => {
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
      test,
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
});

const gameScreenElements = gameScreen.querySelectorAll("li");
let clock = 0;

function gameLoop() {
  //console.log("game loop");
  let startTime = performance.now();
  const msPerFrame = 50;
  let gameOver = false;
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
  if (clock % 4 == 0) {
    if (randInt(1, 100) >= 80) {
      generateNewMeteor();
    }
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
  start(objectArray);
  console.log(performance.now() - startTime);
  setTimeout(
    () => {
      gameLoop();
    },
    msPerFrame - (performance.now() - startTime),
  );
}

function gameOverChores() {
  gameOverElement.textContent = "GAME OVER";
  toggle.textContent = "Play Again";
  alreadyRunning = false;
  objectArray.length = 0;
  meteorArray.length = 0;
  gameOver = false;
  clock = 0;
}

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
    99,
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
  let startpoint = 97;
  const newStarGrapic = starGraphicArray[random1];
  if (randomness) startpoint = randomness;
  const newStar = new spaceObject(
    "star",
    startpoint,
    randInt(2, 28),
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

function start(newinput) {
  nf = generateNewFrame(newinput);
  writeToScreen(nf);
}
