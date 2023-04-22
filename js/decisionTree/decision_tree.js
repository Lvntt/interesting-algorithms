// const defaultCSV = 'Fever,Cough,Breathing issues,Infected\n' +
//     'NO,NO,NO,NO\n' +
//     'YES,YES,YES,YES\n' +
//     'YES,YES,NO,NO\n' +
//     'YES,NO,YES,YES\n' +
//     'YES,YES,YES,YES\n' +
//     'NO,YES,NO,NO\n' +
//     'YES,NO,YES,YES\n' +
//     'YES,NO,YES,YES\n' +
//     'NO,YES,YES,YES\n' +
//     'YES,YES,NO,YES\n' +
//     'NO,YES,NO,NO\n' +
//     'NO,YES,YES,YES\n' +
//     'NO,YES,YES,NO\n' +
//     'YES,YES,NO,NO';
const defaultCSV = 'Outlook,Temperature,Humidity,Wind,PlayTennis\n' +
    'Sunny,Hot,High,Weak,No\n' +
    'Sunny,Hot,High,Strong,No\n' +
    'Overcast,Hot,High,Weak,Yes\n' +
    'Rain,Mild,High,Weak,Yes\n' +
    'Rain,Cool,Normal,Weak,Yes\n' +
    'Rain,Cool,Normal,Strong,No\n' +
    'Overcast,Cool,Normal,Strong,Yes\n' +
    'Sunny,Mild,High,Weak,No\n' +
    'Sunny,Cool,Normal,Weak,Yes\n' +
    'Rain,Mild,Normal,Weak,Yes\n' +
    'Sunny,Mild,Normal,Strong,Yes\n' +
    'Overcast,Mild,High,Strong,Yes\n' +
    'Overcast,Hot,Normal,Weak,Yes\n' +
    'Rain,Mild,High,Strong,No';

const TREE_BACKGROUND = '#404040';
const QUERY_BACKGROUND = '#FEC04D';
const WHITE = '#FFFFFF';

const CANVAS_SIZE = 800;
const LINE_LENGTH = 25;
const TEXT_SPACING = 100;
const NEWLINE_OFFSET = 60;
const CHILD_X_OFFSET = 50;
const ITEM_HEIGHT = 35;
const ITEM_CORNER_RADIUS = 15;
const LINE_WIDTH = 5;
const INPUT_WIDTH = 320;
const INPUT_HEIGHT_CSV = 200;
const INPUT_HEIGHT_QUERY = 50;
let currentYOffset = 0;
let currentQueryIndex = 0;

let currentTree = [];
let currentQueryPath = [];
let currentFeaturesAmount = 0;

let canvas;
let csvInput;
let csvQueryInput;
let buildTreeButton;
let executeQueryButton;
let hintText;

function getClassAmounts(dataset, targetClasses) {
    let classAmounts = new Array(targetClasses.length).fill(0);
    for (let row of dataset) {
        classAmounts[targetClasses.indexOf(row[row.length - 1])]++;
    }
    return classAmounts;
}

function entropy(datasetLength, classAmounts) {
    let result = 0;
    for (let classAmount of classAmounts) {
        if (classAmount !== 0 && datasetLength !== 0) {
            result -= (classAmount / datasetLength) * Math.log2((classAmount / datasetLength));
        }
    }
    return result;
}

function informationGain(datasetLength, baseDatasetEntropy, subDatasets, targetClasses) {
    let gain = baseDatasetEntropy;
    for (let subDataset of subDatasets) {
        if (subDataset.length !== 0 && datasetLength !== 0) {
            gain -= (subDataset.length / datasetLength) * entropy(subDataset.length, getClassAmounts(subDataset, targetClasses));
        }
    }
    return gain;
}

