let ground;
let avatar;
let barriers;

let isGameOver = false;
let hasGameBegun = false;
let score = 0;

let arcadeFont;

let minDistanceBetweenBarriers = 200;
let nextSpawnDistance;
let isInvincible = false;

let runningImage;
let jumpingImage;
let pipeImage;

let aButtonPressed = false;
let bButtonPressed = false;

let pointsound;
let overworldmusic;
let defeatmusic;

//this is to load all the images, gifs, and audio
function preload() {
  arcadeFont = loadFont("arcadefont.ttf");
  runningImage = loadImage("run.gif");
  jumpingImage = loadImage("jump.gif");
  pipeImage = loadImage("pipe.png");
  pointsound = loadSound("coin.mp3");
  overworldmusic = loadSound("Overworld.mp3");
  defeatmusic = loadSound("Defeat.mp3");
}

//setup for the game
function setup() {
  createCanvas(600, 600);
  textFont(arcadeFont);
  ground = new Ground();

  resetGame();

  //stop game loop until space bar hit to begin
  noLoop();
}

//this code resests the game
function resetGame() {
  score = 0;
  isGameOver = false;

  avatar = new Avatar(ground.y);
  barriers = [new Barrier(600, ground.y)];
  overworldmusic.loop(); //this plays the music from the beginning
  loop();
}

function draw() {
  //this is to create the gameboy
  // gameboy
  fill(180);
  stroke(100);
  rect(50, 50, 300, 500, 20);

  // Screen broder
  fill(50, 50, 50);
  rect(90, 90, 220, 180, 10);

  // inner screen
  fill(135, 206, 235);
  noStroke();
  rect(100, 100, 200, 160);

  // d-pad
  fill(100);
  rect(100, 300, 20, 50);
  rect(85, 315, 50, 20);

  // A and B buttons
  fill(aButtonPressed ? 200 : 150, 0, 0);
  ellipse(250, 320, 40);
  fill(bButtonPressed ? 200 : 150, 0, 0);
  ellipse(290, 360, 40);

  //A and B labels
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("A", 250, 320);
  text("B", 290, 360);

  // Start and Select Buttons
  fill(100);
  rect(140, 370, 40, 10, 5);
  rect(200, 370, 40, 10, 5);

  // Speaker
  for (let i = 0; i < 6; i++) {
    rect(140, 420 + i * 10, 120, 5);
  }

  push();
  scale(0.35); //this is for changing the scale of the game
  translate(280, 315); //this is for positing the game within the screen of the gameboy

  //this is code for the pipes spawning in.
  if (
    barriers.length <= 0 ||
    600 - barriers[barriers.length - 1].x >= nextSpawnDistance
  ) {
    barriers.push(new Barrier(600, ground.y));
    nextSpawnDistance = random(minDistanceBetweenBarriers, 600 * 1.2);
  }

  avatar.update(ground.y);
  ground.draw();

  //this is code for the character interacting with the pipes
  for (let i = barriers.length - 1; i >= 0; i--) {
    barriers[i].update();
    barriers[i].draw();

    if (isInvincible != true && barriers[i].checkIfCollision(avatar)) {
      isGameOver = true;
      overworldmusic.stop();
      defeatmusic.play(); //this plays music when you hit the pipe.
      noLoop();
    }

    if (
      barriers[i].hasScoredYet == false &&
      barriers[i].getRight() < avatar.x
    ) {
      barriers[i].hasScoredYet = true;
      score++;
      pointsound.play(); //this makes a sound whenever you score and jump over the pipe.
    }

    if (barriers[i].getRight() < 0) {
      barriers.splice(i, 1);
    }
  }

  avatar.draw();
  drawScore();
  pop();
}

