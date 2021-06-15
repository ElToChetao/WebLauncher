window.onload = loadGame();

function loadGame(){
  console.log(document.getElementById("game-box"));
  document.getElementById("game-box").innerHTML='<object type="type/html" data="SpaceInvaders/index.html" ></object>';
}