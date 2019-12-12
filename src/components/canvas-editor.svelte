<script>
  import { createEventDispatcher, onMount } from "svelte";

  let canvas;
  let miniCanvas;
  let ctx;
  let miniCtx;
  let isMouseDown = false;
  let currX = 0;
  let currY = 0;
  const dispatch = createEventDispatcher();

  const canvasSide = 140;
  const miniCanvasSide = 28;

  function draw() {
    ctx.beginPath();
    ctx.arc(currX, currY, 10, 0, 2 * Math.PI);
    ctx.fill();
  }

  function mousemove(e) {
    if (isMouseDown) {
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      draw();
    }
  }

  function mousedown(e) {
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;
    isMouseDown = true;
  }

  function mouseup(e) {
    isMouseDown = false;
  }

  function mouseout(e) {
    isMouseDown = false;
  }

  onMount(async () => {
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    miniCtx = miniCanvas.getContext("2d");
  });

  function clear() {
    ctx.clearRect(0, 0, canvasSide, canvasSide);
    miniCtx.clearRect(0, 0, miniCanvasSide, miniCanvasSide);
    dispatch("clear");
  }

  function predictValue() {
    miniCtx.drawImage(canvas, 0, 0, miniCanvasSide, miniCanvasSide);
    const { data } = miniCtx.getImageData(0, 0, miniCanvasSide, miniCanvasSide);

    const result = [];
    for (let i = 0; i < data.length; i += 4) {
      result.push(data[i + 3] / 256);
    }

    dispatch("test", result);
  }
</script>

<style>
  canvas {
    border: 2px solid black;
  }
</style>

<div>
  <canvas
    bind:this={canvas}
    on:mousemove={mousemove}
    on:mousedown={mousedown}
    on:mouseup={mouseup}
    on:mouseout={mouseout}
    width={canvasSide}
    height={canvasSide} />

  <canvas
    bind:this={miniCanvas}
    width={miniCanvasSide}
    height={miniCanvasSide} />
</div>
<div>
  <button on:click={predictValue}>test</button>
  <button on:click={clear}>clear</button>
</div>