function ID3Step(dataset, featureNames, targetClasses, availableFeatures, previousParamValue) {
    let currentClassAmounts = getClassAmounts(dataset, targetClasses);
    let maxClassAmount = currentClassAmounts[0];
    let maxClassAmountIndex = 0;
    for (let classAmountIndex of currentClassAmounts.keys()) {
        if (currentClassAmounts[classAmountIndex] > maxClassAmount) {
            maxClassAmount = currentClassAmounts[classAmountIndex];
            maxClassAmountIndex = classAmountIndex;
        }
    }
    let currentEntropy = entropy(dataset.length, currentClassAmounts);
    if (currentEntropy === 0.0) {
        return [previousParamValue, dataset[0][dataset[0].length - 1]];
    }
    if (availableFeatures.length === 0) {
        return [previousParamValue, targetClasses[maxClassAmountIndex]];
    }
    let maxInformationGain = -1;
    let maxInformationGainFeatureIndex = 0;
    let maxFeatureValues;
    let maxFeatureSubsets;
    for (let feature of availableFeatures.keys()) {
        let featureValues = new Set();
        for (let row of dataset) {
            featureValues.add(row[availableFeatures[feature]]);
        }
        featureValues = Array.from(featureValues);
        let subDatasets = new Array(featureValues.length).fill([]);
        for (let row of dataset) {
            let index = featureValues.indexOf(row[availableFeatures[feature]]);
            subDatasets[index] = subDatasets[index].concat([row]);
        }
        let featureGain = informationGain(dataset.length, currentEntropy, subDatasets, targetClasses);
        if (featureGain > maxInformationGain) {
            maxInformationGain = featureGain;
            maxInformationGainFeatureIndex = feature;
            maxFeatureValues = featureValues;
            maxFeatureSubsets = subDatasets;
        }
    }
    if (maxFeatureValues.length === 1) {
        return [previousParamValue, targetClasses[maxClassAmountIndex]];
    }
    let subTrees = [previousParamValue, featureNames[availableFeatures[maxInformationGainFeatureIndex]]];
    let availableFeaturesCopy = [];
    for (let i = 0; i < availableFeatures.length; i++) {
        if (i !== maxInformationGainFeatureIndex) {
            availableFeaturesCopy.push(i);
        }
    }
    for (let featureValueIndex of maxFeatureValues.keys()) {
        if (maxFeatureSubsets[featureValueIndex].length === 0) {
            subTrees.push(maxFeatureValues[featureValueIndex], targetClasses[maxClassAmountIndex]);
        } else {
            subTrees.push(ID3Step(maxFeatureSubsets[featureValueIndex], featureNames, targetClasses, availableFeaturesCopy, maxFeatureValues[featureValueIndex]));
        }
    }
    return subTrees;
}

function executeID3(parsedCSV) {
    if (parsedCSV.length > 1) {
        let targetClasses = new Set();
        let dataset = parsedCSV.slice(1, parsedCSV.length);
        let featureNames = parsedCSV[0];
        for (let row of dataset) {
            targetClasses.add(row[row.length - 1]);
        }
        targetClasses = Array.from(targetClasses);
        let availableFeatures = [];
        for (let i = 0; i < featureNames.length - 1; i++) {
            availableFeatures.push(i);
        }
        let previousParamValue = 'Корень';
        return ID3Step(dataset, featureNames, targetClasses, availableFeatures, previousParamValue);
    } else {
        return [];
    }
}

function parseCSV(text) {
    let rows = text.split('\n');
    let result = [];
    let currentLen = -1;
    for (let row of rows) {
        let splitRow = row.split(',');
        if (currentLen >= 0 && splitRow.length !== currentLen) {
            return null;
        }
        result.push(splitRow);
        currentLen = splitRow.length;
    }
    currentFeaturesAmount = currentLen;
    return result;
}

function buildTree() {
    currentQueryPath = [];
    let parsedText = parseCSV(csvInput.elt.value);
    if (parsedText != null) {
        currentTree = executeID3(parsedText);
    }
}


