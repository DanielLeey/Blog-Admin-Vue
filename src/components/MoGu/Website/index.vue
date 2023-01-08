<template>
  <div>
    <svg-icon class="websiteSvg" icon-class="website" style="height: 2.5em;font-size: 18px;cursor: pointer" @click.native="goto" />
  </div>
</template>

<script>
export default {
  name: 'MoGuGit',
  data() {
    return {
      url: process.env.BLOG_WEB_URL
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
<style scoped>

</style>
