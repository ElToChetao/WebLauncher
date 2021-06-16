function loadGame(game)
{
  window.parent.postMessage({message: game}, origin);
}

function onLoad()
{

}