import * as tf from "@tensorflow/tfjs";

const celsius = tf.tensor1d([-40, -10, 0, 8, 15, 22, 38], "float32");
const fahrenheit = tf.tensor1d([-40, 14, 32, 46, 59, 72, 100], "float32");

function createAndCompileModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 1,
      inputShape: [1]
    })
  );

  model.compile({
    loss: "meanSquaredError",
    optimizer: tf.train.adam(0.1),
    metrics: ["accuracy"]
  });
  return model;
}

export default class TemperatureNeuralNetwork {
  constructor() {
    this.model = createAndCompileModel();
  }

  async train() {
    return await this.model.fit(celsius, fahrenheit, {
      epochs: 500
    });
  }

  predict(value) {
    return this.model.predict(tf.tensor1d([value]));
  }
}
