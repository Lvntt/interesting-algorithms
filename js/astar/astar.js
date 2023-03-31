const windowWidth = 600;
const windowHeight = 600;

let framesDelay = 10;
let cellSideCount = 15;
let cellSideInPixels = windowWidth / cellSideCount;
let grid = new Array(cellSideCount);
let started = false;
let setStartMode = false;
let setFinishMode = false;

let canvas;
let runAlgorithmButton;
let resetAlgorithmButton;
let setStartButton;
let setFinishButton;
let sideSizeSlider;
let currentCell;

let openSet = [];
let closedSet = [];
let start;
let finish;
let path = [];
let pathFound = false;

function getHeuristicValue(sourcePoint, targetPoint) {
    return abs(sourcePoint.xIndex - targetPoint.xIndex) + abs(sourcePoint.yIndex - targetPoint.yIndex);
}

function initAlgorithm() {
    for (let i = 0; i < cellSideCount; i++) {
        grid[i] = new Array(cellSideCount);
    }

    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            grid[i][j] = new Cell(i, j);
        }
    }

    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            grid[i][j].addNeighbours();
        }
    }
}

function runAlgorithm() {
    if (!start || !finish) {
        console.error("Please select a start and finish point before running the algorithm.");
        return;
    }

    if (started) {
        resetAlgorithm();
    }

    started = true;
    openSet.push(start);
    loop();
}

function resetAlgorithm() {
    start = undefined;
    finish = undefined;
    openSet = [];
    closedSet = [];
    path = [];
    pathFound = false;

    started = false;
    initAlgorithm();
}

function setStartPoint() {
    setStartMode = true;
}

function setFinishPoint() {
    setFinishMode = true;
}

function updateCellSideCount() {
    cellSideCount = sideSizeSlider.value();
    cellSideInPixels = windowWidth / cellSideCount;
    resetAlgorithm();
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    runAlgorithmButton = createButton("Run");
    resetAlgorithmButton = createButton("Reset");
    setStartButton = createButton("Set a start point");
    setFinishButton = createButton("Set a finish point");
    sideSizeSlider = createSlider(5, 30, 15, 1);

    canvas.parent("algorithmWindow");
    runAlgorithmButton.parent("setupContent");
    resetAlgorithmButton.parent("setupContent");
    setStartButton.parent("setupContent");
    setFinishButton.parent("setupContent");
    sideSizeSlider.parent("setupContent");

    runAlgorithmButton.mousePressed(runAlgorithm);
    resetAlgorithmButton.mousePressed(resetAlgorithm);
    setStartButton.mousePressed(setStartPoint);
    setFinishButton.mousePressed(setFinishPoint);
    sideSizeSlider.input(updateCellSideCount);

    cellSideCount = sideSizeSlider.value();

    initAlgorithm();
}

function mousePressed() {
    if (!started) {
        for (let i = 0; i < cellSideCount; i++) {
            for (let j = 0; j < cellSideCount; j++) {
                let current = grid[i][j];
                if (current.isClicked()) {
                    if (setStartMode) {
                        if (start !== undefined) {
                            start.cellColor = color(255);
                            start.show(start.cellColor);
                        }
                        start = current;
                        start.cellColor = color("#03bafc");
                        setStartMode = false;
                    } else if (setFinishMode) {
                        if (finish !== undefined) {
                            finish.cellColor = color(255);
                            finish.show(finish.cellColor);
                        }
                        finish = current;
                        finish.cellColor = color("#88cc00");
                        setFinishMode = false;
                    } else if (current !== start && current !== finish) {
                        current.isObstacle = !current.isObstacle;
                    }
                    console.log(i, j, "Cell is clicked");
                }
                current.show(current.cellColor);
            }
        }
    }
}

function restorePath() {
    path = [];
    let temp = currentCell;
    path.push(temp);
    while (temp && temp.cameFrom !== undefined) {
        path.push(temp.cameFrom);
        temp = temp.cameFrom;
    }
}

function draw() {

    let pathColor = color("#e29303");
    let foundTargetColor = color("#88cc00");
    let openSetColor = color("#fed280");
    let closedSetColor = color("#595959");
    let startCellColor = color("#03bafc");

    console.log(started);

    if (!started) {
        noLoop();
    }

    if (openSet.length > 0) {
        let minIdx = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[minIdx].f) {
                minIdx = i;
            }
        }

        currentCell = openSet[minIdx];

        if (currentCell === finish) {
            pathFound = true;
            console.log("Path found");
            console.log(path);
            noLoop();
        }

        for (let i = openSet.length - 1; i >= 0; i--) {
            if (openSet[i] === currentCell) {
                openSet.splice(i, 1);
            }
        }
        closedSet.push(currentCell);

        let neighbours = currentCell.neighbours;

        for (let i = 0; i < neighbours.length; i++) {
            let neighbour = neighbours[i];

            if (!closedSet.includes(neighbour) && !currentCell.isObstacle) {
                let tentativeG = currentCell.g + 1;

                if (openSet.includes(neighbour)) {
                    tentativeG = Math.min(neighbour.g, tentativeG);
                } else {
                    neighbour.g = tentativeG;
                    openSet.push(neighbour);
                }

                neighbour.h = getHeuristicValue(neighbour, finish);
                neighbour.f = neighbour.g + neighbour.h;
                neighbour.cameFrom = currentCell;
            }
        }

    } else {
        currentCell = undefined;
        console.log("Solution does not exist");
        noLoop();
    }

    background(0);
    frameRate(framesDelay);

    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            grid[i][j].show(grid[i][j].cellColor);
        }
    }

    if (started) {
        for (let i = 0; i < closedSet.length; i++) {
            closedSet[i].show(closedSetColor);
        }

        for (let i = 0; i < openSet.length; i++) {
            openSet[i].show(openSetColor);
        }
    }

    restorePath();

    for (let i = 0; i < path.length; i++) {
        if (path[i]) {
            path[i].show(pathColor);
        }
        start.show(startCellColor);
    }
    if (pathFound) {
        path[0].show(foundTargetColor);
    }
}