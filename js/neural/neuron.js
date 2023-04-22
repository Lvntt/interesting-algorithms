class Neuron {
    weightsCount = 0;
    weights = [];
    input = [];
    output = 0;
    error = 0;
    total = 0;

    setWeights(weightsCount, weights) {
        this.weightsCount = weightsCount;
        for (let i = 0; i < weightsCount; i++) {
            this.weights.push(weights[i]);
            this.input.push(0);
        }
    }

    getOutputValue(previousLayer) {
        let total = 0;
        for (let i = 0; i < this.weightsCount; i++) {
            this.input[i] = previousLayer[i].output;
            total += this.weights[i] * previousLayer[i].output;
        }
        this.total = total;
        this.output = NeuralNetwork.ReLU(this.total);
    }
}