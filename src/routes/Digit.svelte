<script>
  import { onMount } from "svelte";
  import * as tfvis from "@tensorflow/tfjs-vis";
  import DigitsNeuralNetwork from "../neural-networks/digits-neural-network";
  import CanvasEditor from "../components/canvas-editor.svelte";

  let lossChart;
  let training = false;
  let trained = false;

  const nn = new DigitsNeuralNetwork();

  async function train() {
    // training = true;
    // const result = await nn.train();

    // await nn.showAccuracy();
    // await nn.showConfusion();

    // nn.doPrediction(1);

    // const lossList = result.history.loss.map((loss, i) => {
    //   return { x: i, y: loss };
    // });

    // tfvis.render.linechart(
    //   lossChart,
    //   { values: [lossList], series: ["loss"] },
    //   {
    //     width: 420,
    //     height: 300,
    //     xLabel: "epoch",
    //     yLabel: "loss"
    //   }
    // );
    nn.load();
    training = false;
    trained = true;
  }

  let inputNumber;
  let outputNumber;
  $: if (inputNumber) {
    const r = nn.predict(inputNumber);
    outputNumber = r.dataSync()[0];
  }

  function test(value) {
    console.log('test', value.detail);
    const r = nn.doPrediction(1);
    console.log('dododo', r, r[0].dataSync(), r[1].dataSync());
    const result = nn.predict(value.detail);
    console.log(result);
  }
</script>

<style>
  :global(.answer-correct) {
    color: green;
  }

  :global(.answer-wrong) {
    color: red;
  }

  .hidden {
    display: none;
  }
</style>

<h1>Machine learning - Digit recognition</h1>
<button on:click={train}>TRAIN</button>
<section>
  {#if training}
    <p>Training...</p>
    <img
      src="https://media.giphy.com/media/XzutKuTTlIEeI/giphy.gif"
      alt="training" />
  {/if}
  <div bind:this={lossChart} class:hidden={training || !trained} />
</section>

{#if trained && !training}
  <section>
    <h2>Test</h2>
    <CanvasEditor on:test={test}/>
  </section>
{/if}