function drawScore() {
  fill(0);
  textAlign(LEFT);
  textSize(15);
  text("Score:" + score, 10, 20);

  if (isGameOver) {
    fill(0, 0, 0, 100);
    rect(0, 0, 600, 400);

    textAlign(CENTER);
    textSize(35);
    fill(255);
    text("GAME OVER!", 600 / 2, 400 / 3);

    textSize(12);
    text("Press SPACE BAR to play again.", 600 / 2, 400 / 2);
  } else if (hasGameBegun == false) {
    fill(0, 0, 0, 100);
    rect(0, 0, 600, 400);

    textAlign(CENTER);
    textSize(15);
    fill(255);
    text("Press SPACE BAR to play!", 600 / 2, 400 / 3);
  }
}

function keyPressed() {
  if (key == " ") {
    aButtonPressed = true; //press A button
    if (avatar.isOnGround()) {
      avatar.jump();
    }
    if (isGameOver == true) {
      resetGame();
    } else if (hasGameBegun == false) {
      hasGameBegun = true;
      loop();
    }
  }
}

function keyReleased() {
  if (key == " ") {
    aButtonPressed = false; // reactive A button
  }
}

//creates a new class and allows it to use the properties of the shape w/o redefining them
class Ground extends Shape {
  //used to create new instances of the class (ground)
  constructor() {
    //ground size on screen
    let yGround = 400 * 0.7;

    let groundHeight = ceil(427 - yGround);
    //sets up the grounds position and size using "shape" class
    super(0, yGround, 600, groundHeight);
    // "this" is a unique coordinates for the ground
    this.fillColor = color(34, 139, 34); //ground color, "this" is used to define or modify somthing, or use things of the same class.
  }

  draw() {
    push();
    noStroke();
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}

class Barrier extends Shape {
  constructor(x, yGround) {
    let barrierWidth = 40; //width for pipes
    let barrierHeight = 80; //height for pipes
    let y = yGround - barrierHeight + 20;
    super(x, y, barrierWidth, barrierHeight);
    this.speed = 6;
    this.hasScoredYet = false;
  }

  checkIfCollision(shape) {
    return this.overlaps(shape);
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    push();
    image(pipeImage, this.x, this.y, this.width, this.height); // draw pipe image
    pop();
  }
}

class Avatar extends Shape {
  constructor(yGround) {
    let avatarHeight = 20;
    super(64, yGround - avatarHeight - 20, 10, 20); //raised avatar position
    this.fillColor = color(70);
    this.gravity = 0.9;
    this.jumpStrength = 25;
    this.yVelocity = 0;
    this.yGround = yGround;
    this.isJumping = false;
  }

  jump() {
    this.yVelocity += -this.jumpStrength;
    this.isJumping = true;
  }

  isOnGround() {
    return this.y == this.yGround - this.height - 20;
  }

  update() {
    this.yVelocity += this.gravity;
    this.yVelocity *= 0.9;
    this.y += this.yVelocity;

    if (this.y + this.height > this.yGround - 20) {
      this.y = this.yGround - this.height - 20;
      this.yVelocity = 0;
      this.isJumping = false;
    }
  }

  draw() {
    push();
    if (this.isJumping) {
      image(jumpingImage, this.x, this.y, this.width * 4, this.height * 4);
    } else {
      image(runningImage, this.x, this.y, this.width * 4, this.height * 4);
    }
    pop();
  }
}

//https://github.com/quinton-ashley/p5play
//https://github.com/Vamoss/p5.joystick
// https://editor.p5js.org/elias1233official/sketches/ZYE6yuzxK
//https://p5js.org/reference/p5/loadFont/
//https://p5js.org/reference/p5/class/
//https://p5play.org/learn/
//https://www.pngall.com/mario-pipe-png/download/166238/
//https://media.tenor.com/4zTN8bWKI5YAAAAi/mario-luigi.gif
//https://tenor.com/view/mario-walking-retro-game-pixel-art-gif-14233254
//I borrowed the music from this code for this sketch -Jaeden
//https://editor.p5js.org/feenixroyale24/sketches/lnbOntlyM
