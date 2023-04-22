let ants = [];
let pheromoneToHome = [];
let pheromoneToFood = [];
let foodAnts = [];
let homeAnts = null;
let clickLock = true;
let actionsPoint = false;
let createAntHome = false;
let labyrinth = [];

function setup() {
    clickLock = true;
    const canvasPoint = createCanvas(500, 500);
    canvasPoint.parent("canvas-p");

    for (let i = 0; i < 5; i++)
    {
        labyrinth[i] = [];
        for (let j = 0; j < 5; j++)
        {
            let lab = new Wall(j * 100, i * 100, false);
            labyrinth[i].push(lab);
        }
    }
}

function area(ax, bx, cx, ay, by, cy)
{
    return ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax))
}

function intersection(a, a1, b, b1, c, c1, d, d1)
{
    return ((area(a, b, c, a1, b1, c1) * area(a, b, d, a1, b1, d1) <= 0) && (area(d, c, a, d1, c1, a1) * area(d, c, b, d1, c1, b1) <= 0));
}

function Wall(x, y, existence)
{
    this.x = x;
    this.y = y;
    this.existence = existence;

    this.displayWall = function ()
    {
        if (this.existence)
        {
            fill("#000000");
            rect(this.x, this.y, 100, 100);
        }
    }
}

function createLabyrinth()
{
    clearGraphic();
    let wallToCheck = [];
    let movesX = [0, 0, 2, -2];
    let movesY = [2, -2, 0, 0];

    for (let i = 0; i < 5; i++)
    {
        for (let j = 0; j < 5; j++)
        {
            labyrinth[i][j].existence = true;
        }
    }

    let indexX = (int)(random(5));
    let indexY = (int)(random(5));
    labyrinth[indexY][indexX].existence = false;

    for (let i = 0; i < 4; i++)
    {
        let curX = indexX + movesX[i];
        let curY = indexY + movesY[i];

        if ((curX >= 0) && (curX < 5) && (curY >= 0) && (curY < 5) && (labyrinth[curY][curX].existence))
        {
            let wtc = [indexX, curX, indexY, curY];
            wallToCheck.push(wtc);
            labyrinth[curY][curX].existence = false;
        }
    }

    while (wallToCheck.length > 0)
    {
        let index = (int)(random(wallToCheck.length));

        for (let i = Math.min(wallToCheck[index][2], wallToCheck[index][3]); i <= Math.max(wallToCheck[index][2], wallToCheck[index][3]); i++)
        {
            labyrinth[i][wallToCheck[index][0]].existence = false;
        }

        for (let j = Math.min(wallToCheck[index][0], wallToCheck[index][1]); j <= Math.max(wallToCheck[index][0], wallToCheck[index][1]); j++)
        {
            labyrinth[wallToCheck[index][2]][j].existence = false;
        }

        for (let i = 0; i < 4; i++)
        {
            let curX = wallToCheck[index][1] + movesX[i];
            let curY = wallToCheck[index][3] + movesY[i];

            if ((curX >= 0) && (curX < 5) && (curY >= 0) && (curY < 5) && (labyrinth[curY][curX].existence))
            {
                let wtc = [wallToCheck[index][1], curX, wallToCheck[index][3], curY];
                wallToCheck.push(wtc);
                labyrinth[curY][curX].existence = false;
            }
        }

        wallToCheck.splice(index, 1);
    }
}

function ToFood(x, y, step, satiety)
{
    this.x = x;
    this.y = y;
    this.pheromon = 10 + satiety;
    this.pheromoneStep = step;
    this.pheromonDist = 100000000;

    if (this.pheromoneStep === 1)
    {
        this.pheromonDist = 1;
    }
    else
    {
        for (let i = 0; i < pheromoneToFood.length; i++) {
            let dpf = dist(pheromoneToFood[i].x, pheromoneToFood[i].y, this.x, this.y);

            if (dpf <= 50)
            {
                if (this.pheromonDist > pheromoneToFood[i].pheromonDist + dpf) {
                    this.pheromonDist = pheromoneToFood[i].pheromonDist + dpf;
                }
            }
        }
    }

    this.pheromoneDisplayF = function ()
    {
        /*fill("#54d67d80");
        ellipse(this.x, this.y, this.pheromon, this.pheromon);*/

        if (this.pheromon > 0.01)
        {
            this.pheromon = this.pheromon - 0.01;
            return false;
        }

        if (this.pheromon === 0.01)
        {
            return true;
        }
    }
}

