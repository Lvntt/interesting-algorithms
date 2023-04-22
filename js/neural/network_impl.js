const WINDOW_WIDTH = 600;
const WINDOW_HEIGHT = 600;
const CELL_SIDE_COUNT = 5;

const CELL_SIDE_PX = WINDOW_WIDTH / CELL_SIDE_COUNT;

let canvas;
let networkAnswerLabel;
let trainingDataAnswerLabel;
let getAnswerButton;

// Элементы, относящиеся к обучению
// let addTrainingDataButton;
// let downloadTrainingDataButton;
// let trainNetworkButton;
// let loadTrainingDataButton;
// let loadTrainingDataFileInput;
// let downloadWeightsButton;

let neuralNetwork = new NeuralNetwork();
neuralNetwork.generateNeurons();
// neuralNetwork.generateRandomNeuronWeights();

let inputMatrix =
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];
let grid = new Array(CELL_SIDE_COUNT);
let testData = [];

function initAlgorithm() {
    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        grid[i] = new Array(CELL_SIDE_COUNT);
    }

    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        for (let j = 0; j < CELL_SIDE_COUNT; j++) {
            grid[i][j] = new NetworkCell(i, j);
        }
    }
}

function download(content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function getInputMatrix() {
    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        for (let j = 0; j < CELL_SIDE_COUNT; j++) {
            inputMatrix[i][j] = grid[i][j].isClicked ? 1 : 0;
        }
    }
    return inputMatrix;
}

function matrixToRow(matrix) {
    let row = [];
    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        for (let j = 0; j < CELL_SIDE_COUNT; j++) {
            row.push(matrix[i][j]);
        }
    }
    return row;
}

function addTrainingData() {
    let test = new Test;
    test.input = JSON.parse(JSON.stringify(matrixToRow(getInputMatrix())));
    test.answerLabel = trainingDataAnswerLabel.value();
    testData.push(test);
}

function downloadTrainingData() {
    download(JSON.stringify(testData), "json.txt", "text/plain");
}

function trainNetwork() {
    for (let i = 0; i < 100000; i++) {
        let index = Math.floor(Math.random() * testData.length);
        neuralNetwork.setInput(testData[index].input);
        neuralNetwork.getOutput();
        console.log(`Iteration ${i}: index=${index}, loss=${neuralNetwork.train(Number(testData[index].answerLabel))}`);
    }
}

function getNetworkAnswer() {
    neuralNetwork.setInput(matrixToRow(getInputMatrix()));
    neuralNetwork.getOutput();
    let answer = neuralNetwork.defineNetworkAnswer();
    networkAnswerLabel.html(answer);
    console.log(answer);
}

function downloadWeights() {
    download(JSON.stringify(neuralNetwork.toSaveObj()), "weights.txt", "text/plain");
}

function importWeights() {
    let importedWeights;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', '../../assets/json_weights.txt', true);
    xhr.onload = function() {
        if (this.status === 200) {
            const text = this.responseText;
            importedWeights = JSON.parse(text);
            neuralNetwork.fromSaveObj(importedWeights);
        }
    };
    xhr.send();
}

function setup() {
    canvas = createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    networkAnswerLabel = createP("0");
    getAnswerButton = createButton("Получить ответ");
    // addTrainingDataButton = createButton("Add training data");
    // trainingDataAnswerLabel = createInput("0", "text");
    // downloadTrainingDataButton = createButton("Download training data");
    // trainNetworkButton = createButton("Train the network");
    // loadTrainingDataFileInput = createFileInput(loadTrainingData);
    // loadTrainingDataButton = createButton("Load training data");
    // downloadWeightsButton = createButton("Download network weights");

    canvas.parent("algorithmWindow");
    networkAnswerLabel.parent("setupContent");
    getAnswerButton.parent("setupContent");
    // addTrainingDataButton.parent("setupContent");
    // trainingDataAnswerLabel.parent("setupContent");
    // downloadTrainingDataButton.parent("setupContent");
    // trainNetworkButton.parent("setupContent");
    // loadTrainingDataFileInput.parent("setupContent");
    // loadTrainingDataButton.parent("setupContent");
    // downloadWeightsButton.parent("setupContent")

    getAnswerButton.mousePressed(getNetworkAnswer);
    // addTrainingDataButton.mousePressed(addTrainingData);
    // downloadTrainingDataButton.mousePressed(downloadTrainingData);
    // trainNetworkButton.mousePressed(trainNetwork);
    // downloadWeightsButton.mousePressed(downloadWeights);

    initAlgorithm();
    importWeights();
}

function loadTrainingData(file) {
    testData = JSON.parse(file.data);
}

function mousePressed() {
    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        for (let j = 0; j < CELL_SIDE_COUNT; j++) {
            let current = grid[i][j];
            if (current.cellIsClicked()) {
                current.isClicked = !current.isClicked;
            }
        }
    }
}

function draw() {
    background(0);

    for (let i = 0; i < CELL_SIDE_COUNT; i++) {
        for (let j = 0; j < CELL_SIDE_COUNT; j++) {
            grid[i][j].show(grid[i][j].cellColor);
        }
    }
}