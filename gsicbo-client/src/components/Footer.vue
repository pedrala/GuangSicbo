<template>
  <div id="layout" ref="layout" :class="{sicboFooter:this.$route.name === 'sicbo'}" >
    <div id="content-wrap">
      <img src="/img/logo.svg" alt="logo" class="logo-img" @click="routeTo('/')">
      <div class="contact-social-wrap">
        <div class="contact-wrap">
          <span class="contact-title">{{$t('footer.contact')}}&nbsp;&nbsp;</span>
          <span class="contact-text">funguanggame@gmail.com</span>
        </div>
        <div class="social-wrap">
          <a href="https://medium.com/@funguanggame" target="_blank" class="social-url"><img
              src="/img/drawer/social-medium.svg" class="social-icon"></a>
          <a href="http://t.me/guangsicbo_official/" target="_blank" class="social-url"><img
              src="/img/drawer/social-telegram.svg" class="social-icon"></a>
          <a href="https://twitter.com/guanggame" target="_blank" class="social-url"><img
              src="/img/drawer/social-twitter.svg" class="social-icon"></a>
        </div>
      </div>
      <div class="body-text">
        {{$t('footer.description')}}
        <div class="ver-text">v 1.0</div>
      </div>
      <div class="copyright-text">© 2019 By Guang Game. All Rights Reserved</div>
    </div>
  </div>
</template>

<script>
import {mapMutations} from 'vuex'
export default {
  methods: {
    ...mapMutations([
      'setDrawerState',
      'setDrawerMode'
    ]),
    //
    // programmatic routing  
    //
    routeTo(path) {
       if (this.$refs.layout.clientWidth > 1284) {
          this.setDrawerState('open');
          this.setDrawerMode('static');
      }
      this.$router.push(path);
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/fonts.scss';
@import '../scss/flex.scss';

#layout {
  position: block;
  height: 374px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  color: #A9A9A9;
  @media (min-width: 984px) {
    position: block;
    height: 248px;
  }
}

#content-wrap {

  margin: 0 24px;

  @media (min-width: 1284px) {
    margin: 0;
    padding: 0 82px;
  }
}

.logo-img {
  width: 128px;
  height: 28px;
  margin: 16px 0;
  cursor: pointer;

  @media (min-width: 984px) {
    width: 136px;
    height: 30px;
  }
}

.text {
  @extend .text-small;
  line-height: 14px;

  @media (min-width: 984px) {
    font-size: 14px !important;
    line-height: 16px;
  }
}

.contact-social-wrap {
  @media (min-width: 984px) {
    display: flex;
    justify-content: space-between;
    line-height: 30px;
    margin-bottom: 16px;
  }
}

.contact-title {
  @extend .text;
  font-weight: 700;
}

.contact-text {
  @extend .text;
  font-weight: 400 !important;
}

.social-wrap {
  @extend .flex;
  @extend .flex-center;
  width: 100%;
  height: 110px;

  @media (min-width: 984px) {
    height: 30px;
    width: fit-content;
  }
}

.social-url,
.social-icon {
  width: 30px;
  height: 30px;
  margin: auto 10px;
}

.body-text {
  @extend .text;
  position: relative;
  font-weight: 100 !important;
  height: 124px;
  line-height: 16px;
  text-align: justify;

  @media (min-width: 984px) {
    height: 92px;
    line-height: 22px;
  }
}

.ver-text {
  position: absolute;
  bottom: 0;
  right: 0;
}

.copyright-text {
  @extend .text;
  width: 100%;
  height: 64px;
  text-align: center;
  line-height: 64px;
  font-weight: 400;

  @media (min-width: 984px) {
    height: 48px;
    line-height: 48px;
  }
}

.sicboFooter {
  background: linear-gradient(180deg, #563008 0%, #2C1106 100%) !important;
  color: #FFD8A1 !important;
}



</style>