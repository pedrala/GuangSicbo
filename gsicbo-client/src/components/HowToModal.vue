<template>
  <div class="howto-layout" @touchmove="preventScroll" >
    <div class="howto-wrap-outside" @click="closeModal"></div>
    <div class="howto-wrap">
      <div class="howto-header">
        <div class="howto-header-text">{{$t('sicbo.info.howtoplay')}}</div>
        <img src="/img/ic-modal-close.svg" alt="" class="howto-close-btn" @click="closeModal">
      </div>
      <div class="howto-content-box" >
        <div class="howto-card-wrap">
          <img v-for="n in 20" :key="n" :src="`/img/sicbo/card/${cardNo(n-1)}.svg`" class="howto-cards">
        </div>
        <div class="howto-text">
          {{$t('howto.general.line1')}}
          <br>{{$t('howto.general.line2')}}
          <br>{{$t('howto.general.line3')}}
        </div>
        <div class="howto-header-text-yellow"> {{$t('howto.list.title')}}</div>
        <table>
          <tr>
            <td>{{$t('howto.list.sb')}}</td>
            <td>{{$t('howto.list.oe')}}</td>
            <td>光</td>
          </tr>
          <tr>
            <td>{{$t('howto.list.pair')}}</td>
            <td>{{$t('howto.list.specific')}}</td>
            <td class="letterspacing">1,2,3,4,5,<br>6,7,8,9,10</td>
          </tr>
        </table>

        <div class="howto-header-text-yellow">{{$t('howto.smallbig.title')}}</div>
        <div src="" alt="" class="howto-img-smallbig"></div>
        <div class="howto-text">
          {{$t('howto.smallbig.line1')}}
          <br>{{$t('howto.smallbig.line2')}}
          <br>{{$t('howto.smallbig.line3')}}
          <br>{{$t('howto.smallbig.line4')}}
        </div>
        <div class="howto-header-text-yellow">{{$t('howto.oddeven.title')}}</div>
        <div class="howto-img-evenodd"></div>
        <div class="howto-text-medium">
          {{$t('howto.oddeven.line1')}}
          <br>{{$t('howto.oddeven.line2')}}
          <br>{{$t('howto.oddeven.line3')}}
        </div>
        <div class="howto-header-text-yellow">{{$t('howto.guang.title')}}</div>
        <div class="howto-img-guang"></div>
        <div class="howto-text-short">
          {{$t('howto.guang.line')}}
        </div>
        <div class="howto-header-text-yellow">{{$t('howto.pair.title')}}</div>
        <div class="howto-text-short">
          {{$t('howto.pair.line')}}
        </div>
        <div class="howto-header-text-yellow">{{$t('howto.specific.title')}}</div>
        <div class="howto-text-short">
          {{$t('howto.specific.line')}}
        </div>
        <div class="howto-header-text-yellow">1,2,3,4,5,6,7,8,9,10</div>
        <div class="howto-text-short">
          {{$t('howto.number')}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    //
    //  전 카드 주소 양식 최적화
    //
    cardNo(n) {
      return n<10 ? '0'+n : n;
    },
    //
    // 모달창 닫기  
    //
    closeModal() {
      localStorage.setItem('isNewComer', true);
      this.$emit('close-howto');
    },
    //
    // 모달창 배경화면 스크롤 저지  
    //
    preventScroll(event) {
      event.stopPropagation();
    }
  },
  created() {
      document.body.style.overflow = 'hidden';
  }
}
</script>

<style lang="scss" scoped>

@import "../scss/flex.scss";
@import "../scss/fonts.scss";

.howto-layout {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.howto-wrap {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 284px;
  width: 50%;
  height: 490px;
  box-sizing: border-box;
  background: #2F1412;
  border: 1px solid #6A4744;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 8px;
  color: white;
  z-index: 9999;

  @media (min-width: 1024px) {
    width: 560px;
    height: 664px;
    top: 20%;
  }
}

.howto-header {
  @extend .flex;
  height: 40px;
  width: 100%;
  padding-left: 8px;
  line-height: 40px;
  font-size: 20px;
}

.howto-close-btn {
  margin-left: auto;
  cursor: pointer;
}

.howto-content-box {
  background: #431C19;
  border: 1px solid #6A4744;
  box-sizing: border-box;
  width:100%;
  height: 432px;
  overflow-y: scroll;
   -ms-overflow-style: none; // IE에서 스크롤바 감춤

  &::-webkit-scrollbar {
    display: none !important; // 윈도우 크롬 등
  }

  @media (min-width: 1024px) {
    height: 606px;
  }
  
}

.howto-card-wrap {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.howto-cards {
  display: inline-block;
  width: 36px;
  height: 56px;
  margin: 4px;
  
  @media (min-width: 1024px) {
    width: 44px;
    height: 68px;
    margin: 5px;
     &:nth-child(2n-1) {
      order: 1;
    }
    &:nth-child(2n) {
      order: 2;
    }
  }
 
}

.howto-header-text-yellow {
  font-size: 14px;
  color: #FFF389;
  margin-left: 8px;
  margin-bottom: 4px;
  @media (min-width: 1024px) {
    font-size: 20px;
  }
}

.howto-img-list {
  background-image: url('/img/how-to/list-mobile.jpg');
  background-size: cover;
  width: 252px;
  height: 74px;
  margin-left: 8px;
  margin-bottom: 16px;
  @media (min-width: 1024px) {
    background-image: url('/img/how-to/list.jpg');
    width: 418px;
    height: 90px;
  }
}

.howto-img {
  width: 208px;
  height: 114px;
  margin-right: auto;
  margin-left: 8px;
  @media (min-width: 1024px) {
    width: 400px;
    height: 164px;
  }
}

.howto-img-smallbig {
  @extend .howto-img;
  background-image: url('/img/how-to/smallbig-mobile.jpg');
  @media (min-width: 1024px) {
    background-image: url('/img/how-to/smallbig-pc.jpg');
  }
}

.howto-img-evenodd {
  @extend .howto-img;
  background-image: url('/img/how-to/oddeven-mobile.jpg');
  @media (min-width: 1024px) {
    background-image: url('/img/how-to/oddeven-pc.jpg');
  }
}

.howto-img-guang {
  background-image: url('/img/how-to/guang.jpg');
  background-size: cover;
  width: 208px;
  height: 86px;
  @media (min-width: 1024px) {
    width: 400px;
    height: 159px;
  }
}

.howto-text {
  font-size: 12px;
  font-weight: 300;
  padding: 0 8px;
  margin-top: 8px;
  height: 120px;
  margin-bottom: 30px;
  @media (min-width: 1024px) {
    font-size: 16px;
    letter-spacing: 0.01em;
  }
}

.howto-text-medium {
  @extend .howto-text;
  height: 94px;
}

.howto-text-short {
  @extend .howto-text;
  height: 50px;
}

.howto-wrap-outside {
  position: absolute;
  z-index: 9999;
  width: 100%;
  height: 100%;
}

table {
  width: 252px;
  height: 74px;
  border: 1px solid white;
  border-collapse: collapse;
  font-size: 12px;
  text-align: center;
  margin-left: 6px;
  margin-bottom: 16px;
  @media (min-width: 1024px) {
    width: 418px;
    height: 90px;
  }
}

td {
  width: 82px;
  height: 32px;
  border: 1px solid white;
}

.letterspacing {
  letter-spacing: 0.15em;
}
</style>