const POINT_DIAMETER = 40;
const CANVAS_SIZE = 400;
const POPUP_WIDTH_SINGLE = 170;
const POPUP_HEIGHT_SINGLE = 50;
const POPUP_OFFSET_X_SINGLE = 100;
const POPUP_OFFSET_Y_SINGLE = 30;
const POPUP_WIDTH_COMPARISON = 170;
const POPUP_HEIGHT_COMPARISON = 100;
const POPUP_OFFSET_X_COMPARISON = 100;
const POPUP_OFFSET_Y_COMPARISON = 50;
const POPUP_CORNER_RADIUS = 20;
const BORDER_COLOR = '#404040';
const POINT_COLORS_COMPARISON_1 = ['#F2551F', '#34E298', '#1E1CA2', '#8A4063',
    '#57B9EE', '#B029BD', '#92B3B0', '#C7A002',
    '#2E7021', '#6C7741'];
const POINT_COLORS_COMPARISON_2 = ['#6ABE79', '#DEEC68', '#F16919', '#52D926',
    '#AC31A9', '#0B4CA3', '#EACAF5', '#02D7EC',
    '#C70C24', '#260F53'];
const POINT_COLORS_DEFAULT = ['#BDC306', '#FA0A5D', '#9D6E9F', '#31A1BC',
    '#473F8E', '#94937C', '#46B20E', '#141356',
    '#100412', '#64FFE3'];
const TRANSPARENT = '#00000000';
const WHITE = '#FFF';
const COMP_COLORS = [POINT_COLORS_DEFAULT, POINT_COLORS_COMPARISON_1, POINT_COLORS_COMPARISON_2];
const Mode = Object.freeze({
    Edit: 'Edit', KMeans: 'KMeans', Hierarchy: 'Hierarchy', DBSCAN: 'DBSCAN', Comparison: 'Comparison'
});
const ModeArray = [Mode.KMeans, Mode.Hierarchy, Mode.DBSCAN];
let currentMode = Mode.Edit;
let points = [];
let clusters = [];

class Point {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }
}

function checkPointsIntersection(firstPosX, firstPosY, secondPosX, secondPosY, firstDiameter, secondDiameter) {
    return dist(firstPosX, firstPosY, secondPosX, secondPosY) <= (firstDiameter + secondDiameter) / 2;
}

function checkPointHover(posX, posY, diameter) {
    return dist(posX, posY, mouseX, mouseY) <= diameter / 2;
}

function squaredEuclideanDistance(firstPosX, firstPosY, secondPosX, secondPosY) {
    return (firstPosX - secondPosX) * (firstPosX - secondPosX) + (firstPosY - secondPosY) * (firstPosY - secondPosY);
}

function kMeansClustering(clustersCount) {
    if (points.length >= clustersCount) {
        let kMeanClusters = [];
        let clusterCentroids = [];
        let foundDifferentCentroids = true;
        let step = points.length / clustersCount;
        let pointIterator = 0;
        for (let i = 0; i < clustersCount; i++, pointIterator += step) {
            clusterCentroids.push(points[Math.floor(pointIterator)]);
            kMeanClusters.push([]);
        }
        while (foundDifferentCentroids) {
            for (let clusterIndex of kMeanClusters.keys()) {
                kMeanClusters[clusterIndex] = [];
            }
            for (let point of points) {
                let minIndex = 0;
                let minDistance = Number.MAX_VALUE;
                for (let centroidIndex of clusterCentroids.keys()) {
                    let distance = squaredEuclideanDistance(point.posX, point.posY, clusterCentroids[centroidIndex].posX, clusterCentroids[centroidIndex].posY);
                    if (distance < minDistance) {
                        minIndex = centroidIndex;
                        minDistance = distance;
                    }
                }
                kMeanClusters[minIndex].push(point);
            }
            foundDifferentCentroids = false;
            for (let clusterIndex of kMeanClusters.keys()) {
                let centroidPosX = kMeanClusters[clusterIndex].reduce((total, nextPoint) => total + nextPoint.posX, 0);
                centroidPosX /= kMeanClusters[clusterIndex].length;
                let centroidPosY = kMeanClusters[clusterIndex].reduce((total, nextPoint) => total + nextPoint.posY, 0);
                centroidPosY /= kMeanClusters[clusterIndex].length;
                if (centroidPosX !== clusterCentroids[clusterIndex].posX || centroidPosY !== clusterCentroids[clusterIndex].posY) {
                    clusterCentroids[clusterIndex] = new Point(centroidPosX, centroidPosY);
                    if (!foundDifferentCentroids) {
                        foundDifferentCentroids = true;
                    }
                }
            }
        }
        return kMeanClusters;
    }
    return false;
}

