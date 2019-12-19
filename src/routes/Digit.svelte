<script>
  import * as tfvis from "@tensorflow/tfjs-vis";
  import DigitsNeuralNetwork from "../neural-networks/digits-neural-network";
  import CanvasEditor from "../components/canvas-editor.svelte";

  let accuracyChart;
  let lastAcc;
  const accuracyValues = [];
  let lossChart;
  const lossValues = [];
  let lastLoss;
  let training = false;
  let trained = false;
  let trainingRate = 0;

  const nn = new DigitsNeuralNetwork();

  function loadModel() {
    nn.load();
    trained = true;
  }

  function plot(batch, loss, values, chart, yLabel) {
    values.push({ x: batch, y: loss });
    if (chart) {
      tfvis.render.linechart(
        chart,
        { values: values, series: ["train"] },
        {
          xLabel: "Batch #",
          yLabel,
          width: 400,
          height: 300
        }
      );
    }
    return loss.toFixed(3);
  }

  function plotLoss(batch, loss) {
    lastLoss = plot(batch, loss, lossValues, lossChart, "Loss");
  }

  function plotAccuracy(batch, accuracy) {
    lastAcc = plot(batch, accuracy, accuracyValues, accuracyChart, "Accuracy");
  }

  function setTraining(tRate) {
    trainingRate = tRate;
  }

  async function train() {
    training = true;
    const result = await nn.train(plotLoss, plotAccuracy, setTraining);
    training = false;
    trained = true;
  }

  let inputNumber;
  let predictedValue;

  function predictValue(value) {
    predictedValue = nn.predict(value.detail);
  }

  function clearResult() {
    predictedValue = undefined;
  }
</script>

<style>
  :global(.answer-correct) {
    color: green;
  }

  :global(.answer-wrong) {
    color: red;
  }

  .graphs {
    display: flex;
  }
</style>

<h1>Machine learning - Digit recognition</h1>
<button on:click={train}>Train</button>
<button on:click={loadModel}>Load model</button>
<section>
  {#if training}
    <p>Training: {trainingRate}%</p>
    <img
      src="https://media.giphy.com/media/XzutKuTTlIEeI/giphy.gif"
      alt="training" />
  {/if}
  {#if (training || trained) && lastLoss && lastAcc}
    <div class="graphs">
      <div>
        <label>last loss: {lastLoss}</label>
        <div bind:this={lossChart} />
      </div>
      <div>
        <label>last acc: {lastAcc}</label>
        <div bind:this={accuracyChart} />
      </div>
    </div>
  {/if}
</section>

{#if trained && !training}
  <section>
    <h2>Test</h2>
    <CanvasEditor on:test={predictValue} on:clear={clearResult} />
    {#if predictedValue !== undefined}
      <p>Result: {predictedValue}</p>
    {/if}
  </section>
{/if}
