# vue-overflow-scroll

Scroll automatically when the element is overflow.

support `vue 2.0`

live [demo](https://jsfiddle.net/JefferyLiang/jcg9e5rx/)

## Installation

### NPM(recommended)

`npm install vue-overflow-scroll -D`

<br>

## Get Started

```js
// ES6
import Vue from 'vue'
import VueOverflowScroll from 'vue-overflow-scroll'

Vue.use(VueOverflowScroll)
```

Directive v-overflow-scroll then can be used in your Component.

```html
<template>
  <div v-overflow-scroll="true" scroll-to="last-child">
    ...
  </div>
<template>
...
```

then when the div can scroll-y,then it can scroll to last child.

the `scroll-to` can scroll to other child like this option: `scroll-to="first-child"`、`scroll-to="4"`

---

if you want to scroll to the child dom by id, you can use `scroll-to-id="child-dom-id"`

```html
<template>
  <div v-overflow-scroll="true" scroll-to-id="child-dom-id">
    ...
  </div>
</template>
```

---

if you wan to scroll to the child dom by class name, you can use `scroll-to-class="child-dom-class-name"`

```html
<template>
  <div v-overflow-scroll="true" scroll-to-class="child-dom-class">
    ...
  </div>
</template>
```