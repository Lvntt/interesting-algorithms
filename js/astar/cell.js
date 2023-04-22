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
            rect(this.xIndex * CELL_SIDE_PX, this.yIndex * CELL_SIDE_PX, CELL_SIDE_PX - 1, CELL_SIDE_PX - 1);
        }

        this.addNeighbours = function() {
            let possibleMovesX = [1, -1, 0, 0];
            let possibleMovesY = [0, 0, 1, -1];

            for (let i = 0; i < 4; i++) {
                let xCurrent = this.xIndex + possibleMovesX[i];
                let yCurrent = this.yIndex + possibleMovesY[i];
                if (xCurrent >= 0 && xCurrent < CELL_SIDE_COUNT && yCurrent >= 0 && yCurrent < CELL_SIDE_COUNT) {
                    this.neighbours.push(grid[xCurrent][yCurrent]);
                }
            }
        }

        this.isClicked = function() {
            return this.xIndex * CELL_SIDE_PX < mouseX && mouseX < this.xIndex * CELL_SIDE_PX + CELL_SIDE_PX
                && this.yIndex * CELL_SIDE_PX < mouseY && mouseY < this.yIndex * CELL_SIDE_PX + CELL_SIDE_PX;
        }
    }
}