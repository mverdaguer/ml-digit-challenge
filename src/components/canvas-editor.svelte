<script>
  import { createEventDispatcher, onMount } from "svelte";

  let canvas;
  let miniCanvas;
  let ctx;
  let miniCtx;
  let isMouseDown = false;
  let prevX = 0;
  let currX = 0;
  let prevY = 0;
  let currY = 0;
  let isDrawing = false;
  const dispatch = createEventDispatcher();

  const canvasSide = 140;
  const miniCanvasSide = 28;

  function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
  }

  function mousemove(e) {
    if (isMouseDown) {
      prevX = currX;
      prevY = currY;
      currX = e.clientX - canvas.offsetLeft;
      currY = e.clientY - canvas.offsetTop;
      draw();
    }
  }

  function mousedown(e) {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    isMouseDown = true;
    isDrawing = true;
    if (isDrawing) {
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
      isDrawing = false;
    }
  }

  function mouseup(e) {
    isMouseDown = false;
  }

  function mouseout(e) {
    isMouseDown = false;
  }

  onMount(async () => {
    ctx = canvas.getContext("2d");
    miniCtx = miniCanvas.getContext("2d");
  });

  function clear() {
    ctx.clearRect(0, 0, canvasSide, canvasSide);
    miniCtx.clearRect(0, 0, miniCanvasSide, miniCanvasSide);
  }

  function test() {
    miniCtx.drawImage(canvas, 0, 0, miniCanvasSide, miniCanvasSide);
    const { data } = miniCtx.getImageData(0, 0, miniCanvasSide, miniCanvasSide);

    const result = [];
    for (let i = 0; i < data.length; i += 4) {
      result.push(data[i + 3]);
    }

    dispatch('test', result);
  }
</script>

<style>
  canvas {
    border: 2px solid black;
  }
</style>

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

<button on:click={test}>test</button>
<button on:click={clear}>clear</button>