function processQueryStep(subDataset, remainingValues) {
    if (subDataset.length > 2) {
        if (remainingValues.length > 0) {
            let foundFeature = false;
            for (let i = 2; i < subDataset.length; i++) {
                let featureIndex = remainingValues.indexOf(subDataset[i][0]);
                if (featureIndex !== -1) {
                    currentQueryPath.push(subDataset[i][0]);
                    foundFeature = true;
                    remainingValues.splice(featureIndex, 1);
                    processQueryStep(subDataset[i], remainingValues);
                    break;
                }
            }
            if (!foundFeature) {
                currentQueryPath = [];
            }
        } else {
            currentQueryPath = [];
        }
    } else {
        currentQueryPath.push(subDataset[1]);
    }
}

function executeQuery() {
    currentQueryPath = [];
    let parsedQuery = csvQueryInput.value().split(',');
    processQueryStep(currentTree, parsedQuery);
}

function setup() {
    canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    hintText = createP('В CSV первая строка должна содержать названия параметров');
    csvInput = createElement('textarea');
    buildTreeButton = createButton('Построить дерево');
    csvQueryInput = createInput('');
    executeQueryButton = createButton('Выполнить запрос');

    csvInput.elt.placeholder = 'Введите выборку CSV сюда...';
    csvInput.elt.value = defaultCSV;

    csvInput.size(INPUT_WIDTH, INPUT_HEIGHT_CSV);
    csvQueryInput.size(INPUT_WIDTH, INPUT_HEIGHT_QUERY);

    canvas.parent('algorithm-window');
    hintText.parent('setup-content');
    csvInput.parent('setup-content');
    buildTreeButton.parent('setup-content');
    csvQueryInput.parent('setup-content');
    executeQueryButton.parent('setup-content');

    buildTreeButton.mousePressed(buildTree);
    executeQueryButton.mousePressed(executeQuery);
}

function draw() {
    clear();
    currentYOffset = NEWLINE_OFFSET;
    currentQueryIndex = -1;
    if (currentTree.length > 0) {
        drawNode(currentTree, TEXT_SPACING, NEWLINE_OFFSET, currentQueryPath.length > 0, currentQueryPath.length > 0);
    }
}

function drawNode(subTree, xOffset, parentYPosition, highlightQuery, prevIsHighlighted) {
    let backgroundColor = highlightQuery && prevIsHighlighted ? QUERY_BACKGROUND : TREE_BACKGROUND;
    fill(backgroundColor);
    stroke(backgroundColor);
    strokeWeight(LINE_WIDTH);
    line(xOffset - TEXT_SPACING / 2, parentYPosition, xOffset - TEXT_SPACING / 2, currentYOffset);
    rectMode(CENTER);
    rect(xOffset, currentYOffset, TEXT_SPACING, ITEM_HEIGHT, ITEM_CORNER_RADIUS);
    textAlign(CENTER, CENTER);
    fill(WHITE);
    text(subTree[0], xOffset, currentYOffset);
    line(xOffset + TEXT_SPACING / 2, currentYOffset, xOffset + LINE_LENGTH + TEXT_SPACING / 2, currentYOffset);
    fill(backgroundColor);
    rect(xOffset + LINE_LENGTH + TEXT_SPACING, currentYOffset, TEXT_SPACING, ITEM_HEIGHT, ITEM_CORNER_RADIUS);
    fill(WHITE);
    text(subTree[1], xOffset + LINE_LENGTH + TEXT_SPACING, currentYOffset);
    let savedOffset = currentYOffset;
    currentYOffset += NEWLINE_OFFSET;
    if (highlightQuery) {
        currentQueryIndex++;
    }
    if (subTree.length > 2) {
        for (let i = 2; i < subTree.length; i++) {
            drawNode(subTree[i], xOffset + LINE_LENGTH + TEXT_SPACING / 2 + CHILD_X_OFFSET, savedOffset, subTree[i][0] === currentQueryPath[currentQueryIndex], highlightQuery);
        }
    }
}