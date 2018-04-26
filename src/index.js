import DefultVideo from './video.vue'
export default DefultVideo
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('defult-video', DefultVideo);
}
