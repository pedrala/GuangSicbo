<template>
  <div class="lang-select-dropdown" >
    <div class="layout-lang-selector" @click="toggleLanguageDropdown">
      <img :src="langFlag()" /> 
      <span class="lang-name">
        {{language()}}
      </span> 
      <img src="/img/ic-combobox.svg" class="ic-combobox" />
    </div>
    <transition name="slide">
      <div class="lang-dropdown-content" v-if="langShow" @click="toggleLanguageDropdown">
        <div class="lang-select-row" @click="langChange('en')">
          <img src="/img/lang-flag/UK.svg" class="lang-select-row-img">English
        </div>
        <div class="lang-select-row" @click="langChange('zh')">
          <img src="/img/lang-flag/China.svg" class="lang-select-row-img">中国话
        </div>
        <div class="lang-select-row" @click="langChange('tr')">
          <img src="/img/lang-flag/Turkey.svg" class="lang-select-row-img">Türkçe
        </div>
        <div class="lang-select-row" @click="langChange('ko')">
          <img src="/img/lang-flag/Korea.svg" class="lang-select-row-img">한국어
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      langShow: false,
    }
  },
  props: {
    isLangChanged: {
      type: Boolean,
      default: false
    }
  },
  computed: {
      
  },
  created() {
    this.$eventBus.$on('close-dropdonw', (except) => {
      if (except !== 'appbar-lang') {
        this.langShow = false;
      }
    });
  },
  methods: {
    //
    // 언어 변환에 따른 국기 최신화 
    //
     langFlag() {
      const isLangChanged = this.isLangChanged;
      const curToken = localStorage.getItem('GuangGame.Language') || 'en';
      switch (curToken || isLangChanged) {
        case 'en':
          return '/img/lang-flag/UK.svg';
        case 'tr':
          return '/img/lang-flag/Turkey.svg';
        case 'zh':
          return '/img/lang-flag/China.svg';
        case 'ko':
          return '/img/lang-flag/Korea.svg';
        default :
          return '/img/lang-flag/UK.svg';
      }
    },
    //
    // 언어 변환에 따른 텍스트 최신화  
    //
    language() {
      const curToken = localStorage.getItem('GuangGame.Language') || 'en';
      const isLangChanged = this.isLangChanged;
      switch (curToken||isLangChanged) {
        case 'en':
          return 'English';
          case 'tr':
            return 'Türkçe';
          case 'zh':
            return '中国话';
          case 'ko':
            return '한국어';
          default :
            return 'English'
        }
    },
    //
    //  상위컴포넌트로 언어변환 이벤트 전달
    //
    langChange(langToChange) {
      this.$emit('lang-change', langToChange);
    },
    toggleLanguageDropdown($event) {
      this.langShow = !this.langShow;
      this.$eventBus.$emit('close-dropdonw','appbar-lang');
      $event.stopPropagation();
    },
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/flex.scss";
@import "../scss/fonts.scss";
@import "../scss/variable.scss";
  

.lang-select-dropdown {
  @extend .flex;
  @extend .flex-center;
  height: 32px;
  position: relative;
  margin: auto 16px auto 0;

  @media (min-width: 984px) {
    margin: auto 40px auto 0;
  }
}

.layout-lang-selector {
  @extend .flex;
  justify-content: flex-end;
  @extend .text-normal;
  color: #FFD8A1;
  margin: auto 0;
  width: 100px;
  height: 24px;
  cursor: pointer;
}

.lang-name {
  width: 64px;
  text-align: center;
  line-height: 24px;
  font-weight: 200
}

.ic-combobox {
  margin-left: 4px;
}

.lang-dropdown-content {
  position: absolute;
  right: 0;
  top: 100%;
  background: #563008;
  border: 1px solid #9E896A;
  height: 160px;
  width: 100px;
  box-sizing: border-box;
}

.lang-select-row {
  @extend .text-btn-small;
  @extend .flex;
  font-weight: 400;
  height: 40px;
  color: #FFD8A1;
  border-bottom: 1px solid #9E896A;
  line-height: 40px;
  box-sizing: border-box;
  cursor: pointer;

  &:nth-last-child(1) {
    border-bottom: none;
  }

  &:hover {
    background: #FFD8A1;
    color: #563008;
  }
}

.lang-select-row-img {
  width: 16px;
  height: 12px;
  margin: 14px 8px 14px 12px;
}

.slide-enter-active {
  transition: all .3s ease;
}

.slide-leave-active {
  transition: all .3s;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>