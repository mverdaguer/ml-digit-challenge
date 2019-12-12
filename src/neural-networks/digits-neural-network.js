import * as tf from "@tensorflow/tfjs";
import { MnistData } from "./digits-helper.js";

const IMAGE_SIDE = 28;

function createConvModel() {
  const model = tf.sequential();

  model.add(
    tf.layers.conv2d({
      inputShape: [IMAGE_SIDE, IMAGE_SIDE, 1],
      kernelSize: 3,
      filters: 16,
      activation: "relu"
    })
  );

  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
  model.add(
    tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
  model.add(
    tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
  );

  model.add(tf.layers.flatten({}));
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  model.compile({
    optimizer: "rmsprop",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

export default class DigitsNeuralNetwork {
  constructor() {
    this.data = new MnistData();
    this.model = createConvModel();
    this.data.load();
  }

  async save() {
    await this.model.save("downloads://digits-model");
  }

  async load(onIteration) {
    this.model = await tf.loadLayersModel(
      "http://localhost:5000/digits-model.json"
    );
  }

  async train(plotLoss, plotAccuracy) {
    const batchSize = 320;
    const validationSplit = 0.15; // 15% of data -> validation to monitor overfitting.
    const trainEpochs = 3;
    let trainBatchCount = 0;

    const trainData = this.data.getTrainData();
    const testData = this.data.getTestData();

    const totalNumBatches =
      Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
      trainEpochs;

    let valAcc;
    await this.model.fit(trainData.xs, trainData.labels, {
      batchSize,
      validationSplit,
      epochs: trainEpochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          trainBatchCount++;
          console.log(
            `Training... (` +
              `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
              ` complete). To stop training, refresh or close page.`
          );
          plotLoss(trainBatchCount, logs.loss);
          plotAccuracy(trainBatchCount, logs.acc);
          // if (onIteration && batch % 10 === 0) {
          //   onIteration("onBatchEnd", batch, logs);
          // }
          await tf.nextFrame();
        },
        onEpochEnd: async (epoch, logs) => {
          valAcc = logs.val_acc;
          plotLoss(trainBatchCount, logs.val_loss);
          plotAccuracy(trainBatchCount, logs.val_acc);
          // if (onIteration) {
          //   onIteration("onEpochEnd", epoch, logs);
          // }
          await tf.nextFrame();
        }
      }
    });

    const testResult = this.model.evaluate(testData.xs, testData.labels);
    const testAccPercent = testResult[1].dataSync()[0] * 100;
    const finalValAccPercent = valAcc * 100;
    console.log(
      `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
        `Final test accuracy: ${testAccPercent.toFixed(1)}%`
    );
  }

  predict(value) {
    const t = tf.tensor1d(value);
    const reshaped = t.reshape([1, IMAGE_SIDE, IMAGE_SIDE, 1]);
    const preds = this.model.predict(reshaped).argMax([-1]);

    reshaped.dispose();
    return preds.dataSync();
  }
}
