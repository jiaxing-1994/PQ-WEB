<template>
  <Contain id="information">
    <iframe src="https://www.jin10.com/example/jin10.com.html?fontSize=14px&theme=white"></iframe>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";

  export default {
    name: "information",
    components: {Contain},
    mounted() {
    }
  }
</script>

<style lang="scss" scoped>
  #information {
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
</style>
