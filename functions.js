let iframe;

window.addEventListener("load", onload)
function loadGame(game)
{
  iframe.src = game;
}

function onLoad()
{
  iframe = document.getElementById("game-box");
}