function hierarchicalClustering(clustersCount) {
    if (points.length >= clustersCount) {
        let hierarchyClusters = [];
        let clusterCentroids = [];
        let currentClustersCount = points.length;
        for (let pointIndex of points.keys()) {
            hierarchyClusters.push([points[pointIndex]]);
            clusterCentroids.push(points[pointIndex]);
        }
        while (currentClustersCount > clustersCount) {
            let firstClusterIndex = 0;
            let secondClusterIndex = 1;
            let minClusterDistance = Number.MAX_VALUE;
            for (let row = 0; row < currentClustersCount; row++) {
                for (let column = row + 1; column < currentClustersCount; column++) {
                    let distance = squaredEuclideanDistance(clusterCentroids[row].posX, clusterCentroids[row].posY, clusterCentroids[column].posX, clusterCentroids[column].posY);
                    if (distance < minClusterDistance) {
                        minClusterDistance = distance;
                        firstClusterIndex = row;
                        secondClusterIndex = column;
                    }
                }
            }
            hierarchyClusters[firstClusterIndex] = concat(hierarchyClusters[firstClusterIndex], hierarchyClusters[secondClusterIndex]);
            let centroidPosX = hierarchyClusters[firstClusterIndex].reduce((total, nextPoint) => total + nextPoint.posX, 0) / hierarchyClusters[firstClusterIndex].length;
            let centroidPosY = hierarchyClusters[firstClusterIndex].reduce((total, nextPoint) => total + nextPoint.posY, 0) / hierarchyClusters[firstClusterIndex].length;
            clusterCentroids[firstClusterIndex] = new Point(centroidPosX, centroidPosY);
            hierarchyClusters.splice(secondClusterIndex, 1);
            clusterCentroids.splice(secondClusterIndex, 1);
            currentClustersCount--;
        }
        return hierarchyClusters;
    }
    return false;
}

function getNeighborsWithinDistance(corePoint, points, distance) {
    let result = [];
    for (let point of points) {
        if (point.posX !== corePoint.posX && point.posY !== corePoint.posY && squaredEuclideanDistance(corePoint.posX, corePoint.posY, point.posX, point.posY) <= distance * distance) {
            result.push(point);
        }
    }
    return result;
}

function DBSCAN(eps, minNeighboursAmount) {
    //First cluster is noise
    let dbscanClusters = [[]];
    let visitedPoints = [];
    let clusteredPoints = [];
    for (let point of points) {
        if (visitedPoints.find(pointToCompare => pointToCompare.posX === point.posX && pointToCompare.posY === point.posY)) {
            continue;
        }
        visitedPoints.push(point);
        let neighbors = getNeighborsWithinDistance(point, points, eps);
        if (neighbors.length < minNeighboursAmount) {
            dbscanClusters[0].push(point);
        } else {
            dbscanClusters.push([point]);
            while (neighbors.length > 0) {
                let neighbor = neighbors.pop();
                if (!visitedPoints.find(pointToCompare => pointToCompare.posX === neighbor.posX && pointToCompare.posY === neighbor.posY)) {
                    visitedPoints.push(neighbor);
                    let neighborNeighbors = getNeighborsWithinDistance(neighbor, points, eps);
                    if (neighborNeighbors.length >= minNeighboursAmount) {
                        neighbors = concat(neighbors, neighborNeighbors);
                    }
                }
                if (!clusteredPoints.find(pointToCompare => pointToCompare.posX === neighbor.posX && pointToCompare.posY === neighbor.posY)) {
                    clusteredPoints.push(neighbor);
                    dbscanClusters[dbscanClusters.length - 1].push(neighbor);
                    let noiseIndex = dbscanClusters[0].findIndex(pointToCompare => pointToCompare.posX === neighbor.posX && pointToCompare.posY === neighbor.posY);
                    if (noiseIndex !== -1) {
                        dbscanClusters[0].splice(noiseIndex, 1);
                    }
                }
            }
        }
    }
    return dbscanClusters;
}

