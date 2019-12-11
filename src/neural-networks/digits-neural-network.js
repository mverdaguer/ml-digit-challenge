import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { MnistData } from "./digits-helper.js";

const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const IMAGE_CHANNELS = 1;
const NUM_OUTPUT_CLASSES = 10;
const BATCH_SIZE = 512;
const TRAIN_DATA_SIZE = 5500; // 55000
const TEST_DATA_SIZE = 1000; // 10000
const classNames = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine"
];

function createAndCompileModel() {
  const model = tf.sequential();

  model.add(
    tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: "relu",
      kernelInitializer: "varianceScaling"
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  model.add(
    tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: "relu",
      kernelInitializer: "varianceScaling"
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));
  model.add(tf.layers.flatten());

  model.add(
    tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: "varianceScaling",
      activation: "softmax"
    })
  );

  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

export default class DigitsNeuralNetwork {
  constructor() {
    this.data = new MnistData();
    this.model = createAndCompileModel();
    this.data.load();
    //await this.showExamples();
  }

  async save() {
    await this.model.save('downloads://digits-model');
  }

  async load() {
    this.model = await tf.loadLayersModel('http://localhost:5000/digits-model.json');
  }

  async train() {
    const metrics = ["loss", "val_loss", "acc", "val_acc"];
    const container = {
      name: "Model Training",
      styles: { height: "1000px" }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const [trainXs, trainYs] = tf.tidy(() => {
      const d = this.data.nextTrainBatch(TRAIN_DATA_SIZE);
      return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels];
    });

    const [testXs, testYs] = tf.tidy(() => {
      const d = this.data.nextTestBatch(TEST_DATA_SIZE);
      return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels];
    });

    return this.model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: 10,
      shuffle: true,
      callbacks: fitCallbacks
    });
  }

  async showExamples() {
    // Create a container in the visor
    const surface = tfvis
      .visor()
      .surface({ name: "Input Data Examples", tab: "Input Data" });

    // Get the examples
    const examples = this.data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      const canvas = document.createElement("canvas");
      canvas.width = 28;
      canvas.height = 28;
      canvas.style = "margin: 4px;";
      await tf.browser.toPixels(imageTensor, canvas);
      surface.drawArea.appendChild(canvas);

      imageTensor.dispose();
    }
  }

  doPrediction(testDataSize = 500) {
    const testData = this.data.nextTestBatch(testDataSize);
    const testxs = testData.xs.reshape([
      testDataSize,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      1
    ]);

    const labels = testData.labels.argMax([-1]);
    console.log(testxs);
    const preds = this.model.predict(testxs).argMax([-1]);

    testxs.dispose();
    return [preds, labels];
  }

  async showAccuracy() {
    const [preds, labels] = this.doPrediction();
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = { name: "Accuracy", tab: "Evaluation" };
    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    labels.dispose();
  }

  async showConfusion() {
    const [preds, labels] = this.doPrediction();
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    const container = { name: "Confusion Matrix", tab: "Evaluation" };
    tfvis.render.confusionMatrix(
      container,
      { values: confusionMatrix },
      classNames
    );

    labels.dispose();
  }

  predict(value) {
    const t = tf.tensor1d(value);
    const reshaped = t.reshape([1, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);

    //const labels = t.labels.argMax([-1]);
    console.log('reshaped', reshaped);
    const preds = this.model.predict(reshaped).argMax([-1]);

    reshaped.dispose();
    return preds.dataSync();
  }
}
