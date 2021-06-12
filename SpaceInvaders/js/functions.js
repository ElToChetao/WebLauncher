window.addEventListener("load", start);
document.addEventListener("visibilitychange", onChange);

var lastTime;

var bulletFolder;

var keyPressed = [];

var controls = {
	LEFT  : "ArrowLeft",
  RIGHT : "ArrowRight",
  SHOOT : " ",
  PAUSE : "p",
  START : "Enter"
}

var score = 0;

var player;
var enemyManager;

var bullets = [];

var gamePaused = false;
var gameStarted = false;

var pauseScreen;

var game;
var playArea;

var playAreaBorder = 30;
var lateralBorders = 100;
var HUDheight = 100;
var screenWidth;
var screenHeight;

var brickManager;

var scoreText;

var flyingSourcer = null;

var flyingSourcerDelay = 10;
var timeSinceLastFlyingSourcer = 0;

var enterText;
var pauseImage;
var gameOverText;

var canStart = false;

var backgroundMusic = new Audio('sounds/bso.mp3');

class Gameobject{
  constructor(x, y, dom){
    this.x = x;
    this.y = y;

    this.dom = dom;

    this.width = this.dom.getBoundingClientRect().width;
    this.height = this.dom.getBoundingClientRect().height;
  }
}
class Player extends Gameobject{
  constructor(x, y, dom){
    super(x, y, dom);

    this.maxLifes = 3;
    this.currentLifes = this.maxLifes;

    this.speed = 600;
    this.borderOffset = 10;

    this.shootDelay = 1;
    this.timeSinceLastShoot = this.shootDelay;

    this.setPosition(this.x, this.y);

    this.shootSound = new Audio('sounds/shoot.wav');
    this.damageSound = new Audio('sounds/');

    this.HUDlifes = document.getElementsByClassName("life");
    var offset = this.HUDlifes[0].getBoundingClientRect().width;
    for (let i = 0; i < this.HUDlifes.length; i++)
    {
      this.HUDlifes[i].style.left = playAreaBorder + offset + (i * offset * 2) + "px";
      this.HUDlifes[i].style.top = screenHeight + offset + "px";
    }
    this.updateHUDLifes();
  };

  setPosition(newX, newY){
    this.x = newX - (this.width);
    this.y = newY - (this.height / 2);
    this.dom.style.left = this.x + "px";
    this.dom.style.top = this.y + "px";
  }
  move(direction, dt){
    var newX = this.x + this.speed * direction * dt;
    newX = Math.min(Math.max(newX, this.borderOffset), screenWidth - this.width - (playAreaBorder * 2) - this.borderOffset);

    this.x = newX;
    this.dom.style.left = this.x + "px";
  }
  update(dt){
    this.timeSinceLastShoot += dt;
  }
  shoot(){
    if (this.timeSinceLastShoot >= this.shootDelay)
    {
      this.timeSinceLastShoot = 0;

      var newBullet = new Bullet(this.x + (this.width / 2), this.y - this.borderOffset, document.createElement("div"), -1);
      bullets.push(newBullet);
      this.shootSound.play();
    }
  }
  doDamage(){
    this.currentLifes--;
    this.updateHUDLifes();
    if (this.currentLifes <= 0)
    {
      gameOver();
    }
  }
  heal(){
    this.currentLifes = this.maxLifes;
    this.updateHUDLifes();
  }
  updateHUDLifes(){
    for (let i = 0; i < this.HUDlifes.length; i++)
    {
      this.HUDlifes[i].style.display = i < this.currentLifes ? "block" : "none";
    }
  }
}
class EnemyManager{
  constructor(x, y, dom, numEnemiesPerRow, numEnemiesPerColumn, iniX, iniY){
    this.x = x;
    this.y = y;

    this.dom = dom;

    this.enemies = this.createEnemies(numEnemiesPerColumn, numEnemiesPerRow, iniX, iniY);
    this.initEnemiesSprites();

    this.moveOffet = this.enemies[0][0].width / 3;

    this.updateEnemiesDelay = 0.5;
    this.timeSinceLastUpdate = 0;

    this.enemiesDirection = 1;

    this.bottomLeftEnemy = this.enemies[numEnemiesPerColumn - 1][0];
    this.bottomRightEnemy = this.enemies[numEnemiesPerColumn - 1][numEnemiesPerRow - 1];
  }
  createEnemies(numEnemiesPerColumn, numEnemiesPerRow, iniX, iniY){

    var enemies = [];
    for (let i = 0; i < numEnemiesPerColumn; i++)
    {
      var enemiesRow = [];
      for (let j = 0; j < numEnemiesPerRow; j++)
      {
        var canShoot = false;
        if (i == numEnemiesPerColumn - 1)
        {
          canShoot = true;
        }
        var newEnemy = new Enemy(j, i, this.dom, canShoot, this.updateEnemiesDelay, iniX, iniY);
        enemiesRow.push(newEnemy);
      }
      enemies.push(enemiesRow);
    }
    return enemies;
  }
  newEnemyWave(numEnemiesPerColumn, numEnemiesPerRow, iniX, iniY){
    this.updateEnemiesDelay *= 1.5;
    this.timeSinceLastUpdate = 0;

    this.enemiesDirection = 1;

    this.enemies = this.createEnemies(numEnemiesPerColumn, numEnemiesPerRow, iniX, iniY);
    this.initEnemiesSprites();
  }

