class Helper {
    static generateRandomWeight() {
        return Math.random() / 10;
    }

    static generateRandomWeights(layerSize) {
        let generatedWeights = [];
        for (let i = 0; i < layerSize; i++) {
            generatedWeights.push(this.generateRandomWeight());
        }
        return generatedWeights;
    }
}