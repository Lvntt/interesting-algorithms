let points = [];
let ways = [];
let lines = [];
let descendant1 = [];
let descendant2 = [];
let clickLock = true;
let actionsPoint = false;
let indexI = 0;
let colorPoint = "#595959";
let subsequence;
let factorial;
let genesNumber;
let mutationPercentage;
let generationsNumber;

function setup() {
    clickLock = true;
    const canvasPoint = createCanvas(600, 600);
    canvasPoint.parent("canvasP");
}

function Bubble(x, y)
{
    this.x = x;
    this.y = y;


    this.displayPoint = function()
    {
        fill(colorPoint);
        ellipse(this.x, this.y, 20, 20);
    }

    this.deletePoint = function ()
    {
        let d = dist(mouseX, mouseY, this.x, this.y);
        return d <= 20;
    }
}

function Paths(permutation, lengthPath)
{
    this.permutayion = permutation.slice(0);
    this.lengthPath = lengthPath;
}

function LinePath(x1, y1, x2, y2)
{
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.displayLine = function ()
    {
        line(this.x1, this.y1, this.x2, this.y2);
    }
}

document.getElementById("canvasP").onclick = function () {
    if (clickLock && actionsPoint && (ways.length === 0)) {
        let p = new Bubble(mouseX, mouseY);
        points.push(p);
    }

    if (clickLock && !actionsPoint && (ways.length === 0)) {
        for (let i = 0; i < points.length; i++)
        {
            if(points[i].deletePoint())
            {
                points.splice(i,1);
            }
        }
    }
}

function clickCreatePoints()
{
    actionsPoint = true;
}

function clickDeletePoints()
{
    actionsPoint = false;
}

function clearGraphic()
{
    points.splice(0);
    lines.splice(0);
    ways.splice(0);
}

function bodyGenetic()
{
    if (ways.length === 0)
    {
        clickLock = false;
    }
}