function setup() {
    let canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    canvas.parent('algorithmWindow');
    canvas.mouseClicked(canvasClicked);
    let editButton = createButton('Edit mode');
    editButton.parent('setupContent');
    editButton.mousePressed(() => {
        if (currentMode !== Mode.Edit) {
            currentMode = Mode.Edit;
        }
    });
    let slider = createSlider(2, POINT_COLORS_DEFAULT.length, 2, 1);
    slider.parent('setupContent');
    let kMeanButton = createButton('K-Mean clustering');
    kMeanButton.parent('setupContent');
    kMeanButton.mousePressed(() => {
        let kMeansResult = kMeansClustering(slider.value());
        if (kMeansResult) {
            currentMode = Mode.KMeans;
            clusters = kMeansResult;
        }
    });
    let hierarchicalButton = createButton('Hierarchical clustering');
    hierarchicalButton.parent('setupContent');
    hierarchicalButton.mousePressed(() => {
        let hierarchicalResult = hierarchicalClustering(slider.value());
        if (hierarchicalResult) {
            currentMode = Mode.Hierarchy;
            clusters = hierarchicalResult;
        }
    });
    let epsInput = createInput('', 'number');
    epsInput.parent('setupContent');
    let minNeighborsInput = createInput('', 'number');
    minNeighborsInput.parent('setupContent');
    let dbscanButton = createButton('DBSCAN');
    dbscanButton.parent('setupContent');
    dbscanButton.mousePressed(() => {
        let eps = parseFloat(epsInput.value());
        let minNeighborsAmount = parseInt(minNeighborsInput.value());
        if (!isNaN(eps) && !isNaN(minNeighborsAmount)) {
            let DBSCANResult = DBSCAN(epsInput.value(), minNeighborsInput.value());
            currentMode = Mode.DBSCAN;
            clusters = DBSCANResult;
        }
    });
    let compareButton = createButton('Compare');
    compareButton.parent('setupContent');
    compareButton.mousePressed(() => {
        let eps = parseFloat(epsInput.value());
        let minNeighborsAmount = parseInt(minNeighborsInput.value());
        if (!isNaN(eps) && !isNaN(minNeighborsAmount)) {
            let DBSCANResult = DBSCAN(epsInput.value(), minNeighborsInput.value());
            let hierarchicalResult = hierarchicalClustering(slider.value());
            let kMeansResult = kMeansClustering(slider.value());
            if (hierarchicalResult && kMeansResult) {
                currentMode = Mode.Comparison;
                clusters = [];
                clusters.push(kMeansResult);
                clusters.push(hierarchicalResult);
                clusters.push(DBSCANResult);
            }
        }
    });
}

