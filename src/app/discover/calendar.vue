<template>
  <Contain id="calendar">
    <iframe src="https://rili-d.jin10.com/open.php?fontSize=14px&theme=primary"></iframe>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";

  export default {
    name: "calendar",
    components: {Contain}
  }
</script>

<style lang="scss" scoped>
  #calendar {
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
</style>