function draw() {
    fill("#FDF7E1");
    rect(0, 0, 600, 600);
    frameRate(50);

    function createPermutation(permutation)
    {
        let index = permutation.length - 2;

        while ((index !== -1) && (permutation[index] >= permutation[index + 1]))
        {
            index--;
        }

        let index2 = permutation.length - 1;

        while (permutation[index] >= permutation[index2])
        {
            index2--;
        }

        let save = permutation[index];
        permutation[index] = permutation[index2];
        permutation[index2] = save;

        let leftIndex = index + 1;
        let rightIndex = permutation.length - 1;

        while (leftIndex < rightIndex)
        {
            let save = permutation[leftIndex];
            permutation[leftIndex] = permutation[rightIndex];
            permutation[rightIndex] = save;

            leftIndex++;
            rightIndex--;
        }

        return permutation;
    }

    function creatingGenes(subsequence, genesNumber)
    {
        let lengthPath = 0;

        for (let i = 0; i < (subsequence.length - 1); i++)
        {
            lengthPath = lengthPath + dist(points[subsequence[i]].x, points[subsequence[i]].y,
                points[subsequence[i+1]].x, points[subsequence[i+1]].y);
        }

        lengthPath = lengthPath + dist(points[subsequence[subsequence.length - 1]].x, points[subsequence[subsequence.length - 1]].y,
            points[subsequence[0]].x, points[subsequence[0]].y);

        let w = new Paths(subsequence, lengthPath);
        ways.push(w);

        lengthPath = 0;

        for (let i = 1; i < genesNumber; i++)
        {
            subsequence = createPermutation(subsequence);

            for (let j = 0; j < (subsequence.length - 1); j++)
            {
                lengthPath = lengthPath + dist(points[subsequence[j]].x, points[subsequence[j]].y,
                    points[subsequence[j+1]].x, points[subsequence[j+1]].y);
            }

            lengthPath = lengthPath + dist(points[subsequence[subsequence.length - 1]].x, points[subsequence[subsequence.length - 1]].y,
                points[subsequence[0]].x, points[subsequence[0]].y);

            w = new Paths(subsequence, lengthPath);
            ways.push(w);

            lengthPath = 0;
        }
    }

    function crossbreeding()
    {
        let index1 = (int)(random(ways.length));
        let index2 = index1;

        while (index2 === index1)
        {
            index2 = (int)(random(ways.length));
        }

        let indexDelimiter = (int)(random(2, ways[index1].permutayion.length - 1));

        descendant1 = ways[index2].permutayion.slice(0, indexDelimiter);
        descendant2 = ways[index1].permutayion.slice(0, indexDelimiter);

        for (let i = indexDelimiter; i < ways[index1].permutayion.length; i++)
        {
            if (!descendant1.includes(ways[index1].permutayion[i]))
            {
                descendant1.push(ways[index1].permutayion[i]);
            }

            if (!descendant2.includes(ways[index2].permutayion[i]))
            {
                descendant2.push(ways[index2].permutayion[i]);
            }
        }

        if ((descendant1.length < ways[index1].permutayion.length) && (descendant2.length < ways[index1].permutayion.length))
        {
            for (let i = 0; i < ways[index1].permutayion.length; i++)
            {
                if (!descendant1.includes(i))
                {
                    descendant1.push(i);
                }

                if (!descendant2.includes(i))
                {
                    descendant2.push(i);
                }
            }
        }
    }

    function mutation(descendant)
    {
        let index1 = (int)(random(descendant.length));
        let index2 = index1;

        while (index2 === index1)
        {
            index2 = (int)(random(descendant.length));
        }

        let save = descendant[index1];
        descendant[index1] = descendant[index2];
        descendant[index2] = save;
    }

    function selection()
    {
        let lengthPath = 0;

        for (let i = 0; i < (descendant1.length - 1); i++)
        {
            lengthPath = lengthPath + dist(points[descendant1[i]].x, points[descendant1[i]].y,
                points[descendant1[i+1]].x, points[descendant1[i+1]].y);
        }

        lengthPath = lengthPath + dist(points[descendant1[descendant1.length - 1]].x, points[descendant1[descendant1.length - 1]].y,
            points[descendant1[0]].x, points[descendant1[0]].y);

        let w = new Paths(descendant1, lengthPath);
        ways.push(w);

        lengthPath = 0;

        for (let i = 0; i < (descendant2.length - 1); i++)
        {
            lengthPath = lengthPath + dist(points[descendant2[i]].x, points[descendant2[i]].y,
                points[descendant2[i+1]].x, points[descendant2[i+1]].y);
        }

        lengthPath = lengthPath + dist(points[descendant2[descendant2.length - 1]].x, points[descendant2[descendant2.length - 1]].y,
            points[descendant2[0]].x, points[descendant2[0]].y);

        w = new Paths(descendant2, lengthPath);
        ways.push(w);

        ways.sort((a,b)=>(a.lengthPath - b.lengthPath));

        ways.splice(ways.length - 2);
    }

    function printPath()
    {
        for (let i = 0; i < ways[0].permutayion.length - 1; i++)
        {
            let l = new LinePath(points[ways[0].permutayion[i]].x, points[ways[0].permutayion[i]].y,
                points[ways[0].permutayion[i+1]].x, points[ways[0].permutayion[i+1]].y);
            lines.push(l);
        }
        let l = new LinePath(points[ways[0].permutayion[ways[0].permutayion.length - 1]].x, points[ways[0].permutayion[ways[0].permutayion.length - 1]].y,
            points[ways[0].permutayion[0]].x, points[ways[0].permutayion[0]].y);
        lines.push(l);
    }

    if (!clickLock) {

        if (indexI === 0)
        {
            colorPoint = "#FDAD1C";
            subsequence = [];
            factorial = 1;
            genesNumber = document.getElementById('genesNum').value;
            mutationPercentage = document.getElementById('mutationPercent').value;
            generationsNumber = parseInt(document.getElementById('generationsNum').value);

            for (let i = 1; i <= points.length; i++)
            {
                subsequence.push(i - 1);
                factorial = factorial * i;
            }

            if (points.length <= 1)
            {
                colorPoint = "#595959";

                let div4 = document.createElement('div');
                div4.className = "error";
                div4.innerHTML = "Количество точек должно быть больше 1";

                document.getElementById("mainContent").prepend(div4);
                setTimeout(() => div4.remove(), 6000);

                clickLock = true;
                return 0;
            }

            if ((genesNumber > factorial) || (genesNumber < 2))
            {
                colorPoint = "#595959";

                let div1 = document.createElement('div');
                div1.className = "error";
                div1.innerHTML = "Количество генов не может быть меньше 2 и больше факториала количества точек";

                document.getElementById("mainContent").prepend(div1);
                setTimeout(() => div1.remove(), 6000);

                clickLock = true;
                return 0;
            }

            if (generationsNumber < 1)
            {
                colorPoint = "#595959";

                let div3 = document.createElement('div');
                div3.className = "error";
                div3.innerHTML = "Количество поколений не может быть меньше 1";

                document.getElementById("mainContent").prepend(div3);
                setTimeout(() => div3.remove(), 6000);

                clickLock = true;
                return 0;
            }

            if ((points.length > 1) && (points.length < 4) && (generationsNumber > 1))
            {
                colorPoint = "#595959";

                let div5 = document.createElement('div');
                div5.className = "error";
                div5.innerHTML = "Если количество точек равно 2 или 3, то может быть только одно поколение";

                document.getElementById("mainContent").prepend(div5);
                setTimeout(() => div5.remove(), 6000);

                clickLock = true;
                return 0;
            }

            creatingGenes(subsequence, genesNumber);
            ways.sort((a, b) => (a.lengthPath - b.lengthPath));
            printPath();
        }

        if ((indexI < generationsNumber) && (indexI !== 0))
        {

            descendant1 = [];
            descendant2 = [];

            crossbreeding();

            let percent = random(100);

            if (percent <= mutationPercentage)
            {
                mutation(descendant1);
            }

            percent = random(1, 101);

            if (percent <= mutationPercentage)
            {
                mutation(descendant2);
            }

            selection();

            fill("#FDF7E1");
            rect(0, 0, 600, 600);

            for (let i = 0; i < points.length; i++)
            {
                points[i].displayPoint();
            }

            lines.splice(0);
            printPath();
        }

        indexI++;

        if (indexI === generationsNumber)
        {
            clickLock = true;
            indexI = 0;
            colorPoint = "#595959";
        }
    }

    for (let i = 0; i < lines.length; i++)
    {
        lines[i].displayLine();
    }

    for (let i = 0; i < points.length; i++)
    {
        points[i].displayPoint();
    }
}