function ToHome(x, y, step)
{
    this.x = x;
    this.y = y;
    this.pheromon = 10;
    this.pheromoneStep = step;
    this.pheromonDist = 100000000;

    if (this.pheromoneStep === 1)
    {
        this.pheromonDist = 1;
    }
    else
    {
        for (let i = 0; i < pheromoneToHome.length; i++) {
            let dpf = dist(pheromoneToHome[i].x, pheromoneToHome[i].y, this.x, this.y);

            if (dpf <= 50)
            {
                if (this.pheromonDist > pheromoneToHome[i].pheromonDist + dpf) {
                    this.pheromonDist = pheromoneToHome[i].pheromonDist + dpf;
                }
            }
        }
    }

    this.pheromoneDisplayH = function ()
    {
        /*fill("#5469d680");
        ellipse(this.x, this.y, this.pheromon, this.pheromon);*/

        if (this.pheromon > 0.01 && this.pheromon <= 10)
        {
            this.pheromon = this.pheromon - 0.01;
            return false;
        }

        if (this.pheromon === 0.01)
        {
            return true;
        }
    }
}

function Ant(x, y, corner)
{
    this.x = x;
    this.y = y;
    this.corner = corner;
    this.count = 0;
    this.stepAnt = 1;
    this.stepFood = 1;
    this.takeFood = false;
    this.path = [];
    this.cordPheromone = null;
    this.truePheromone = false;
    this.satiety = 1;

    this.displayAnt = function ()
    {
        fill("#eb4034");
        ellipse(this.x, this.y, 10, 10);
        let minDist = -1;

        if (this.count === 0)
        {
            if (!this.takeFood)
            {
                let pth = new ToHome(this.x, this.y, this.stepAnt);
                pheromoneToHome.push(pth);
                this.stepAnt++;
            }
            else
            {
                let ptf = new ToFood(this.x, this.y, this.stepFood, this.satiety);
                pheromoneToFood.push(ptf);
                this.stepFood++;
            }
        }

        if (this.cordPheromone === null) {
            this.truePheromone = false;
            let nearestWall = null;
            let distWall = 700;

            for (let i = 0; i < labyrinth.length; i++)
            {
                for (let j = 0; j < labyrinth[i].length; j++)
                {
                    let dw = dist(this.x, this.y, labyrinth[i][j].x + 50, labyrinth[i][j].y + 50)
                    if ((dw < distWall) && (labyrinth[i][j].existence))
                    {
                        distWall = dw;
                        nearestWall = labyrinth[i][j];
                    }
                }
            }

            if (!this.takeFood) {
                for (let i = 0; i < pheromoneToFood.length; i++) {
                    let dpf = dist(pheromoneToFood[i].x, pheromoneToFood[i].y, this.x, this.y);

                    if ((dpf <= 30) && (!this.path.includes(pheromoneToFood[i])) &&
                        (this.x !== pheromoneToFood[i].x) && (this.y !== pheromoneToFood[i].y)) {
                        if (nearestWall === null)
                        {
                            let dis = Math.pow(pheromoneToFood[i].pheromon, 1) * Math.pow(1 / (pheromoneToFood[i].pheromonDist + dpf), 1);
                            if (dis > minDist) {
                                minDist = dis;
                                this.cordPheromone = pheromoneToFood[i];
                                this.truePheromone = true;
                            }
                        }
                        else if ((!intersection(this.x, this.y, pheromoneToFood[i].x, pheromoneToFood[i].y, nearestWall.x, nearestWall.y, (nearestWall.x + 100), nearestWall.y)) &&
                        (!intersection(this.x, this.y, pheromoneToFood[i].x, pheromoneToFood[i].y, nearestWall.x, nearestWall.y, nearestWall.x, (nearestWall.y + 100))) &&
                        (!intersection(this.x, this.y, pheromoneToFood[i].x, pheromoneToFood[i].y, (nearestWall.x + 100), (nearestWall.y + 100), (nearestWall.x + 100), nearestWall.y)) &&
                        (!intersection(this.x, this.y, pheromoneToFood[i].x, pheromoneToFood[i].y, (nearestWall.x + 100), (nearestWall.y + 100), nearestWall.x, (nearestWall.y + 100))))
                        {
                            let dis = Math.pow(pheromoneToFood[i].pheromon, 1) * Math.pow(1 / (pheromoneToFood[i].pheromonDist + dpf), 1);
                            if (dis > minDist) {
                                minDist = dis;
                                this.cordPheromone = pheromoneToFood[i];
                                this.truePheromone = true;
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < pheromoneToHome.length; i++) {
                    let dpf = dist(pheromoneToHome[i].x, pheromoneToHome[i].y, this.x, this.y);

                    if ((dpf <= 30) && (!this.path.includes(pheromoneToHome[i])) &&
                        (this.x !== pheromoneToHome[i].x) && (this.y !== pheromoneToHome[i].y)) {
                        if (nearestWall === null)
                        {
                            let dis = Math.pow(pheromoneToHome[i].pheromon, 1) * Math.pow(1 / (pheromoneToHome[i].pheromonDist + dpf), 1);
                            if (dis > minDist) {
                                minDist = dis;
                                this.cordPheromone = pheromoneToHome[i];
                                this.truePheromone = true;
                            }
                        }
                        else if ((!intersection(this.x, this.y, pheromoneToHome[i].x, pheromoneToHome[i].y, nearestWall.x, nearestWall.y, (nearestWall.x + 100), nearestWall.y)) &&
                            (!intersection(this.x, this.y, pheromoneToHome[i].x, pheromoneToHome[i].y, nearestWall.x, nearestWall.y, nearestWall.x, (nearestWall.y + 100))) &&
                            (!intersection(this.x, this.y, pheromoneToHome[i].x, pheromoneToHome[i].y, (nearestWall.x + 100), (nearestWall.y + 100), (nearestWall.x + 100), nearestWall.y)) &&
                            (!intersection(this.x, this.y, pheromoneToHome[i].x, pheromoneToHome[i].y, (nearestWall.x + 100), (nearestWall.y + 100), nearestWall.x, (nearestWall.y + 100))))
                        {
                            let dis = Math.pow(pheromoneToHome[i].pheromon, 1) * Math.pow(1 / (pheromoneToHome[i].pheromonDist + dpf), 1);
                            if (dis > minDist) {
                                minDist = dis;
                                this.cordPheromone = pheromoneToHome[i];
                                this.truePheromone = true;
                            }
                        }
                    }
                }
            }
        }

        if (this.truePheromone)
        {
            let dpf = dist(this.x, this.y, this.cordPheromone.x, this.cordPheromone.y);

            if ((this.x === this.cordPheromone.x && this.y === this.cordPheromone.y) || (dpf < 1))
            {
                this.y = this.cordPheromone.y;
                this.x = this.cordPheromone.x;
                this.path.push(this.cordPheromone);
                this.cordPheromone = null;
            }
            else
            {
                this.y = this.y + (this.cordPheromone.y - this.y)/dpf;
                this.x = this.x + (this.cordPheromone.x - this.x)/dpf;
            }
            this.count += 1;
        }

        if (minDist  === -1)
        {
            this.corner = this.corner + random(-6, 6);
        }

        if (this.x + Math.cos(this.corner / 180 * Math.PI) > 500
            || this.x + Math.cos(this.corner / 180 * Math.PI) < 0)
        {
            this.corner += 90;
        }

        if (this.y + Math.sin(this.corner / 180 * Math.PI) > 500
            || this.y + Math.sin(this.corner / 180 * Math.PI) < 0)
        {
            this.corner += 90;
        }

        for (let i = 0; i < labyrinth.length; i++)
        {
            for (let j = 0; j < labyrinth[i].length; j++)
            {
                if ((this.x >= labyrinth[i][j].x) && (this.x <= (labyrinth[i][j].x + 100)) &&
                    (this.y >= labyrinth[i][j].y) && (this.y <= (labyrinth[i][j].y + 100)) && (labyrinth[i][j].existence))
                {
                    this.corner += 90;
                }
            }
        }

        let dh = dist(homeAnts.x, homeAnts.y, this.x + Math.cos(this.corner / 180 * Math.PI), this.y + Math.sin(this.corner / 180 * Math.PI));

        if (dh <= 30)
        {
            this.corner += 180;
            this.takeFood = false;
            this.stepAnt = 1;
            let pth = new ToHome(this.x, this.y, this.stepAnt);
            pheromoneToHome.push(pth);
            this.stepAnt++;
            this.path = [];
        }

        for (let i = 0; i < foodAnts.length; i++)
        {
            let df = dist(foodAnts[i].x, foodAnts[i].y, this.x, this.y);

            if (df <= 30)
            {
                this.corner += 180;
                this.takeFood = true;
                this.stepFood = 1;
                let ptf = new ToFood(this.x, this.y, this.stepFood, this.satiety);
                pheromoneToFood.push(ptf);
                this.stepFood++;
                this.path = [];
                this.satiety = foodAnts[i].antsSatiety;
                break;
            }
        }

        if (!this.truePheromone)
        {
            this.x = this.x + Math.cos(this.corner / 180 * Math.PI);
            this.y = this.y + Math.sin(this.corner / 180 * Math.PI);
            this.count++;
        }

        if (this.count > 20)
        {
            this.count = 0;
        }
    }
}

function Bubble(x, y)
{
    this.x = x;
    this.y = y;

    this.createAnts = function ()
    {
        let antsNumber = parseInt(document.getElementById('antsNum').value);
        let cornerDist = 360 / antsNumber;
        let corner = 0;

        for (let i = 0; i < antsNumber; i++)
        {
            let x = this.x + 30 * Math.cos(corner / 180 * Math.PI);
            let y = this.y + 30 * Math.sin(corner / 180 * Math.PI);

            let a = new Ant(x, y, corner);
            ants.push(a);

            corner += cornerDist;
        }
    }

    this.displayPoint = function()
    {
        fill("#eb4034");
        ellipse(this.x, this.y, 50, 50);
    }
}

function BubbleFood(x, y)
{
    this.x = x;
    this.y = y;
    this.antsSatiety = parseFloat(document.getElementById('antsSat').value);

    this.displayFood = function()
    {
        fill("#30e648");
        ellipse(this.x, this.y, 50, 50);
    }

    this.deleteFood = function ()
    {
        let d = dist(mouseX, mouseY, this.x, this.y);
        return d <= 25;
    }
}

document.getElementById("canvasP").onclick = function ()
{
    for (let i = 0; i < labyrinth.length; i++)
    {
        for (let j = 0; j < labyrinth[i].length; j++)
        {
            if ((mouseX >= labyrinth[i][j].x - 25) && (mouseX <= (labyrinth[i][j].x + 125)) &&
                (mouseY >= labyrinth[i][j].y - 25) && (mouseY <= (labyrinth[i][j].y + 125)) && (labyrinth[i][j].existence))
            {
                return;
            }
        }
    }

    if (clickLock && createAntHome)
    {
        homeAnts = new Bubble(mouseX, mouseY);
    }

    if (clickLock && actionsPoint)
    {
        let fa = new BubbleFood(mouseX, mouseY);
        foodAnts.push(fa);
    }

    if (clickLock && !actionsPoint)
    {
        for (let i = 0; i < foodAnts.length; i++)
        {
            if(foodAnts[i].deleteFood())
            {
                foodAnts.splice(i,1);
            }
        }
    }
}

function clickCreatePoints()
{
    createAntHome = true;
    actionsPoint = false;
}

function clickCreateFood()
{
    actionsPoint = true;
    createAntHome = false;
}

function clickDeleteFood()
{
    actionsPoint = false;
    createAntHome = false;
}

function clearGraphic()
{
    ants.splice(0);
    pheromoneToHome.splice(0);
    pheromoneToFood.splice(0);
    clickLock = true;
    actionsPoint = false;
    createAntHome = false;
    foodAnts.splice(0);
    homeAnts = null;
}

function bodyAntsBonus()
{
    homeAnts.createAnts();
    clickLock = false;
}

function draw() {
    clear();
    fill("#FDF7E1");
    rect(0, 0, 500, 500);

    for (let i = 0; i < labyrinth.length; i++)
    {
        for (let j = 0; j < labyrinth[i].length; j++)
        {
            labyrinth[i][j].displayWall();
        }
    }

    if (homeAnts !== null)
    {
        homeAnts.displayPoint();
    }

    for (let i = 0; i < foodAnts.length; i++)
    {
        foodAnts[i].displayFood();
    }

    for (let i = 0; i < pheromoneToHome.length; i++)
    {
        let exam = pheromoneToHome[i].pheromoneDisplayH();

        if (exam)
        {
            pheromoneToHome.splice(i,1);
        }
    }

    for (let i = 0; i < pheromoneToFood.length; i++)
    {
        let exam = pheromoneToFood[i].pheromoneDisplayF();

        if (exam)
        {
            pheromoneToFood.splice(i,1);
        }
    }

    for (let i = 0; i < ants.length; i++)
    {
        ants[i].displayAnt();
    }
}