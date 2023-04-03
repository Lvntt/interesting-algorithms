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
let currentCell;
let runAlgorithmButton;
let resetAlgorithmButton;
let setStartButton;
let setFinishButton;
let sideSizeSlider;
let sideSizeLabel;
let sideSizeValue;
let generateLabyrinthButton;
let infoLabel;

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
    if (started) {
        return;
    }

    if (!start || !finish) {
        console.error("Please select a start and finish point before running the algorithm.");
        infoLabel.html("Выберите начальную и конечную точки");
        return;
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
    infoLabel.html("A*");
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
    sideSizeValue.html(sideSizeSlider.value());
}

function hasSamePoint(pointX, pointY, pointArr) {
    for (let i = 0; i < pointArr.length; i++) {
        if (pointArr[i].x === pointX && pointArr[i].y === pointY) {
            return true
        }
    }
    return false
}

function generateLabyrinth() {
    resetAlgorithm();

    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            grid[i][j].isObstacle = true;
        }
    }

    let x = int(random(0, cellSideCount / 2 - 1) * 2 + 1);
    let y = int(random(0, cellSideCount / 2 - 1) * 2 + 1);
    grid[x][y].isObstacle = false;

    let pointsToCheck = [];

    let possibleMovesX = [2, -2, 0, 0];
    let possibleMovesY = [0, 0, 2, -2];

    for (let i = 0; i < 4; i++) {
        let xCurrent = x + possibleMovesX[i];
        let yCurrent = y + possibleMovesY[i];
        if (xCurrent >= 0 && xCurrent < cellSideCount && yCurrent >= 0 && yCurrent < cellSideCount) {
            pointsToCheck.push(new Point(xCurrent, yCurrent));
        }
    }

    console.log(pointsToCheck);

    while (pointsToCheck.length > 0) {
        let index = int(random(0, pointsToCheck.length));
        let point = pointsToCheck[index];
        x = point.x;
        y = point.y;
        grid[x][y].isObstacle = false;
        pointsToCheck.splice(index, 1);

        let directions = ["NORTH", "SOUTH", "EAST", "WEST"];
        while (directions.length > 0) {
            let directionIndex = int(random(0, directions.length));
            switch (directions[directionIndex]) {
                case "NORTH":
                    if (y - 2 >= 0 && !grid[x][y - 2].isObstacle) {
                        grid[x][y - 1].isObstacle = false;
                        directions = [];
                    }
                    break;
                case "SOUTH":
                    if (y + 2 < cellSideCount && !grid[x][y + 2].isObstacle) {
                        grid[x][y + 1].isObstacle = false;
                        directions = [];
                    }
                    break;
                case "EAST":
                    if (x - 2 >= 0 && !grid[x - 2][y].isObstacle) {
                        grid[x - 1][y].isObstacle = false;
                        directions = [];
                    }
                    break;
                case "WEST":
                    if (x + 2 < cellSideCount && !grid[x + 2][y].isObstacle) {
                        grid[x + 1][y].isObstacle = false;
                        directions = [];
                    }
                    break;
            }
            directions.splice(directionIndex, 1);
        }

        if (y - 2 >= 0 && grid[x][y - 2].isObstacle && !hasSamePoint(x, y - 2, pointsToCheck)) {
            pointsToCheck.push(new Point(x, y - 2));
        }
        if (y + 2 < cellSideCount && grid[x][y + 2].isObstacle && !hasSamePoint(x, y + 2, pointsToCheck)) {
            pointsToCheck.push(new Point(x, y + 2));
        }
        if (x - 2 >= 0 && grid[x - 2][y].isObstacle && !hasSamePoint(x - 2, y, pointsToCheck)) {
            pointsToCheck.push(new Point(x - 2, y));
        }
        if (x + 2 < cellSideCount && grid[x + 2][y].isObstacle && !hasSamePoint(x + 2, y, pointsToCheck)) {
            pointsToCheck.push(new Point(x + 2, y));
        }
    }

    for (let i = 0; i < cellSideCount; i++) {
        for (let j = 0; j < cellSideCount; j++) {
            grid[i][j].show(grid[i][j].cellColor);
        }
    }
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    infoLabel = createP("A*");
    sideSizeLabel = createP("Установить размер стороны лабиринта:");
    sideSizeSlider = createSlider(5, 30, 15, 1);
    sideSizeValue = createDiv(sideSizeSlider.value());
    runAlgorithmButton = createButton("Запустить алгоритм");
    resetAlgorithmButton = createButton("Сбросить лабиринт");
    setStartButton = createButton("Установить начальную точку");
    setFinishButton = createButton("Установить конечную точку");
    generateLabyrinthButton = createButton("Сгенерировать лабиринт");

    canvas.parent("algorithmWindow");
    infoLabel.parent("setupContent");
    sideSizeLabel.parent("setupContent");
    sideSizeSlider.parent("setupContent");
    sideSizeValue.parent("setupContent");
    runAlgorithmButton.parent("setupContent");
    resetAlgorithmButton.parent("setupContent");
    setStartButton.parent("setupContent");
    setFinishButton.parent("setupContent");
    generateLabyrinthButton.parent("setupContent");

    sideSizeSlider.style("width", "200px");
    sideSizeSlider.style("color", "#666666");

    sideSizeSlider.input(updateCellSideCount);
    runAlgorithmButton.mousePressed(runAlgorithm);
    resetAlgorithmButton.mousePressed(resetAlgorithm);
    setStartButton.mousePressed(setStartPoint);
    setFinishButton.mousePressed(setFinishPoint);
    generateLabyrinthButton.mousePressed(generateLabyrinth);

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

    if (started) {
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
                infoLabel.html("Path found!");
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
            infoLabel.html("Solution does not exist");
            noLoop();
        }
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
        if (start) {
            start.show(startCellColor);
        }
    }
    if (pathFound) {
        path[0].show(foundTargetColor);
    }
}