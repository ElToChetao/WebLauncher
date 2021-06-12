class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
function degreesToRadians(degrees) {
  return degrees * (Math.PI/180);
}
function radiansToDegrees(radians) {
  return radians * (180/Math.PI);
}
function lerp(a, b, t) {
	return a * (1 - t) + b * t;
}
function directionTo(vector1, vector2){
  return new Vector2(vector1.x - vector2.x, vector1.y - vector2.y);
}
function normalizedVectorDirector(position, target){
  var direction = directionTo(target, position);
  var module = vectorModule(direction);
  var normalizedDir = new Vector2(direction.x / module, direction.y / module);

  return normalizedDir;
}
function normalizedVector(direction){
  var module = vectorModule(direction);
  var normalizedDir = new Vector2(direction.x / module, direction.y / module);
  return normalizedDir;
}
function vectorModule(vect){
  return Math.sqrt(vect.x * vect.x + vect.y * vect.y);
}

function distance(position, target){
  var direction = directionTo(target, position);
  var distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  return distance;
}
function sqrDistance(position, target){
  var direction = directionTo(target, position);
  var sqrDistance = direction.x * direction.x + direction.y * direction.y;
  return sqrDistance;
}
function angle(vector1, vector2 = new Vector2(1, 0)){
  var angle = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);
  if (angle < 0){
    angle += 2 * Math.PI;
  }
  return radiansToDegrees(angle) * -1; 
}
function magnitude(vector){
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}
function module(value, max, min) { 
  return (value - min) / (max - min)
}
function clip(x, min, max) {
  return x < min ? min : x > max ? max : x
}
function getCenter(position, width, height){
  return new Vector2(position.x + (width / 2),  position.y + (height / 2));
}

function vectorFromAngle(angle){
  var rad = degreesToRadians(angle);
  return new Vector2(Math.cos(rad), Math.sin(rad));
}
function mathMinMax(a, b){
  var aSign = Math.sign(a);
  var bSign = Math.sign(b);

  if (aSign >= 0 && bSign >= 0){
    return Math.min(a, b);
  } 
  else{
    return Math.max(a, b);
  }
}
function getMinValue(numbers){
  var temp = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < numbers.length; i++){
    if(numbers[i] < temp){
      temp = numbers[i];
    }
  }
  return temp;
}
function getMaxValue(numbers){
  var temp = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < numbers.length; i++){
    if(numbers[i] > temp){
      temp = numbers[i];
    }
  }
  return temp;
}
function shortAngleDist(firstAngle, secondAngle) {
  var max = Math.PI * 2;
  var offset = (secondAngle - firstAngle) % max
  return 2 * offset % max - offset;
}
function angleLerp(firstAngle, secondAngle, t) {
  return firstAngle + shortAngleDist(firstAngle,secondAngle) * t;
}
function clamp(value, min, max){
  return Math.min(Math.max(value, min), max);
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}