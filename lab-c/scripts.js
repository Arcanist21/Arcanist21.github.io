

const puzzleAmount=16;

let pieces_container=document.querySelector("#pieces")
const puzzleCols = puzzleAmount / 2;
// kod generowany claude
document.body.style.setProperty("--cols", puzzleCols);
let puzzle_container = document.querySelector("#puzzle");
let originalOrder = [];

//koniec generacji
//kod dotyczący przeciągania współtworzony z claudem na podstawie kodu prowadzącego
function addDragEvents(item) {
  item.addEventListener("dragstart", function(event) {
    this.classList.add("dragged-item");
    event.dataTransfer.setData("text", this.id);
  });
  item.addEventListener("dragend", function(event) {
    this.classList.remove("dragged-item");
  });
}

function addDropEvents(target) {
  target.addEventListener("dragenter", function (event) {
    this.classList.add("drag-over");
  });
  target.addEventListener("dragleave", function (event) {
    this.classList.remove("drag-over");
  });
  target.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  target.addEventListener("drop", function (event) {
    event.preventDefault();
    this.classList.remove("drag-over");
    let myElement = document.querySelector("#" + event.dataTransfer.getData('text'));
    let oldParent = myElement.parentElement;
    if (this.children.length > 0 && this != pieces_container) {
      oldParent.appendChild(this.children[0]);
    }
    this.appendChild(myElement);
    if (checkPuzzle()) {
      setTimeout(showNotification, 100);
    }
  }, false);
}

function showNotification() {
  if (Notification.permission === "granted") {
    new Notification("Puzzle ułożone!");
  }
}

// generowane claude
addDropEvents(pieces_container);
// koniec generacji

//funkcje współtworzone z claude
function checkPuzzle() {
  let cells = puzzle_container.children;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].children.length == 0 || cells[i].children[0].id != originalOrder[i]) return false;
  }
  console.debug('Ułożono puzzle poprawnie!');
  return true;
}

function createPieces(source) {
  let w = source.width / puzzleCols;
  let h = source.height / 2;
  let pieces = [];
  originalOrder = [];
  pieces_container.innerHTML = "";
  puzzle_container.innerHTML = "";

  for (let i = 0; i < puzzleAmount; i++) {

    let piece = document.createElement("canvas");
    piece.id = "piece" + i;
    piece.className = "item";
    piece.draggable = true;
    piece.width = w;
    piece.height = h;
    let x = (i % puzzleCols) * w;
    let y = Math.floor(i / puzzleCols) * h;
    piece.getContext("2d").drawImage(source, x, y, w, h, 0, 0, w, h);
    addDragEvents(piece);
    originalOrder.push(piece.id);
    pieces.push(piece);

    let cell = document.createElement("div");
    cell.className = "puzzle-cell";
    cell.style.setProperty("--piece-ratio", w + " / " + h); // rozmiar pola ustawia CSS
    addDropEvents(cell);
    puzzle_container.appendChild(cell);
  }

  pieces.sort(() => Math.random() - 0.5); // pomieszanie
  for (let piece of pieces) pieces_container.appendChild(piece);
}
// koniec


//z kodu od prowadzącego
let map = L.map('map').setView([53.430127, 14.564802], 18);
// L.tileLayer.provider('OpenStreetMap.DE').addTo(map);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);
let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("You're here!!");

document.getElementById("saveButton").addEventListener("click", function() {
  if (Notification.permission === "default") Notification.requestPermission();
  marker.remove();
  leafletImage(map, function (err, canvas) {
    // generowane claude
    marker.addTo(map);
    if (err) {
      alert("Nie udało się pobrać mapy: " + err);
      return;
    }
    // koniec generacji
    // here we have the canvas
    let rasterMap = document.getElementById("rasterMap");
    let rasterContext = rasterMap.getContext("2d");

    // generowane claude
    rasterContext.drawImage(canvas, 0, 0, rasterMap.width, rasterMap.height);
    createPieces(rasterMap);
    // koniec zmiany
  });
});

document.getElementById("getLocation").addEventListener("click", function(event) {
  if (! navigator.geolocation) {
    // generowane claude
    alert("Przeglądarka nie obsługuje geolokalizacji.");
    return;
    // koniec generacji
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    map.setView([lat, lon]);
    // generowane claude
    marker.setLatLng([lat, lon]);
    document.getElementById("coords").textContent = "Longitude: " + lon + ", Latitude: " + lat;
  }, positionError => {
    console.error(positionError);
    alert("Nie udało się pobrać lokalizacji: " + positionError.message);
    // koniec generacji
  });
});