function draw() {
    clear();
    background(TRANSPARENT);
    rectMode(CORNER);
    fill(TRANSPARENT);
    strokeWeight(4);
    stroke(BORDER_COLOR);
    rect(0, 0, 400, 400);
    if (currentMode === Mode.Edit) {
        for (let point of points) {
            fill(BORDER_COLOR);
            noStroke();
            circle(point.posX, point.posY, POINT_DIAMETER);
        }
    } else {
        if (currentMode !== Mode.Comparison) {
                let pointIsHovered = false;
                let hoveredPoint;
                let pointClusterIndex;
                for (let clusterIndex of clusters.keys()) {
                    for (let point of clusters[clusterIndex]) {
                        if (!pointIsHovered && dist(point.posX, point.posY, mouseX, mouseY) <= POINT_DIAMETER / 2) {
                            pointIsHovered = true;
                            hoveredPoint = point;
                            pointClusterIndex = clusterIndex;
                        }
                        fill(POINT_COLORS_DEFAULT[clusterIndex % POINT_COLORS_DEFAULT.length]);
                        noStroke();
                        circle(point.posX, point.posY, POINT_DIAMETER);
                    }
                }
                if (pointIsHovered) {
                    fill(BORDER_COLOR);
                    noStroke();
                    rectMode(CENTER);
                    let xCoordinate = (hoveredPoint.posX - POPUP_OFFSET_X_SINGLE - POPUP_WIDTH_SINGLE / 2 > 0 ? hoveredPoint.posX - POPUP_OFFSET_X_SINGLE : hoveredPoint.posX + POPUP_OFFSET_X_SINGLE);
                    let yCoordinate = (hoveredPoint.posY - POPUP_OFFSET_Y_SINGLE - POPUP_HEIGHT_SINGLE / 2 > 0 ? hoveredPoint.posY - POPUP_OFFSET_Y_SINGLE : hoveredPoint.posY + POPUP_OFFSET_Y_SINGLE);
                    let popupText = (currentMode === Mode.DBSCAN && pointClusterIndex === 0 ? 'Noise point' : 'Point of cluster #' + pointClusterIndex);
                    rect(xCoordinate, yCoordinate, POPUP_WIDTH_SINGLE, POPUP_HEIGHT_SINGLE, POPUP_CORNER_RADIUS);
                    fill(WHITE);
                    textAlign(CENTER, CENTER);
                    textSize(14);
                    text(popupText, xCoordinate, yCoordinate);
                }
            } else {
                let pointIsHovered = false;
                let hoveredPoints = [];
                let hoveredClusterIndices = [];
                for (let clusterGroupIndex of clusters.keys()) {
                    for (let clusterIndex of clusters[clusterGroupIndex].keys()) {
                        for (let point of clusters[clusterGroupIndex][clusterIndex]) {
                            if (dist(point.posX, point.posY, mouseX, mouseY) <= POINT_DIAMETER / 2) {
                                pointIsHovered = true;
                                hoveredPoints.push(point);
                                hoveredClusterIndices.push([clusterGroupIndex,clusterIndex]);
                            }
                            fill(COMP_COLORS[clusterGroupIndex][clusterIndex % POINT_COLORS_DEFAULT.length]);
                            noStroke();
                            arc(point.posX, point.posY, POINT_DIAMETER, POINT_DIAMETER, clusterGroupIndex * 2 * (PI / 3), (clusterGroupIndex + 1) * 2 * (PI / 3));
                        }
                    }
                }
                if(pointIsHovered) {
                    fill(BORDER_COLOR);
                    noStroke();
                    rectMode(CENTER);
                    let xCoordinate = (hoveredPoints[0].posX - POPUP_OFFSET_X_COMPARISON - POPUP_WIDTH_COMPARISON / 2 > 0 ? hoveredPoints[0].posX - POPUP_OFFSET_X_COMPARISON : hoveredPoints[0].posX + POPUP_OFFSET_X_COMPARISON);
                    let yCoordinate = (hoveredPoints[0].posY - POPUP_OFFSET_Y_COMPARISON - POPUP_HEIGHT_COMPARISON /2 > 0 ? hoveredPoints[0].posY - POPUP_OFFSET_Y_COMPARISON : hoveredPoints[0].posY + POPUP_OFFSET_Y_COMPARISON);
                    let texts = [];
                    for(let point of hoveredClusterIndices) {
                        texts.push(ModeArray[point[0]] + ': ' + (ModeArray[point[0]] === Mode.DBSCAN && point[1] === 0 ? 'Noise point' : 'Point of cluster #' + point[1]));
                    }
                    rect(xCoordinate, yCoordinate, POPUP_WIDTH_COMPARISON, POPUP_HEIGHT_COMPARISON, POPUP_CORNER_RADIUS);
                    fill(WHITE);
                    textAlign(CENTER, CENTER);
                    textSize(12);
                    text(texts[0], xCoordinate, yCoordinate - POPUP_HEIGHT_COMPARISON / 3);
                    text(texts[1], xCoordinate, yCoordinate);
                    text(texts[2], xCoordinate, yCoordinate + POPUP_HEIGHT_COMPARISON / 3);
                }
            }
    }
}

function canvasClicked() {
    if (currentMode === Mode.Edit) {
        for (let index of points.keys()) {
            if (checkPointsIntersection(points[index].posX, points[index].posY, mouseX, mouseY, POINT_DIAMETER, POINT_DIAMETER)) {
                if (checkPointHover(points[index].posX, points[index].posY, POINT_DIAMETER)) {
                    points.splice(index, 1);
                }
                return;
            }
        }
        points.push(new Point(mouseX, mouseY, POINT_DIAMETER));
    }
}