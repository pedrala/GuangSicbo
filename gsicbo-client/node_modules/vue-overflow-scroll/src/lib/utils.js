import _ from 'lodash'

/**
 * get the scroll options
 * @param {Object} data 
 */
function getOptions (data) {
  let options = {}
  if (_.has(data, 'scroll-to') && _.isString(data['scroll-to'])) options['scroll-to'] = data['scroll-to']
  if (_.has(data, 'scroll-to-id') && _.isString(data['scroll-to-id'])) options['scroll-to-id'] = data['scroll-to-id']
  if (_.has(data, 'scroll-to-class') && _.isString(data['scroll-to-class'])) options['scroll-to-class'] = data['scroll-to-class']
  return options
}

function getScrollElement (options, vnode) {
  if (options['scroll-to']) {
    if (options['scroll-to'] === 'last-child') return vnode.elm.lastChild
    else if (options['scroll-to'] === 'first-child') return vnode.elm.firstChild
    else {
      let childNumber = parseInt(options['scroll-to'])
      if (_.isNumber(childNumber)) return vnode.elm.children[(childNumber - 1)]
    }
  }
  if (options['scroll-to-id']) return document.getElementById(options['scroll-to-id'])
  if (options['scroll-to-class']) {
    let elements = document.getElementsByClassName(options['scroll-to-class'])
    if (elements.length === 1) return elements[0]
    console.error('get more then one element by class name')
    return null
  }
  return null
}

export default {
  getOptions,
  getScrollElement
}