  updateEnemies(dt)
  {
    this.timeSinceLastUpdate += dt;
    this.checkNullEnemies();
    if (this.timeSinceLastUpdate >= this.updateEnemiesDelay)
    {
      this.timeSinceLastUpdate = 0;
      var newX = this.moveOffet * this.enemiesDirection;
      var newY = 0;
      if (this.bottomLeftEnemy.x + newX <= playAreaBorder || this.bottomRightEnemy.x + newX >= screenWidth - playAreaBorder * 2 - this.bottomRightEnemy.width)
      {
        this.enemiesDirection *= -1;
        newX = 0;
        newY += this.moveOffet * 3;
        if (this.bottomLeftEnemy.y + this.bottomLeftEnemy.height + newY >= screenHeight - HUDheight - 70)
        {
          gameOver();
        }
      }
      this.moveEnemies(newX, newY);
    }
    this.updateEnemy(dt);
  }
  moveEnemies(x, y){
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      for (let j = this.enemies[i].length - 1; j >= 0 ; j--)
      {
        if(this.enemies[i][j].dom != null && gameStarted)
        {
          this.enemies[i][j].updatePosition(x, y);
          this.enemies[i][j].changeSprite();
        }
      }
    }
  }
  async initEnemiesSprites(){
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      for (let j = 0; j < this.enemies[i].length ; j++)
      {
        this.enemies[i][j].changeSprite();
        await sleep(100 * this.updateEnemiesDelay);
      }
    }
    canStart = true;
    enterText.style.display = "block";
  }
  updateEnemy(dt){
    for (let i = 0; i < this.enemies.length; i++)
    {
      for (let j = 0; j < this.enemies[i].length; j++)
      {
        if (i < this.enemies.length - 1 && this.enemies[i + 1][j].dom == null)
        {
          this.enemies[i][j].canShoot = true;
        }
        if(this.enemies[i][j].dom != null)
        {
          this.enemies[i][j].updateEnemy(dt);
        }
      }
    }
  }
  checkCollisions(bullet, bulletIndex)
  {
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      for (let j = this.enemies[i].length  - 1; j >= 0; j--)
      {
        if (this.enemies[i][j].dom != null && AABBCollision(bullet, this.enemies[i][j]))
        {
          bullet.destroy(bulletIndex);
          this.enemies[i][j].destroy();

          this.updateEnemiesDelay *= 0.9;
          this.updateEnemiesDelay = Math.max(this.updateEnemiesDelay, 0.05);
          return;
        }
      }
    }
  }
  destroyEnemies(){
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      for (let j = this.enemies[i].length  - 1; j >= 0; j--)
      {
        if (this.enemies[i][j].dom != null)
        {
          this.enemies[i][j].destroy();
        }
      }
    }
  }
  updateCornerEnemies()
  {
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      if (this.enemies[i][0].dom != null)
      {
        this.bottomLeftEnemy = this.enemies[i][0];
        break;
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      if (this.enemies[i][this.enemies[i].length - 1].dom != null)
      {
        this.bottomRightEnemy = this.enemies[i][this.enemies[i].length - 1];
        break;
      }
    }
  }
  checkNullEnemies()
  {
    //check if any row is null
    for (let i = this.enemies.length - 1; i >= 0; i--)
    {
      if (this.enemies[i].every(this.isNull))
      {
        this.enemies.splice(i, 1);
      }
    }
    // check if right column is null
    var rightColumn = [];
    for (let i = 0; i < this.enemies.length; i++)
    {
      rightColumn.push(this.enemies[i][this.enemies[i].length - 1]);
    }
    if (rightColumn.every(this.isNull))
    {
      for (let i = this.enemies.length - 1; i >= 0; i--)
      {
        this.enemies[i].pop();
      }
    }

    // check if left column is null
    var leftColumn = [];
    for (let i = 0; i < this.enemies.length; i++)
    {
      leftColumn.push(this.enemies[i][0]);
    }
    if (leftColumn.every(this.isNull))
    {
      for (let i = this.enemies.length - 1; i >= 0; i--)
      {
        this.enemies[i].shift();
      }
    }
    // check win
    if (this.enemies.length <= 0)
    {
      nextLvl();
    }
    else
    {
      this.updateCornerEnemies();
    }
  }
  isNull(enemy){
    return enemy.dom == null;
  }
}
class Enemy{
  constructor(x, y, parent, canShoot, changeSpriteDelay, iniX, iniY){
    this.shootDelay = Math.random();
    this.canShoot = canShoot;

    this.dom = document.createElement("div");
    this.dom.classList.add("enemy");
    parent.appendChild(this.dom);

    this.width = this.dom.getBoundingClientRect().width;
    this.height = this.dom.getBoundingClientRect().height;

    this.x = x * (this.width + this.width * 0.4) + iniX;
    this.y = y * (this.height + this.width * 0.1) + iniY;

    this.dom.style.left = this.x + "px";
    this.dom.style.top = this.y + "px";

    this.shootDelay = Math.random()*4 + 1;
    this.timeSinceLastShoot = 0;

    this.spriteChangeDelay = changeSpriteDelay;
    this.timeSinceLastSpriteChange = this.spriteChangeDelay;

    this.currentSprite = 1;

    this.deathSound = new Audio('sounds/invaderkilled.wav');
    this.shootSound = new Audio('sounds/shoot.wav');
  }
  changeSprite(dt){
    if(this.currentSprite == 0)
    {
      this.currentSprite = 1;
      this.dom.style.backgroundImage = "url('images/enemy1.png')";
    }
    else
    {
      this.currentSprite = 0;
      this.dom.style.backgroundImage = "url('images/enemy0.png')";
    }
  }
  updatePosition(x, y)
  {
    var newX = this.x + x;
    var newY = this.y + y;

    this.x = newX;
    this.y = newY;

    this.dom.style.left = this.x + "px";
    this.dom.style.top = this.y + "px";
  }
  updateEnemy(dt){
    if (this.canShoot)
    {
      this.timeSinceLastShoot += dt;
      this.shoot();
    }
  }
  destroy(){
    this.dom.remove();
    this.dom = null;
    this.deathSound.play();
    updateScore(10);
  }
  shoot(){
    if (this.timeSinceLastShoot >= this.shootDelay)
    {
      this.timeSinceLastShoot = 0;
      this.shootDelay = Math.random() * 5 * enemyManager.updateEnemiesDelay + 1;
      var newBullet = new Bullet(this.x + (this.width / 2), this.y + this.height, document.createElement("div"), 1, true);
      bullets.push(newBullet);
      this.shootSound.play();
    }
  }
}
class FlyingSourcer{
  constructor(x, y, dom){
    this.x = x;
    this.y = y;

    this.dom = dom;

    this.dom.style.left = this.x + "px";
    this.dom.style.top = this.y + "px";

    this.direction = 1;
    this.speed = 200;

    playArea.appendChild(this.dom);
    this.dom.classList.add("flying-sourcer");

    this.width = this.dom.getBoundingClientRect().width;
    this.height = this.dom.getBoundingClientRect().height;

    this.moveSound = new Audio('sounds/flyingSourcer.wav');
    this.moveSound.play();
    this.moveSound.loop = true;

    this.deathSound = new Audio('sounds/invaderkilled.wav');
  }
  move(dt)
  {
    var newX = this.x + this.speed * dt * this.direction;
    if(newX >= screenWidth - this.width - (playAreaBorder * 2))
    {
      this.destroy();
      return;
    }
    this.x = newX;
    this.dom.style.left = this.x + "px";
  }
  destroy(score = 0){
    this.dom.remove();
    flyingSourcer = null;

    this.moveSound.pause();
    this.moveSound.currentTime = 0;

    this.deathSound.play();
    updateScore(score);
  }
}
class Bullet{
  constructor(x, y, dom, direction, enemyBullet = false){
    this.dom = dom;

    this.enemyBullet = enemyBullet;

    this.dom.classList.add("bullet");
    bulletFolder.appendChild(this.dom);

    this.width = this.dom.getBoundingClientRect().width;
    this.height = this.dom.getBoundingClientRect().height;

    this.x = x - this.width / 2;
    this.y = y - this.height;

    this.dom.style.left = this.x + "px";
    this.dom.style.top = this.y + "px";

    this.direction = direction;
    this.bulletSpeed = 600;
  }
  move(dt, bulletIndex){
    var newY = this.y + (dt * this.bulletSpeed * this.direction);
    if(this.direction == -1)
    {
      if (newY < 0)
      {
        this.destroy(bulletIndex);
        return;
      }
    }
    else
    {
      if (newY >= screenHeight - HUDheight)
      {
        this.destroy(bulletIndex);
        return;
      }
    }
    this.y = newY;
    this.dom.style.top = this.y + "px";
  }
  destroy(i)
  {
    this.dom.remove();
    bullets.splice(i, 1);
  }
}
class BrickManager{
  constructor(numBlocks)
  {
    this.bricks = [];
    this.parentDom = document.getElementById("bricks-folder");
    var spaceBetweenBlocks = screenWidth / numBlocks;
    var iniX = (spaceBetweenBlocks / 2) - (30 * 5);
    for (let i = 0; i < numBlocks; i++)
    {
      this.createBlock(iniX + spaceBetweenBlocks * i, screenHeight - HUDheight - 80);
    }
  }
  createBlock(iniX, iniY)
  {
    for (let i = 0; i < 3; i++)
    {
      for (let j = 0; j < 5; j++)
      {
        var newBrick = document.createElement("div");
        newBrick.classList.add("brick");
        this.parentDom.appendChild(newBrick);

        newBrick.width = newBrick.getBoundingClientRect().width;
        newBrick.height = newBrick.getBoundingClientRect().height;

        newBrick.x = iniX + j * newBrick.width;
        newBrick.y = iniY + i * newBrick.height;

        newBrick.style.left = newBrick.x + "px";
        newBrick.style.top = newBrick.y + "px";

        this.bricks.push(newBrick);
      }
    }
  }
  checkCollisions(bullet, bulletIndex)
  {
    for (let i = this.bricks.length - 1; i >= 0; i--)
    {
      if (AABBCollision(bullet, this.bricks[i]))
      {
        bullet.destroy(bulletIndex);
        this.bricks[i].remove();
        this.bricks.splice(i, 1);
        return;
      }
    }
  }
  destroyBricks()
  {
    for (let i = this.bricks.length - 1; i >= 0; i--)
    {
      this.bricks[i].remove();
      this.bricks.splice(i, 1);
    }
  }
}
function start()
{
  console.log("game loaded!");
  initGame();

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
}
function startGame(){
  requestAnimationFrame(loop);
  backgroundMusic.play();
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.2;
  enterText.style.display = "none";
  gameOverText.style.display = "none";
}
function update(currentTime) {
  var dt = (currentTime - lastTime) / 1000;

  player.update(dt);

  checkInputs(dt);

  updateBullets(dt);
  enemyManager.updateEnemies(dt);

  updateCollisions();

  updateFlyingSourcer(dt);

  backgroundMusic.playbackRate = 1 + Math.abs(enemyManager.updateEnemiesDelay - 0.5);
}
function loop(currentTime)
{
  if (lastTime != null)
  {
    if (!gameStarted)
    {
      return;
    }
    if (!gamePaused)
    {
      update(currentTime);
    }
  }
  lastTime = currentTime;
  requestAnimationFrame(loop)
}
function initGame()
{
  lastTime = null;

  game = document.getElementById("game");
  playArea = document.getElementById("play-area");

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight - HUDheight;

  player = new Player(screenWidth / 2, screenHeight - HUDheight, document.getElementById("player"));

  game.style.width = screenWidth + "px";
  game.style.height = screenHeight + "px";

  playArea.style.position = "absolute";
  playArea.style.width = screenWidth - (playAreaBorder * 2) + "px";
  playArea.style.height = screenHeight - (playAreaBorder * 2) + "px";

  playArea.style.left = playAreaBorder + "px";
  playArea.style.top = playAreaBorder + "px";

  bulletFolder = document.getElementById("bullet-folder");

  var enemiesFolder = document.getElementById("enemies-folder");
  enemyManager = new EnemyManager(0, 0, enemiesFolder, 6, 3, 100, 100);

  brickManager = new BrickManager(3);

  scoreText = document.getElementById("score-text");
  scoreText.style.right = 100 + "px";
  scoreText.style.top = screenHeight - HUDheight + 100 + "px";

  updateScore();
  enterText = document.getElementById("enter-text");
  enterText.style.left = screenWidth / 2 - enterText.getBoundingClientRect().width / 2 + "px";
  enterText.style.top = screenHeight - HUDheight + 70 + "px";
  canStart = false;
  enterText.style.display = "none";

  gameOverText = document.getElementById("game-over-text");
  gameOverText.style.position = "absolute";
  gameOverText.style.left = screenWidth / 2 - gameOverText.getBoundingClientRect().width / 2 + "px";
  gameOverText.style.top = screenHeight / 2 - gameOverText.getBoundingClientRect().height / 2 + "px";
  gameOverText.style.display = "none";

  pauseImage = document.getElementById("pause-image");
  pauseImage.style.position = "absolute";
  pauseImage.style.left = screenWidth / 2 - pauseImage.getBoundingClientRect().width / 2 + "px";
  pauseImage.style.top = screenHeight / 2 - pauseImage.getBoundingClientRect().height / 2 + "px";
  pauseImage.style.display = "none";
}
function gameOver(){
  gameStarted = false;
  gameOverText.style.display = "block";
  
  canStart = false;
  enterText.style.display = "none";

  player.setPosition(screenWidth / 2, screenHeight - HUDheight);
  player.heal();

  brickManager.destroyBricks();

  enemyManager.destroyEnemies();

  enemyManager.newEnemyWave(3, 6, 200, 100);
  enemyManager.updateEnemiesDelay = 0.5;

  brickManager = new BrickManager(3);

  for (let i = bullets.length - 1; i >= 0; i--)
  {
    bullets[i].destroy(i);
  }

  if (flyingSourcer != null)
  {
    flyingSourcer.destroy();
  }
  score = 0;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  timeSinceLastFlyingSourcer = 0;
}
function nextLvl(){
  gameStarted = false;

  player.setPosition(screenWidth / 2, screenHeight - HUDheight);
  player.heal();

  brickManager.destroyBricks();

  enemyManager.destroyEnemies();

  enemyManager.newEnemyWave(3, 6, 200, 100);

  brickManager = new BrickManager(3);

  for (let i = bullets.length - 1; i >= 0; i--)
  {
    bullets[i].destroy(i);
  }

  if (flyingSourcer != null)
  {
    flyingSourcer.destroy();
  }
  timeSinceLastFlyingSourcer = 0;
}
function onChange()
{
  if(!gamePaused)
  {
    pauseGame();
  }
}
function updateBullets(dt){
  for (let i = bullets.length - 1; i >= 0; i--)
  {
    bullets[i].move(dt, i);
  }
}
function checkInputs(dt){
  if(keyPressed[controls.LEFT]){
    player.move(-1, dt);
  }
  if(keyPressed[controls.RIGHT]){
    player.move(1, dt);
  }
  if(keyPressed[controls.SHOOT]){
    player.shoot();
  }
}
function keyDown(event){
  keyPressed[event.key] = true;
  if (canStart && keyPressed[controls.START])
  {
    gameStarted = true;
    startGame();
  }
  if(keyPressed[controls.PAUSE]){
    pauseGame();
  }
}
function keyUp(event){
	keyPressed[event.key] = false;
}
function AABBCollision(object, other)
{
  if (object != null && other != null)
  {
    return object.x < other.x + other.width &&
    object.x + object.width > other.x &&
    object.y < other.y + other.height &&
    object.y + object.height > other.y;
  }
  return false;
}
function updateCollisions()
{
  for (let i = bullets.length - 1; i >= 0; i--)
  {
    brickManager.checkCollisions(bullets[i], i);
    if(bullets[i] != null && !bullets[i].enemyBullet)
    {
      enemyManager.checkCollisions(bullets[i], i);
    }
  }
  if (flyingSourcer != null)
  {
    for (let i = bullets.length - 1; i >= 0; i--)
    {
      if (!bullets[i].enemyBullet && AABBCollision(bullets[i], flyingSourcer))
      {
        bullets[i].destroy(i);
        flyingSourcer.destroy(50);
      }
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--)
  {
    if (bullets[i].enemyBullet && AABBCollision(bullets[i], player))
    {
      bullets[i].destroy(i);
      player.doDamage();
    }
  }
}
function pauseGame()
{
  if (gameStarted)
  {
    gamePaused = !gamePaused;
    document.title = gamePaused ? "Game Paused" : "Space Invaders!";
    if(gamePaused)
    {
      pauseImage.style.display = "block";
      backgroundMusic.pause();
      if(flyingSourcer != null)
      {
        flyingSourcer.moveSound.pause();
      }
    }
    else
    {
      pauseImage.style.display = "none";
      backgroundMusic.play();
      if(flyingSourcer != null)
      {
        flyingSourcer.moveSound.play();
      }
    }
  }
}
function updateScore(amount = 0)
{
  score += amount;
  scoreText.textContent = "SCORE: " + score;
}
function updateFlyingSourcer(dt) {
  if (flyingSourcer != null) {
    flyingSourcer.move(dt);
  }
  else {
    timeSinceLastFlyingSourcer += dt;
    if (timeSinceLastFlyingSourcer >= flyingSourcerDelay) {
      timeSinceLastFlyingSourcer = 0;

      flyingSourcer = new FlyingSourcer(0, playAreaBorder, document.createElement("div"));
    }
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}