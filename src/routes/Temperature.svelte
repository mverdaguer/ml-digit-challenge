<script>
  import * as tfvis from "@tensorflow/tfjs-vis";
  import TemperatureNeuralNetwork from "../neural-networks/temperature-neural-network";

  let lossChart;
  let training = false;
  let trained = false;
  
  const nn = new TemperatureNeuralNetwork();

  async function train() {
    training = true;        
    const result = await nn.train();

    const lossList = result.history.loss.map((loss, i) => {
      return { x: i, y: loss };
    });

    tfvis.render.linechart(
      lossChart,
      { values: [lossList], series: ["loss"] },
      {
        width: 420,
        height: 300,
        xLabel: "epoch",
        yLabel: "loss"
      }
    );
    training = false;
    trained = true;
  }

  let inputNumber;
  let outputNumber;
  $: if (inputNumber) {
    const r = nn.predict(inputNumber);
    outputNumber = r.dataSync()[0];
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

<h1>Machine learning - ºC -> ºF</h1>
<button on:click={train}>TRAIN</button>
<section>
  {#if training}
    <p>Training...</p>
    <img src="https://media.giphy.com/media/XzutKuTTlIEeI/giphy.gif" alt="training">
  {/if}
  <div bind:this={lossChart} class:hidden={training || !trained} />
</section>

{#if trained && !training}
  <section>
    <h2>Test</h2>
    <label for="input-number">Predict</label>
    <input id="input-number" type="number" bind:value={inputNumber}/>

    <label for="output-number">Prediction</label>
    <input id="output-number" type="number" bind:value={outputNumber} disabled/>
  </section>
{/if}
