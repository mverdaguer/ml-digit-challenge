<script>
  import { Router, Link, Route } from "svelte-routing";
  import Temperature from "./routes/Temperature.svelte";
  import Digit from "./routes/Digit.svelte";
  import Home from "./routes/Home.svelte";

  export let url = "";
</script>

<Router url="{url}">
  <nav>
    <Link to="/">Home</Link>
    <Link to="temperature">Temperature</Link>
    <Link to="digit">Digit</Link>
  </nav>
  <div>
    <Route path="temperature" component="{Temperature}" />
    <Route path="digit" component="{Digit}" />
    <Route path="/"><Home /></Route>
  </div>
</Router>