function AABBCollision(object, other)
{
  if (object != null && other != null)
  {
    return object.position.x < other.position.x + other.width &&
    object.position.x + object.width > other.position.x &&
    object.position.y < other.position.y + other.height &&
    object.position.y + object.height > other.position.y;
  }
  return false;
}
function nextAABBCollision(object, other, newOffset)
{
  if (object != null && other != null)
  {
    return object.position.x + newOffset.x < other.position.x + other.width &&
    object.position.x + object.width + newOffset.x > other.position.x &&
    object.position.y + newOffset.y < other.position.y + other.height &&
    object.position.y + newOffset.y + object.height > other.position.y;
  }
  return false;
}

function distanceBetween(firstX, secondX, firstSize, secondSize){
  var distance = firstX - secondX;
  var direction = Math.sign(distance);

  if (direction >= 0){
    distance -= secondSize;
  } 
  else {
    distance += firstSize;
  }
  return distance;
}
function nextAABBDistance(object, other){
  if (object != null && other != null){
    var xDistance = distanceBetween(other.position.x, object.position.x, other.width, object.width);
    var xDirection = object.position.x > other.position.x ? 1 : -1;

    var yDistance = distanceBetween(other.position.y, object.position.y, other.height, object.height);
    var yDirection = object.position.y > other.position.y ? 1 : -1;

    return { x: xDistance, y: yDistance, xDir: xDirection, yDir: yDirection };
  }
  return new Vector2(0, 0);
}
function rectInPath(object, path, ctx){
  if (object != null && path != null){
    return ctx.isPointInPath(path, object.position.x, object.position.y) ||
    ctx.isPointInPath(path, object.position.x + object.width, object.position.y) ||
    ctx.isPointInPath(path, object.position.x + object.width, object.position.y + object.height) ||
    ctx.isPointInPath(path, object.position.x, object.position.y + object.height);
  }
  return false;
}
function pointOverOject(vec, other){
  if (other != null)
  {
    return vec.x > other.position.x && vec.x < other.position.x + other.width &&
    vec.y > other.position.y && vec.y < other.position.y + other.height;
  }
  return false;
}
function getClosestDistance(xDirection, yDirection, object, objects) {
  var xDistance = xDirection == 1 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  var yDistance = yDirection == 1 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;

  for (let i = 0; i < objects.length; i++) {
    var distance = nextAABBDistance(object, objects[i]);

    var outsideY = distance.yDir == -1 && distance.y >= 0 || distance.yDir == 1 && distance.y <= 0;
    if (xDirection == 1 && distance.xDir == -1 && distance.x >= 0 && !outsideY) {
      xDistance = Math.max(Math.min(xDistance, distance.x), 0);
    }
    else if (xDirection == -1 && distance.xDir == 1 && distance.x <= 0 && !outsideY) {
      xDistance = Math.min(Math.max(xDistance, distance.x), 0);
    }

    var outsideX = distance.xDir == -1 && distance.x >= 0 || distance.xDir == 1 && distance.x <= 0;
    if (yDirection == 1 && distance.yDir == -1 && distance.y >= 0 && !outsideX) {
      yDistance = Math.max(Math.min(yDistance, distance.y), 0);
    }
    else if (yDirection == -1 && distance.yDir == 1 && distance.y <= 0 && !outsideX) {
      yDistance = Math.min(Math.max(yDistance, distance.y), 0);
    }
  }
  return new Vector2(xDistance, yDistance)
}
