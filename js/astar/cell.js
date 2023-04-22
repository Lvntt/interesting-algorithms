class Cell {
    defaultColor = color(255);
    obstacleColor = color("#331a00");

    constructor(xIndex, yIndex) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.cellColor = this.defaultColor;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.neighbours = [];
        this.cameFrom = undefined;


        // this.isObstacle = random(1) < 0.3;
        this.isObstacle = false;

        this.show = function(cellColor) {
            this.cellColor = cellColor;
            fill(this.cellColor);
            if (this.isObstacle) {
                fill(this.obstacleColor);
            }
            stroke(0);
            rect(this.xIndex * cellSidePx, this.yIndex * cellSidePx, cellSidePx - 1, cellSidePx - 1);
        }

        this.addNeighbours = function() {
            let possibleMovesX = [1, -1, 0, 0];
            let possibleMovesY = [0, 0, 1, -1];

            for (let i = 0; i < 4; i++) {
                let xCurrent = this.xIndex + possibleMovesX[i];
                let yCurrent = this.yIndex + possibleMovesY[i];
                if (xCurrent >= 0 && xCurrent < cellSideCount && yCurrent >= 0 && yCurrent < cellSideCount) {
                    this.neighbours.push(grid[xCurrent][yCurrent]);
                }
            }
        }

        this.isClicked = function() {
            return this.xIndex * cellSidePx < mouseX && mouseX < this.xIndex * cellSidePx + cellSidePx
                && this.yIndex * cellSidePx < mouseY && mouseY < this.yIndex * cellSidePx + cellSidePx;
        }
    }
}