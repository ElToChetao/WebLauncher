window.addEventListener("load", loadGame);
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
window.addEventListener('mousemove', setMousePos);
document.addEventListener("visibilitychange", onChange);

var game = {};

function loadGame(){
  start();
}
function start(){
  // create canvas
  createCanvas();
  // init game
  game.currentSceneIndex = 0;
  init();
  // start game loop
  requestAnimationFrame(loop);
}
function init() {
  game.gamePaused = false;
  game.gameOver = false;

  game.controls = {
    LEFT      : "a",
    RIGHT     : "d",
    UP        : "w",
    DOWN      : "s",
    INTERACT  : "e"
  }
  game.keyPressed = [];
  game.lastTime;
  game.mousePos = new Vector2();

  // create lvl and all elements
  createManagers();
  createLvl(scenes[game.currentSceneIndex]);

  // create player
  game.player = new Player(game.scene.player.x * game.canvas.width, game.scene.player.y * game.canvas.height, 20, 20);
}
function restart(){
  game.player.destroy();
  init();
}
function newGame() {
  start();
}
function nextScene(){
  game.player.destroy();
  game.currentSceneIndex++;
  if(game.currentSceneIndex > scenes.length - 1){
    game.gameOver = true;

    game.HUDctx.save();

    game.HUDctx.textAlign = "center";
    game.HUDctx.fillStyle = 'white';
    game.HUDctx.fillText("YOU WIN", game.HUDcanvas.width * 0.5, game.HUDcanvas.height);

    game.HUDctx.restore();
    return;
  }
  init();
}
function createLvl(scene) {
  game.scene = scene;
  createWalls();
  createBoxes();
  createEnemies();

  // place exit
  game.exit = new Exit(game.scene.exit.x * game.canvas.width, game.scene.exit.y * game.canvas.height, 40, 40);
}
function createEnemies() {
  if (game.scene.enemies.fingerSpinner != undefined) {
    for (let i = 0; i < game.scene.enemies.fingerSpinner.length; i++){
      var data = game.scene.enemies.fingerSpinner[i];
      game.enemyManager.addEnemy(new FingerSpinner(data.x * game.canvas.width, data.y * game.canvas.height, data.startAngle, data.secondAngle, data.vision * game.canvas.width));
    }
  }
  
  if (game.scene.enemies.path != undefined) {
    for (let i = 0; i < game.scene.enemies.path.length; i++){
      var data = game.scene.enemies.path[i];
      var normalizedCoords = [];
      for (let j = 0; j < data.pathCoords.length; j++){
        normalizedCoords.push(new Vector2(data.pathCoords[j].x * game.canvas.width, data.pathCoords[j].y * game.canvas.height))
      }
      game.enemyManager.addEnemy(new PathEnemy(normalizedCoords, data.loop));
    }
  }
}
function createBoxes() {
  game.boxes = [];
  if (game.scene.boxes != undefined){
    for (let i = 0; i < game.scene.boxes.length; i++){
      game.boxes.push(new Box(game.scene.boxes[i].x * game.canvas.width, game.scene.boxes[i].y * game.canvas.height));
    }
  }
}
function createManagers() {
  game.gameObjectManager = new GameObjectManager();
  game.enemyManager = new EnemyManager();
}
function createCanvas() {
  game.canvas = document.createElement("canvas");
  game.ctx = game.canvas.getContext("2d");
  game.canvas.width = window.innerWidth * 0.6;
  game.canvas.height = window.innerHeight * 0.6;
  game.canvas.style.backgroundColor = '#0f0f0f';
  document.body.appendChild(game.canvas);

  game.HUDcanvas = document.createElement("canvas");
  game.HUDctx = game.HUDcanvas.getContext("2d");
  game.HUDcanvas.width = window.innerWidth * 0.6;
  game.HUDcanvas.height = window.innerHeight * 0.8;
  game.HUDctx.font = "30px Times New Roman";
  document.body.appendChild(game.HUDcanvas);
}
function createWalls() {
  game.walls = [];
  wallSize = game.canvas.width * 0.02;
  wallSize = Math.min(wallSize, 10);
  // create borders
  game.walls.push(new Wall(0, 0, game.canvas.width, wallSize));
  game.walls.push(new Wall(0, game.canvas.height - wallSize, game.canvas.width, wallSize));
  game.walls.push(new Wall(0, 0, wallSize, game.canvas.height));
  game.walls.push(new Wall(game.canvas.width - wallSize, 0, wallSize, game.canvas.height - wallSize));

  // saved walls
  for (let i = 0; i < game.scene.walls.length; i++){
    var wall = game.scene.walls[i];
    game.walls.push(new Wall(wall.x * game.canvas.width, wall.y * game.canvas.height, wallSize + wall.width * game.canvas.width - 1, wallSize + wall.height * game.canvas.height));
  }
}
function loop(currentTime){
  if (game.lastTime != null)
  {
    if (!game.gamePaused)
    {
      var dt = (currentTime - game.lastTime) / 1000;

      game.gameObjectManager.update(dt);
      
      if (game.gameOver){
        return;
      }
    }
  }
  game.lastTime = currentTime;
  requestAnimationFrame(loop);
}
function keyDown(event){
  game.keyPressed[event.key] = true;

  if (game.gameOver && event.key == "Enter") {
    newGame();
  }
}
function keyUp(event){
	game.keyPressed[event.key] = false;
}
function onChange(){
  game.gamePaused = !game.gamePaused;
}
function setMousePos(evt) {
  var rect = game.canvas.getBoundingClientRect();
  game.mousePos = new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
}
function rayCast(startPos, dir, maxDistance, render = false){
  var dir = normalizedVector(dir);
  var hitPos = new Vector2(0, 0);
  var hitDist = maxDistance;

  for (let i = 0; i < game.walls.length; i++){
    var currentPosition = new Vector2(startPos.x, startPos.y);
    var hit = false;
    hit = pointOverOject(currentPosition, game.walls[i]);
    while(!hit && distance(currentPosition, startPos) < maxDistance){
      currentPosition.x += dir.x;
      currentPosition.y += dir.y;
      hit = pointOverOject(currentPosition, game.walls[i]);
    }
    if (hit){
      hitPos = currentPosition;
      hitDist = distance(startPos, hitPos);
      break;
    }
  }
  if(render){
    game.ctx.beginPath();
    game.ctx.moveTo(startPos.x, startPos.y);
    game.ctx.lineTo(currentPosition.x, currentPosition.y);
    game.ctx.strokeStyle = "#FF0000";
    game.ctx.stroke(); 
  }
  return { hitPosition : hitPos, hitDistance: hitDist, collision : hit };
}
//CLASSES
/*********************************************************************************************************************************/
class GameObjectManager{
  constructor(){
    this.gameObjects = [];
  }
  addGameObject(go){
    this.gameObjects.push(go);
  }
  removeGameObject(go){
    if (go.destroy != undefined){
      go.destroy();
    }
    var index = this.gameObjects.indexOf(go);
    this.gameObjects.splice(index, 1);
  }
  update(dt){
    // clear screen
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.HUDctx.clearRect(0, 0, game.HUDcanvas.width, game.HUDcanvas.height);

    //render gameobjects
    this.gameObjects.forEach(element => {
      if (!(element instanceof Wall || element instanceof Box)){
        element.update(dt);
      }
      element.render();
    });
  }
}
class GameObject{
  constructor(x, y, width, height){
      this.position = new Vector2(x, y);
      this.width = width;
      this.height = height;
      this.placed = true;
      game.gameObjectManager.addGameObject(this);
  }
  move(vec){
      this.position.x += vec.x;
      this.position.y += vec.y;
  }
}
class Wall extends GameObject{
  constructor(x, y, width, height){
    super(x, y, width, height);
  }
  render(){
    game.ctx.fillStyle = '#2E294E';
    game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
class Exit extends GameObject{
  constructor(x, y, width, height){
    super(x - width / 2, y - width / 2, width, height);
  }
  render(){
    game.HUDctx.textAlign = "center";
    game.HUDctx.fillStyle = 'white';
    game.HUDctx.fillText("EXIT 🡮", this.position.x - game.canvas.width * 0.1, this.position.y + this.height);

    game.ctx.fillStyle = '#541388';
    game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(){
    if(AABBCollision(game.player, this)){
      nextScene();
    }
  }
}
class Box extends GameObject{
  constructor(x, y){
    super(x, y, 30, 30);
  }
  render(){
    game.ctx.fillStyle = '#FFD400';
    game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  move(vec){
    super.move(vec);
  }
}
class Player extends GameObject{
  constructor(x, y, width, height){
    super(x, y, width, height);
    this.speed = 2;
    this.stealth = 1;

    this.hidden = false;
    this.detected = false;
    this.canHide = false;
    this.canAttack = false;
    this.isMoving = false;

    this.selectedBox = null;

    this.gun = new Gun(this);

    this.shooting = this.shoot.bind(this);
    window.addEventListener("click", this.shooting);
  }
  render(){
    if(!this.hidden)
    {
      game.ctx.fillStyle = '#E576A1';
      game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    this.drawHUD();
  }
  destroy() {
    delete this.gun;
    window.removeEventListener("click", this.shooting);
    delete this.shooting;
  }
  drawHUD(){
    var width = game.HUDcanvas.width * 0.5;
    game.HUDctx.fillStyle = 'grey';
    game.HUDctx.fillRect(game.HUDcanvas.width / 2 - width / 2, game.HUDcanvas.height * 0.05, width, 10);
    game.HUDctx.fillStyle = 'green';
    game.HUDctx.fillRect(game.HUDcanvas.width / 2 - width / 2, game.HUDcanvas.height * 0.05, this.stealth * width, 10);

    var textContent = "";
    if(this.canHide){
      if(this.hidden){
        textContent = "PRESS " + game.controls.INTERACT.toUpperCase() + " TO GET OUT";
      }
      else {
        textContent = "PRESS " + game.controls.INTERACT.toUpperCase() + " TO HIDE";
      }
    }
    if(this.canAttack){
      textContent = "PRESS " + game.controls.INTERACT.toUpperCase() + " TO STUN ENEMY";
    }

    game.HUDctx.textAlign = "center";
    game.HUDctx.fillStyle = 'white';
    game.HUDctx.fillText(textContent, game.HUDcanvas.width * 0.5, game.HUDcanvas.height);
  }
  update(dt){
    this.move(dt);
    if(!this.hidden)
    {
      this.checkAttack();
    }
    this.checkHide();

    if (!game.enemyManager.enemiesAlerted()){
      this.stealth += dt * 0.2;
      this.stealth = Math.min(this.stealth, 1);
    }
  }
  move(dt){
    var hInput = 0;
    var vInput = 0;

    if (game.keyPressed[game.controls.LEFT]){
      hInput -= 1;
    }
    if (game.keyPressed[game.controls.RIGHT]){
      hInput += 1;
    }
    if (game.keyPressed[game.controls.DOWN]){
      vInput += 1;
    }
    if (game.keyPressed[game.controls.UP]){
      vInput -= 1;
    }

    this.isMoving = hInput != 0 || vInput != 0;
    if (hInput != 0 || vInput != 0) {
      var xOffset;
      var yOffset;
      var closestDistance;
      var finalOffset;

      if (this.selectedBox != null) {
        xOffset = hInput * this.speed / 2;
        yOffset = vInput * this.speed / 2;

        closestDistance = getClosestDistance(hInput, vInput, this.selectedBox, game.walls);
        finalOffset = new Vector2(mathMinMax(closestDistance.x, xOffset), mathMinMax(closestDistance.y, yOffset));
        this.selectedBox.move(finalOffset);
      }
      else{
        xOffset = hInput * this.speed;
        yOffset = vInput * this.speed;

        closestDistance = getClosestDistance(hInput, vInput, this, game.walls);
      }
      finalOffset = new Vector2(mathMinMax(closestDistance.x, xOffset), mathMinMax(closestDistance.y, yOffset));;
      super.move(finalOffset);
    }
  }
  checkHide(){
    this.canHide = false;
    var box;
    for (let i = 0; i < game.boxes.length; i++){
      if (AABBCollision(this, game.boxes[i])){
        this.canHide = true;
        box = game.boxes[i];
        break;
      }
    }

    if (this.canHide && game.keyPressed[game.controls.INTERACT]){
      this.hidden = !this.hidden;
      this.gun.canRender = !this.gun.canRender;
      game.keyPressed[game.controls.INTERACT] = false;

      if(this.hidden){
        this.selectedBox = box;
      }
      else{
        this.selectedBox = null;
      }
    }
  }
  checkAttack(){
    this.canAttack = false;
    var enemy;
    for (let i = 0; i < game.enemyManager.enemies.length; i++){
      if (AABBCollision(this, game.enemyManager.enemies[i])){
        this.canAttack = true;
        enemy = game.enemyManager.enemies[i];
      }
    }
    if (enemy != undefined && enemy.stunned){
      this.canAttack = false;
      return;
    }
    if (this.canAttack && game.keyPressed[game.controls.INTERACT]){
      enemy.stun();
      game.keyPressed[game.controls.INTERACT] = false;
    }
  }
  enemyAlerted(dt, distance = 1){
    this.stealth -= dt * distance;
    this.stealth = Math.max(this.stealth, 0);
    if(this.stealth <= 0){
      restart();
    }
  }
  shoot(){
    this.gun.shoot();
  }
}
class EnemyManager{
  constructor(){
    this.enemies = [];
  }
  addEnemy(go){
    this.enemies.push(go);
  }
  update(dt){
  }
  enemiesAlerted(){
    return this.enemies.some( enemy => enemy.alerted);
  }
}
class Enemy extends GameObject{
  constructor(x, y, visionRange = 100){
    super(x, y, 20, 20);
    this.stunned = false;
    this.color = '#D90368';

    this.stunTime = 2;
    this.currentStunTime = 0;

    this.visionConePath;
    this.visionAngle  = degreesToRadians(45);
    this.maxVisionRange = visionRange;
    this.visionRange  = this.maxVisionRange;

    this.currentAngle = 0;
    this.targetDirection = new Vector2();

    this.center;

    this.playerNear = false;
    this.alerted = false;

    this.alertedDelay = 3;
    this.timeAlerted = this.alertedDelay;

    this.stunSound = new Audio('assets/sounds/enemyStun.wav');
  }
  render(){
    this.center = getCenter(this.position, this.width, this.height);

    game.ctx.fillStyle = this.color;
    game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    if (!this.stunned){
      this.vision();
    }
    this.drawHUD();
  }
  drawHUD(){
    if(this.alerted){
      game.fillStyle = 'rgb(255, 255, 255)';
      var iniY = 0;
      game.HUDctx.fillRect(this.center.x - 2, this.center.y - iniY, 4, 20);
      game.HUDctx.fillRect(this.center.x - 2, this.center.y + 22, 4, 4);
    }
  }
  vision(){
    this.visionConePath = new Path2D();
    this.visionConePath.arc(this.center.x, this.center.y, this.visionRange, -this.visionAngle + this.currentAngle, this.visionAngle + this.currentAngle, false);
    this.visionConePath.lineTo(this.center.x, this.center.y);
    this.visionConePath.closePath();

    this.checkVision();
    var color = this.alerted ? 'rgba(234, 53, 70, 0.4)' : 'rgba(0, 255, 0, 0.4)';
    game.ctx.fillStyle = color;
    game.ctx.fill(this.visionConePath);
  }
  checkVision(){
    if(!rayCast(getCenter(this.position, this.width, this.height), normalizedVectorDirector(this.position, game.player.position), this.maxVisionRange).collision && 
      (game.player.isMoving || !game.player.hidden) && rectInPath(game.player, this.visionConePath, game.ctx)) {
      this.playerNear = true;
      this.alerted = true;
      this.timeAlerted = 0;
    }
    else {
      this.playerNear = false;
    }
  }
  update(dt){
    if (this.stunned){
      this.currentStunTime += dt;
      if (this.currentStunTime >= this.stunTime){
        this.updateStun(false);
      }
    }
    else{
      if(this.alerted){
        this.timeAlerted += dt;

        if (this.timeAlerted >= this.alertedDelay){
          this.timeAlerted = 0;
          this.alerted = false;
        }
      }

      var desiredAngle = degreesToRadians(angle(this.targetDirection));
      this.currentAngle = angleLerp(this.currentAngle, desiredAngle, dt * 4);

      this.checkVisionWalls(dt);
  
      if (this.playerNear && !this.stunned){
        var dist = distance(game.player.position, this.position);
        var moduledDistance = module(dist, 0, this.visionRange);
        game.player.enemyAlerted(dt, moduledDistance + 0.5);
      }
    }
  }
  checkVisionWalls(dt) {
    var center = getCenter(this.position, this.width, this.height);
    var middleDir = vectorFromAngle(radiansToDegrees(this.currentAngle));
    var raycastInfo = rayCast(center, middleDir, this.maxVisionRange);

    this.visionRange = lerp(this.visionRange, raycastInfo.hitDistance, dt * 10);
  }

  stun(){
    if(!this.stunned){
      playSound(this.stunSound, 0.2);
      this.updateStun(true);
      this.alerted = false;
      this.timeAlerted = this.alertedDelay;
    }
  }
  updateStun(bool){
    this.currentStunTime = 0;
    this.stunned = bool;
    this.stunned ? this.color = 'orange' : this.color = '#D90368';
  }
}
class PathEnemy extends Enemy{
  constructor(path, loop = false){
    super(path[0].x, path[0].y);
    this.movePath = path;
    this.currentPathIndex = 1;
    this.speed = 1.5;

    this.isLoop = loop;
    this.backwards = false;

    this.targetDirection = normalizedVectorDirector(this.position, this.movePath[this.currentPathIndex]);
    this.currentAngle = degreesToRadians(angle(this.targetDirection)); 
  }
  update(dt){
    super.update(dt);

    if (!this.stunned && !this.alerted){
      var target = this.movePath[this.currentPathIndex];

      var offset = normalizedVectorDirector(this.position, target);
      offset.x *= this.speed;
      offset.y *= this.speed;
  
      this.move(offset);

      this.checkNextTarget(target);
    }
  }

  checkNextTarget(target) {
    if (sqrDistance(this.position, target) <= 5 * 5) {
      this.isLoop ? this.updateTargetLoop() : this.updateTarget();
    }
  }
  updateTarget() {
    var lastTarget = this.movePath[this.currentPathIndex];
    this.currentPathIndex++;
    if (this.currentPathIndex >= this.movePath.length) {
      this.currentPathIndex = 0;
    }
    this.targetDirection = normalizedVectorDirector(lastTarget, this.movePath[this.currentPathIndex]);
  }
  updateTargetLoop() {
    var lastTarget = this.movePath[this.currentPathIndex];
    this.currentPathIndex += this.backwards ? -1 : 1;
    if (this.currentPathIndex >= this.movePath.length || this.currentPathIndex < 0) {
      this.backwards = !this.backwards;
      this.currentPathIndex += this.backwards ? -2 : 2;
    }
    this.targetDirection = normalizedVectorDirector(lastTarget, this.movePath[this.currentPathIndex]);
  }
}
class FingerSpinner extends Enemy{
  constructor(x, y, firstAngle, secondAngle, visionRange){
    super(x, y, visionRange);
    this.firstAngle = firstAngle;
    this.secondAngle = secondAngle;
    this.lastAngle = firstAngle;

    this.currentAngle = firstAngle;
    this.targetDirection = vectorFromAngle(this.currentAngle);

    this.updateDelay = getRandomArbitrary(2, 4);
    this.timeSinceLastUpdate = 0;    
    this.currentAngle = degreesToRadians(angle(this.targetDirection)); 
  }
  update(dt){
    super.update(dt);
    if(!this.stunned && !this.alerted){
      this.updateTarget(dt);
    }
  }
  updateTarget(dt){
    this.timeSinceLastUpdate += dt;
    if(this.timeSinceLastUpdate >= this.updateDelay){
      this.timeSinceLastUpdate = 0;
      this.updateDelay = getRandomArbitrary(2, 4);
      this.lastAngle = this.lastAngle == this.firstAngle ? this.secondAngle : this.firstAngle;
      this.targetDirection = vectorFromAngle(this.lastAngle);
    }
  }
}
class Gun extends GameObject {
  constructor(parent){
    super(parent.position.x, parent.position.y, 5, 20);
    this.parent = parent;

    this.shootDelay = 1;
    this.timeSinceLastShoot = this.shootDelay;

    this.canShoot = true;
    this.reloading = false;

    this.look = new GunLook();
    this.canRender = true;

    this.maxAmmo = 3;
    this.ammo = this.maxAmmo;
    

    this.shootAudio = new Audio('assets/sounds/shoot.wav');
  }
  update(dt){
    this.timeSinceLastShoot += dt;
    if ( this.ammo > 0)
    {
      if(this.timeSinceLastShoot >= this.shootDelay) {
        this.reloading = false;
        this.canShoot = true;
      }
      else {
        this.reloading = true;
      }
    }

    this.position.x = this.parent.position.x + this.parent.width / 2 - this.width / 2;
    this.position.y = this.parent.position.y + this.parent.height / 2;
  }
  render(){
    if (this.canRender)
    {
      game.ctx.save();
      game.ctx.fillStyle = '#5F5971';
      game.ctx.translate(this.position.x, this.position.y);
      var direction = normalizedVectorDirector(this.position, game.mousePos);
      var desiredAngle = angle(direction, new Vector2(1, 0)) - 90;
      game.ctx.rotate(degreesToRadians(desiredAngle));
      game.ctx.fillRect(0, 0, this.width, this.height);
      game.ctx.restore();

      if (this.reloading) {
        game.ctx.beginPath();
        game.ctx.arc(this.parent.position.x + this.parent.width / 2, this.parent.position.y + this.parent.height / 2, 5, -Math.PI * 0.5, Math.PI * (this.timeSinceLastShoot / this.shootDelay) * 2 - Math.PI * 0.5);
        game.ctx.strokeStyle = 'white';
        game.ctx.lineWidth = 4;
        game.ctx.stroke();
      }
    }
  }
  shoot(){
    if (this.canRender && this.canShoot) {
      this.canShoot = false;
      this.timeSinceLastShoot = 0;
      // this.ammo--;
      var bullet = new Bullet(this.position.x, this.position.y, normalizedVectorDirector(this.position, game.mousePos), 10);
      playSound(this.shootAudio, 0.2);
    }
  }
}
class Bullet extends GameObject {
  constructor(x, y, direction, velocity){
    super(x, y, 3, 3);
    this.direction = normalizedVector(direction);
    this.rotAngle = degreesToRadians(angle(direction) - 90);
    this.velocity = velocity;

    this.maxLifeTime = 0.4;
    this.currentTime = 0;
  }
  update(dt){
    this.currentTime += dt;
    if(this.currentTime >= this.maxLifeTime) {
      game.gameObjectManager.removeGameObject(this);
      return;
    }

    var offset = new Vector2(this.direction.x * this.velocity, this.direction.y * this.velocity);
    super.move(offset);
    this.checkCollisions();
  }
  checkCollisions(){
    for (let i = 0; i < game.gameObjectManager.gameObjects.length; i++) {
      var go = game.gameObjectManager.gameObjects[i];
      if(!(go instanceof Player || go instanceof Gun) && go != this){
        if (AABBCollision(this, go)){
          game.gameObjectManager.removeGameObject(this);
          if(go instanceof Enemy){
            go.stun();
          }
        }
      }
    }
  }
  render(){
    game.ctx.save();
    game.ctx.translate(this.position.x, this.position.y);
    game.ctx.rotate(this.rotAngle);
    game.ctx.fillStyle = 'white';
    game.ctx.fillRect(0, 0, this.width, this.height);
    game.ctx.restore();
  }
}
class GunLook extends GameObject {
  constructor(){
    super(game.mousePos.x, game.mousePos.y, 10, 10);
    this.position = game.mousePos;
  }
  update(dt){
    this.position.x = game.mousePos.x - this.width / 2;
    this.position.y = game.mousePos.y - this.height / 2;
  }
  render(){
    game.ctx.fillStyle = 'white';
    game.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}