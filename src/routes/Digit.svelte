<script>
  import * as tfvis from "@tensorflow/tfjs-vis";
  import DigitsNeuralNetwork from "../neural-networks/digits-neural-network";
  import CanvasEditor from "../components/canvas-editor.svelte";

  let accuracyChart;
  let lastAcc;
  let lossChart;
  let lastLoss;
  let training = false;
  let trained = false;

  const nn = new DigitsNeuralNetwork();

  function loadModel() {
    nn.load();
    trained = true;
  }

  const lossValues = [];
  function plotLoss(batch, loss) {
    lossValues.push({ x: batch, y: loss });
    tfvis.render.linechart(
      lossChart,
      { values: lossValues, series: ["train"] },
      {
        xLabel: "Batch #",
        yLabel: "Loss",
        width: 400,
        height: 300
      }
    );
    lastLoss = loss.toFixed(3);
  }

  const accuracyValues = [];
  function plotAccuracy(batch, accuracy) {
    accuracyValues.push({ x: batch, y: accuracy });
    tfvis.render.linechart(
      accuracyChart,
      { values: accuracyValues, series: ["train"] },
      {
        xLabel: "Batch #",
        yLabel: "Accuracy",
        width: 400,
        height: 300
      }
    );
    lastAcc = accuracy.toFixed(3);
  }

  async function train() {
    training = true;
    const result = await nn.train(plotLoss, plotAccuracy);
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
    <p>Training...</p>
    <img
      src="https://media.giphy.com/media/XzutKuTTlIEeI/giphy.gif"
      alt="training" />
  {/if}
  {#if (training || trained) && lastLoss && lastAcc }
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
