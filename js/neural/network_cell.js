class NetworkCell {

    defaultCellColor = color("white");
    clickedCellColor = color("black");
    constructor(xIndex, yIndex) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.isClicked = false;

        this.show = function() {
            this.cellColor = this.isClicked ? this.clickedCellColor : this.defaultCellColor;
            fill(this.cellColor);
            stroke(0);
            rect(this.xIndex * CELL_SIDE_PX, this.yIndex * CELL_SIDE_PX, CELL_SIDE_PX - 1, CELL_SIDE_PX - 1);
        }

        this.cellIsClicked = function() {
            return this.xIndex * CELL_SIDE_PX < mouseX && mouseX < this.xIndex * CELL_SIDE_PX + CELL_SIDE_PX
                && this.yIndex * CELL_SIDE_PX < mouseY && mouseY < this.yIndex * CELL_SIDE_PX + CELL_SIDE_PX;
        }
    }
}