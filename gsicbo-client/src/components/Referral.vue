<template>
  <div class="modal-mask" @touchmove ="preventScroll">
    <transition  name="fade">
      <div v-if ="showToast" class="toast-copied" >
        <div class="close-btn-wrap">
          <img src="/img/toast/close.svg" alt="" class="toast-close-btn" @click="showToast = false">
        </div>
        <img src="/img/toast/copied.png"  class="copied-img">
        <div class="copied-text">{{$t('referral.copied')}} </div>
      </div>
    </transition >
    <div class="content-outside" @click="closeModal()"></div>
    <div class="content-wrap">
      <div class="content-box">
        <div class="header">
          <div class="title">{{$t('referral.referral')}}</div>
          <img src="/img/referral/close-btn.svg" alt="" class="btn-close" @click="closeModal()">
        </div>
        <hr>
        <div class="inner-box">
          <div class="link-title">{{$t('referral.link')}}</div>
          <div class="link-wrap">
            <input type="text" class="link-input" :value="referralUrl" ref="urlbox">
            <div class="link-copy-btn" @click="copyRef">{{$t('referral.copy')}}</div>
          </div>
          <div class="faq-description">
            {{$t('referral.info1')}} <span class="stress">0.15%</span> {{$t('referral.info2')}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { setTimeout } from 'timers';

  export default {
    data() {
      return {
        showToast: false
      } 
    },
    methods: {
      //
      // 모달창 닫기
      //
      closeModal() {
        this.$emit('close-referral')
      },
      //
      // Referral 주소 복사
      //
      copyRef() {
        const urlbox = this.$refs.urlbox;
        urlbox.select();
        urlbox.setSelectionRange(0, 1000);
        document.execCommand("copy"); 
        this.showToast = true;
        urlbox.setSelectionRange(0, 0);
        setTimeout(()=> this.showToast = false, 1000)
      },
      //
      // 모달창 밖 배경화면 스크롤 금지
      //
      preventScroll(event) {
        event.stopPropagation();
      }
    },
    computed: {
      ...mapState({
          referralUrl(state) {
            return `http://guang.game/?ref=${state.common.account.name || ''} `
          }
      }),
      
    }
  }
</script>

<style lang="scss" scoped>
@import '../scss/flex.scss';
@import '../scss/fonts.scss';

.modal-mask {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 5000;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .5);
  color: white;
  // transition: opacity .4s ease-out;
}

.content-outside {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 5100;
}

.content-wrap {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5200;
  top: 15%;
  @media (min-width: 984px) {
    top: 150px;
  }
}

.content-box {
  position: relative;
  min-width: 280px;
  height: 436px;
  // width: 60%;
  border: 1px solid #2A3D6C;
  box-sizing: border-box;
  border-radius: 8px;
  background: #1C2A4A;
  padding: 0 8px;

  @media (min-width: 984px) {
    width: 564px;
    height: 344px;
  }
}

.header {
  @extend .flex;
  min-width: 264px;
  width: 100%;
  height: 56px;
  justify-content: space-between;
}

hr {
  border: 0.5px solid #2A3D6C;
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  left: 0;
  top: 48px;
}

.title {
  @extend .text-title;
  font-weight: 400;
  width: 88px;
  line-height: 64px;
  text-align: center;

  @media (min-width: 984px) {
    font-size: 18px;
  }
}

.btn-close {
  color: #C0C0C0;
  width: 16px;
  height: 16px;
  margin: 24px 12px 0 0;
  cursor: pointer;
}

.inner-box {
  background: #111A30;
  min-width: 262px;
  height: 362px;
  margin: 8px auto;
  padding: 16px 20px;
  box-sizing: border-box;

  @media (min-width: 984px) {
    margin: 12px 4px;
    padding: 16px 32px 28px;
    height: 262px;
    width: 540px;
  }
}


.link-title {
  @extend .text-normal;
  font-weight: 400;
  height: 32px;
  line-height: 32px;
}

.link-wrap {
  @extend .flex;
  @extend .text-normal;
  justify-content: center;
  height: 52px;
  border-bottom: 1px solid #2A3D6C;

  @media (min-width: 984px) {
    height: 60px;
  }
}

.link-input {
  @extend .text-normal;
  min-width: 142px;
  width: 60%;
  height: 32px;

  background: #111A30;
  border: 1px solid #2A3D6C;
  box-sizing: border-box;
  box-shadow: inset 4px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin-right: 6px;
  color: white;
  padding-left: 8px;
  padding-right: 15px;

  @media (min-width: 984px) {
    width: 380px;
    margin-right: 20px;
  }
}

.link-copy-btn {
  @extend .text-normal;
  font-weight: 400;
  width: 76px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: linear-gradient(180deg, #DA241C 0%, #5B110D 100%);
  border-radius: 15px;
  cursor: pointer;

  &:hover {
    color: #FFFF58;
  }
}

// .faq-title {
//   @extend .text-normal;
//   font-weight: 400;
//   height: 40px;
//   line-height: 60px;
//   color: #FFD8A1;
//   @media (min-width: 984px) {
//     height:20px;
//     line-height: 20px;
//     margin-top: 28px;
//   }
// }

.faq-description {
  @extend .text-normal;
  font-weight: 400;
  min-width: 224px;
  margin-top: 36px;
  line-height: 18px;
  text-align: left;
}

.stress {
  color: #FFD8A1;
}

.toast-copied {
  position: absolute;
  width: 324px;
  height: 184px;
  background: white;
  color: black;
  top: 18%;
  left: 50%;
  margin-left: -162px;
  z-index: 9999;
}

.fade-enter-active, .fade-leave-active {
  transition: all .5s 
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-50%)
}

.close-btn-wrap {
  width: 40px;
  height: 40px;
  margin-left: auto;
}

.toast-close-btn {
  width: 16px;
  height: 16px;
  margin: 12px;
  color: #4E4E4E;
  cursor: pointer;
}

.copied-img {
  width: 88px;
  height: 84px;
  margin: 0 113px;
}

.copied-text {
  @extend .text-normal;
  font-weight: 600;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

</style>