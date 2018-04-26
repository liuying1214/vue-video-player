# vue-default-player
## [Try the demo](https://liuying1214.github.io/vue-video-player/demo)

### How to use?
```bash
npm install vue-default-player --save
```

### Example

```vue
<template>
  <defult-video :sources="sources" :options="options"></defult-video>
</template>

<script>
 import DefaultVideo from 'vue-default-player';
  export default {
    components: { 'defult-video':DefaultVideo },
    data () {
      return {
        sources: [{
          src: 'http://ai-1253836259.cosbj.myqcloud.com/video/%5Cu0074%5Cu0065%5Cu0073%5Cu0074.mp4',
          type: 'video/mp4',
        }],
        options: {
          autoplay: false,  
          poster: 'http://hivjc2hsms3z25iuuh1.exp.bcevod.com/mda-idgm2brxj5akq04w/mda-idgm2brxj5akq04w.jpg'
        },
      }
    }
  }
</script>
```