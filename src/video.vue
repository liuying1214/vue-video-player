<template>
  <div class="container">
    <div class="evo-video-container" transition="fade" @mouseenter="mouseEnterVideo" @mouseleave="mouseLeaveVideo">
      <video class="evo-video" :poster="options.poster">
        <source v-for="source in sources" :src="source.src" :type="source.type"/>
      </video>
      <div class="evo-content_loading spinner circles " v-show="video.loading">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="evo-contrl-content" v-show="state.contrlShow" translate="fade" >
        <button class="evo-contrl-play-btn" @click="play()">
          <i v-show="state.playing" class="icon iconfont" v-cloak >&#xe629;</i>
          <i v-show="!state.playing" class="icon iconfont">&#xe625;</i>
        </button>
        <div class="evo-contrl-video-slider" @click="slideClick($event)" @mousemove="videoMove"
             @mouseover="video.tipShow=true" @mouseout="video.tipShow=false" @mousedown="videoDown">
          <div class="evo-contrl-video-inner"
               :style="{ 'transform': `translate3d(${video.pos.current}px, 0, 0)`}">
          </div>

          <div class="evo-contrl-video-rail">
            <div class="evo-contrl-video_progress" :style="{'width':video.pos.proWidth+'px'}"></div>
            <div class="evo-contrl-video-rail-inner"
                 :style="{ 'width': video.loaded+'%'}"></div>
          </div>
          <div class="evo-contrl-video-tiptime" v-cloak v-show="video.tipShow"
               :style="{ 'left': video.pos.left+'px'}">
            <div class="evo-contrl-video-tip"></div>
            <p v-cloak>{{video.tipTime}}</p>
          </div>
        </div>
        <div class="evo-contrl-video-time">
          <span class="evo-contrl-video-time-text" v-cloak>{{video.displayTime}}</span>
        </div>
        <button class="evo-contrl-play-btn" @click="fullScreen">
          <i class="icon iconfont">&#xe624;</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  const getMousePosition = function (e, type = 'x') {
    if (type === 'x') {
      return e.pageX
    }
    return e.pageY
  }
  const pad = (val) => {
    val = Math.floor(val)
    if (val < 10) {
      return '0' + val
    }
    return val + ''
  }
  const timeParse = (sec) => {
    let min = 0
    min = Math.floor(sec / 60)
    sec = sec - min * 60
    return pad(min) + ':' + pad(sec)
  }
  export default {
    props: {
      sources: Array,
      options: {
        type: Object,
        default () {
          return {
            autoplay: false,
            poster: ''
          }
        }
      }
    },
    data(){
     return{
       $video: null,
       $videoSlider: null,
       $videoTipTime: null,
       video: {
         $videoSlider: null,
         len: 0,
         current: 0,
         loaded: 0,
         tipShow: false,
         tipTime: '',
         moving: false,
         loading: false,
         displayTime: '00:00',
         pos: {
           start: 0,
           width: 0,
           innerWidth: 0,
           current: 0,
           proWidth: 0,
           left: 0
         }
       },
       player: {
         $player: null,
         pos: null
       },
       tmp: {
         contrlHideTimer: null
       },
       state: {
         contrlShow: true,
         vol: 0.5,
         currentTime: 0,
         fullScreen: false,
         playing: false
       }
     }
    },
    created(){
//            this.init()
    },
    ready () {
//            this.init()
    },
    mounted(){
      this.init()
    },
    destoryed(){
      this.$video = null;
      this.video.src = null;
    },
    methods: {
      init(){
        this.$video = this.$el.getElementsByTagName('video')[0];

        if (this.options.autoplay) {
          this.play()
        }
        this.initCore();
      },

      initCore(){
        this.initVideo()
        this.initPlayer()
      },
      initVideo(){
        const $videoSlider = this.$el.getElementsByClassName('evo-contrl-video-slider')[0]
        const $videoInner = this.$el.getElementsByClassName('evo-contrl-video-inner')[0];
        this.$videoTipTime = this.$el.getElementsByClassName('evo-contrl-video-tiptime')[0];
        this.$videoSlider = $videoSlider;
        this.video.pos.start = $videoSlider.getBoundingClientRect().left;
        this.video.pos.innerWidth = $videoInner.getBoundingClientRect().width;
        this.video.pos.TipTimeWidth = this.$videoTipTime.getBoundingClientRect().width;
        this.video.pos.left = -(this.video.pos.TipTimeWidth / 2) + this.video.pos.innerWidth / 2;
        // 当没有padding  和 border时  getBoundingClientRect().width(padding+boeder+width)就是width
        // 求__cov-contrl-video-rail 剩下的 的宽度
        this.video.pos.width = $videoSlider.getBoundingClientRect().width - this.video.pos.innerWidth;
        this.getTime()
      },
      play(){
        this.state.playing = !this.state.playing;
        if (this.$video) {
          if (this.state.playing) {
            this.$video.play()
            this.$video.addEventListener('timeupdate', this.timeline)
            this.$video.addEventListener('ended', () => {
              this.state.playing = false
              this.video.pos.current = 0
              this.video.pos.proWidth = 0
              this.$video.currentTime = 0
            })
          } else {
            this.$video.pause()
          }
        }
        this.video.len = this.$video.duration;
      },
      timeline () {
        const percent = this.$video.currentTime / this.$video.duration
        this.video.pos.current = (this.video.pos.width * percent).toFixed(3);
        this.video.pos.proWidth = (this.video.pos.width * percent).toFixed(3);
        this.video.displayTime = timeParse(this.$video.duration - this.$video.currentTime);
        if (this.$video.readyState <= 2) {
          this.video.loading = true
        } else {
          this.video.loading = false
        }

      },
      getTime(){
        this.$video.addEventListener('durationchange', () => {
          this.video.len = this.$video.duration;
        })
        this.$video.addEventListener('progress', () => {
          if (this.$video.buffered.length != 0) {
            this.video.loaded = (this.$video.seekable.end(0) / this.$video.duration) * 100

          }
        })
      },
      initPlayer(){
      },
      slideClick(e){
        this.videoSlideMove(e)
      },
      fullScreen(){
        if (!this.state.fullScreen) {
          this.state.fullScreen = true
          this.$video.webkitRequestFullscreen()
        } else {
          this.state.fullScreen = false
          this.$video.webkitCancelFullScreen()
        }
      },
      videoMove(e){
        const x = getMousePosition(e) - this.video.pos.start - (this.video.pos.innerWidth / 2);
        if (x > 0 && x < this.video.pos.width) {
          // 移动白点的位置
          this.video.pos.TipTimeWidth = this.$videoTipTime.getBoundingClientRect().width;
          this.video.pos.left = x - this.video.pos.TipTimeWidth / 2 + (this.video.pos.innerWidth / 2);
          this.video.tipTime = timeParse(x / this.video.pos.width * this.$video.duration);
          // 修改视频的当前播放进度
        }
      },
      videoDown(e){
        this.videoSlideMove(e)
      },
      videoSlideMove (e) {
        const x = getMousePosition(e) - this.video.pos.start - (this.video.pos.innerWidth / 2)
        if (x > 0 && x < this.video.pos.width) {
          // 移动白点的位置
          this.video.pos.current = x;
          this.video.pos.proWidth = x;
          this.video.tipTime = this.video.pos.current;
          this.video.pos.left = x - this.video.pos.TipTimeWidth / 2 + (this.video.pos.innerWidth / 2);
          this.video.tipTime = timeParse(x / this.video.pos.width * this.$video.duration);
          // 修改视频的当前播放进度
          this.setVideoByTime(x / this.video.pos.width)
        }

      },
      setVideoByTime (percent) {
        this.$video.currentTime = Math.floor(percent * this.$video.duration)
      },
      mouseEnterVideo () {
        if (this.tmp.contrlHideTimer) {
          clearTimeout(this.tmp.contrlHideTimer)
          this.tmp.contrlHideTimer = null
        }
        this.state.contrlShow = true
      },
      mouseLeaveVideo (e) {
        if (this.tmp.contrlHideTimer) {
          clearTimeout(this.tmp.contrlHideTimer)
        }
        this.tmp.contrlHideTimer = setTimeout(() => {
          this.state.contrlShow = false
          this.tmp.contrlHideTimer = null
        }, 2000)
      },
    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import './video.css';
</style>
