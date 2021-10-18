import Velocity from 'velocity-animate'
import utils from './utils'

const overflowScroll = {
  install (Vue, options) {
    Vue.directive('overflow-scroll', {
      componentUpdated: scroll,
      updated: scroll
    })
  }
}

const scroll = (el, binding, vnode) => {
  if (!binding.expression) return
  let opt = utils.getOptions(vnode.data.attrs)
  let toElement = utils.getScrollElement(opt, vnode)
  let clientHight = vnode.elm.clientHeight
  let scrollHeight = vnode.elm.scrollHeight
  if (scrollHeight > clientHight && toElement) {
    Velocity(toElement, 'scroll', { container: el })
  }
}

export default overflowScroll

if (typeof window !== 'undefined' && window.Vue) window.Vue.use(overflowScroll)