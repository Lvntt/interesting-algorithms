class NeuralNetwork {
    static ReLU(inputValue) {
        return Math.max(0, inputValue);
    }

    static getDerivativeReLU(inputValue) {
        return inputValue >= 0;
    }

    learningRate = 0.04;

    inputLayerSize = 25;
    inputLayer = [];

    invisibleLayerSize = 25;
    invisibleLayer = [];

    outputLayerSize = 10;
    outputLayer = [];

    // Заполнение слоев нейронами
    generateNeurons() {
        for (let i = 0; i < this.inputLayerSize; i++) {
            this.inputLayer.push(new Neuron());
        }

        for (let i = 0; i < this.invisibleLayerSize; i++) {
            this.invisibleLayer.push(new Neuron());
        }

        for (let i = 0; i < this.outputLayerSize; i++) {
            this.outputLayer.push(new Neuron());
        }
    }

    // Генерация рандомных весов для первой итерации обучения
    generateRandomNeuronWeights() {
        for (let i = 0; i < this.invisibleLayerSize; i++) {
            this.invisibleLayer[i].setWeights(this.inputLayerSize, Helper.generateRandomWeights(this.inputLayerSize));
        }
        for (let i = 0; i < this.outputLayerSize; i++) {
            this.outputLayer[i].setWeights(this.invisibleLayerSize, Helper.generateRandomWeights(this.invisibleLayerSize));
        }
    }

    // Функция для сохранения весов в объект типа SaveOBJ
    toSaveObj() {
        let saveObj = new SaveOBJ;

        for (let i = 0; i < this.invisibleLayerSize; i++) {
            saveObj.invisibleLayer.push(JSON.parse(JSON.stringify(this.invisibleLayer[i].weights)));
        }
        for (let i = 0; i < this.outputLayerSize; i++) {
            saveObj.outputLayer.push(JSON.parse(JSON.stringify(this.outputLayer[i].weights)));
        }

        return saveObj;
    }

    // Функция для импорта весов из объекта типа SaveOBJ
    fromSaveObj(saveObj) {
        for (let i = 0; i < this.invisibleLayerSize; i++) {
            this.invisibleLayer[i].setWeights(this.inputLayerSize, (JSON.parse(JSON.stringify(saveObj.invisibleLayer[0][i]))));
        }
        for (let i = 0; i < this.outputLayerSize; i++) {
            this.outputLayer[i].setWeights(this.invisibleLayerSize, (JSON.parse(JSON.stringify(saveObj.outputLayer[i]))));
        }
    }

    // Установление входных значений в структуру
    setInput(inputValues) {
        for (let i = 0; i < this.inputLayerSize; i++) {
            this.inputLayer[i].output = inputValues[i];
        }
    }

    // Получение выходных значений нейронов на всех слоях (кроме входного)
    getOutput() {
        for (let i = 0; i < this.invisibleLayerSize; i++) {
            this.invisibleLayer[i].getOutputValue(this.inputLayer);
        }
        for (let i = 0; i < this.outputLayerSize; i++) {
            this.outputLayer[i].getOutputValue(this.invisibleLayer)
        }
    }

    // Преобразование выходных значений через Softmax функцию в [0; 1]
    processOutputSoftmax() {
        let total = 0;
        let maximum = -Infinity;
        this.outputLayer.forEach(function (neuron) {
            maximum = Math.max(maximum, neuron.output);
        })
        this.outputLayer.forEach(function (neuron) {
            total += Math.exp(neuron.output - maximum);
        })
        this.outputLayer.forEach(function (neuron) {
            neuron.output = Math.exp(neuron.output - maximum) / total;
        })
    }

    // Вычисление значения потерь функцией кросс-энтропии
    getErrorCrossEntropy(expectedAnswer) {
        let error = 0;
        error -= Math.log(this.outputLayer[expectedAnswer].output);
        return error;
    }

    // Получение списка ошибок
    getErrorList(expectedAnswer) {
        let idealDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let actualDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        idealDistribution[expectedAnswer] = 1;

        for (let i = 0; i < 10; i++) {
            actualDistribution[i] = this.outputLayer[i].output;
        }
        for (let i = 0; i < 10; i++) {
            actualDistribution[i] -= idealDistribution[i];
        }

        return actualDistribution;
    }

    // Определение максимального значения вероятности как результата работы нейросети
    defineNetworkAnswer() {
        let answer = 0;
        let answerValue = 0;
        for (let i = 0; i < 10; i++) {
            if (this.outputLayer[i].output > answerValue) {
                answerValue = this.outputLayer[i].output;
                answer = i;
            }
        }
        return answer;
    }

    // Обнуление ошибок во всех слоях
    resetErrors() {
        for (let i = 0; i < this.invisibleLayerSize; i++) {
            this.invisibleLayer[i].error = 0;
        }
        for (let i = 0; i < this.outputLayerSize; i++) {
            this.outputLayer[i].error = 0;
        }
    }

    // Значение функции производной для текущего нейрона
    getT1(currentNeuron) {
        return currentNeuron.error * NeuralNetwork.getDerivativeReLU(currentNeuron.total);
    }

    // Шаг градиентного спуска
    correctWeight(currentNeuron, predecessorNeuronNumber) {
        let t1 = this.getT1(currentNeuron);
        let newWeight = currentNeuron.weights[predecessorNeuronNumber] - t1 * this.learningRate * currentNeuron.input[predecessorNeuronNumber];
        return newWeight;
    }

    // Обучение нейросети
    train(expectedAnswer) {
        this.resetErrors();
        this.processOutputSoftmax();
        let loss = this.getErrorCrossEntropy(expectedAnswer);

        let errorList = this.getErrorList(expectedAnswer);
        for (let i = 0; i < 10; i++) {
            this.outputLayer[i].error = errorList[i];
        }

        // Корректировка весов, корректировка ошибки, обновление весов
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < this.invisibleLayerSize; j++) {
                let newWeight = this.correctWeight(this.outputLayer[i], j);
                this.invisibleLayer[j].error += this.outputLayer[i].weights[j] * this.getT1(this.outputLayer[i]);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        for (let i = 0; i < this.invisibleLayerSize; i++) {
            for (let j = 0; j < this.inputLayerSize; j++) {
                let newWeight = this.correctWeight(this.invisibleLayer[i], j);
                this.invisibleLayer[i].weights[j] = newWeight;
            }
        }

        return loss;
    }
}