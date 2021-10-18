<template>
  <div id="home">
    <div class="layout-content">
      <div class="header">
        <div class="sicbo-wrap" @click="routeTo('/sicbo')">
          <img src="/img/sicbo2.png" class="sicbo-img" >
          <img class="sicbo-img-pc" src="/img/sicbo2.png" >
          <span class="sicbo-text">{{ $t('home.aboutGuangSicbo') }}</span>
        </div>
        <agile :autoplay="true" :autoplaySpeed="9000" :speed="1800" :navButtons="false" :dots="true" :infinite="true" :pauseOnHover="true">
          <img class="slide" src="/img/carousel/4.jpg" />
          <img class="slide" src="/img/carousel/1.png" />
          <img class="slide" src="/img/carousel/2.png"  @click="onClickCarousel('/sicbo')" @mousedown="onMouseDown($event, 2)" @mouseup="onMouseUp($event, 2)" @mousemove="onMouseMove($event, 2)" />
          <img class="slide" src="/img/carousel/3.png"  @click="onClickCarousel('/store')" @mousedown="onMouseDown($event, 3)" @mouseup="onMouseUp($event, 3)"  @mousemove="onMouseMove($event, 3)" />

        </agile>
      </div>
      <div class="notice-bar-wrap">
        <div class="notice-bar">
          <img src="/img/ic-notice.svg" alt="" class="notice-bar-img">
          <marquee>
            <span class="notice-bar-text">{{ $t('home.announcement')}}</span>
          </marquee>
        </div>
      </div>
      <div class="winner-wrap">
        <div class="content-wrap">
          <span class="winner-title">{{$t('home.winningPrize.title')}}</span>
          <div class="content-bg">
            <img src="/img/winning.png" alt="" class="content-img">
            <span class="content-text">{{$t('home.winningPrize.description')}}</span>
          </div>
        </div>
        <div class="content-wrap">
          <span class="winner-title">{{$t('home.dividend.title')}}</span>
          <div class="content-bg">
            <img src="/img/dividend.png" alt="" class="content-img">
            <span class="content-text">{{$t('home.dividend.description')}}</span>
          </div>
        </div>
        <div class="partner-wrap">
          <span class="winner-title">{{$t('home.partners')}}</span>
          <div class="logo-wrap">
            <img src="/img/logo_moonpay.svg" class="partner-logo" alt="">
            <img src="/img/logo_sistemkoin.svg" class="partner-logo" alt="">
          </div>
        </div>
      </div>
      <div class="leaderboard">
        <div class="leaderboard-title">{{$t('home.leaderboard.title')}}<span class="title-bracket">(TAZ Chip)</span></div>
        <div class="leaderboard-header">
          <div class="leaderboard-header-rank">{{$t('home.leaderboard.rank')}}</div>
          <div class="leaderboard-header-player">{{$t('home.leaderboard.player')}}</div>
          <div class="leaderboard-header-points" @click="fetchBoardData('bet', userId)">
            {{$t('home.leaderboard.wagerPoints')}}
            <img src="/img/sort-btn.svg" class="sort-btn">
          </div>
          <div class="leaderboard-header-prize" @click="fetchBoardData('prize', userId)">
            {{$t('home.leaderboard.prize')}}
            <img src="/img/sort-btn.svg" class="sort-btn" />
          </div>
        </div>

        <div class="leaderboard-list-container">
          <div class="leaderboard-row" v-for="(ranker, index) in rankers" :key="ranker.account">
            <div class="leaderboard-row-rank">
              <img class="rank-img" :src="medalImgSrc(index)">
              <div class="rank-text"
                :class="{ textgold: index === 0, textsilver: index === 1, textcopper: index === 2}">
                {{ index + 1 }}
              </div>
            </div>
            <div class="leaderboard-row-player">{{ ranker.account }}</div>
            <div class="leaderboard-row-points">{{ decorate(ranker.daily_bets) }}</div>
            <div class="leaderboard-row-prize">{{ decorate(ranker.daily_prizes) }}</div>
          </div>
        </div>
        <div class="leaderboard-row-mine-wrap">
          <div class="leaderboard-row-mine">
            <div class="leaderboard-row-rank">
              <img src="/img/leaderboard-medal-1000k.svg" class="rank-img-mine" v-if="isOver1000(myRank.account, isBet)">
              <template v-else>
                <img :src="medalImgSrc(myRank.account[`${isBet}_rank`]-1)" class="rank-img" >
                <div class="rank-text"
                  :class="{ textgold:  myRank.account[`${isBet}_rank`] === 1, textsilver: myRank.account[`${isBet}_rank`] === 2, textcopper: myRank.account[`${isBet}_rank`] === 3}">
                  {{ myRank.account[`${isBet}_rank`]}}
                </div>
              </template>
            </div>
            <div class="leaderboard-row-player">{{ myRank.account.account }}</div>
            <div class="leaderboard-row-points">{{ decorate(myRank.account.bet_amount)}}</div>
            <div class="leaderboard-row-prize">{{ decorate(myRank.account.prize_amount) }}</div>
            <div class="leaderboard-row-mine-border"></div>
          </div>
        </div>
        <div class="leaderboard-footer">
          &nbsp;&nbsp;* {{$t('home.leaderboard.notice')}}
        </div>
      </div>
    </div>
    <g-footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import {mapState} from 'vuex';
import { setTimeout } from 'timers';

export default {
  name: 'home',
  data() {
    return {
      rankers: [{account: '-', daily_bets: '-', daily_prizes: '-'}],
      myRank: { 
        account: { account: '-', bet: '-', prize: '-'},
                   bet: ['-'],
                   prize: ['-']
              },
      isBet: 'bet',
      carouselEvent: {
        down: -1,
        start: 0,
        end: 0,
        preventClick: false
      }
    }
  },
  computed: {
    ...mapState({
      userId(state) {
        return state.common.account.name || '-'
      }
    })
  },
  mounted() {
    this.fetchBoardData('bet', this.userId);
  },
  watch: {
    userId: function (val) {
      this.fetchBoardData('bet', val)
    },
  },
  methods: {
    //
    // leader board 데이터 fetch
    //
    fetchBoardData(standard, userId) {
      if( userId !== undefined ) {
        fetch(`${this.$REST_API_SERVER}/api/v1/leaderboard?account=${userId}`)
        .then( response => response.json() )
        .then( data => {
          this.myRank = data
          this.isBet = standard
        })
        .catch( err => console.error(err) );
      }
      fetch(`${this.$REST_API_SERVER}/api/v1/leaderboard`)
        .then( response => response.json() )
        .then( data => this.rankers = data[standard] )
        .catch( err => console.error(err) );
    },
    //
    // programatic routing 
    //
    routeTo(path) {
      this.$router.push(path)
    },
    //
    // 랭크에 따라 메달 금은동외 이미지 표시
    //
    medalImgSrc(rank) {
        if(rank === 0) 
          return '/img/leaderboard-medal-gold.svg'
        else if (rank === 1)
          return '/img/leaderboard-medal-silver.svg'
        else if (rank === 2)
          return '/img/leaderboard-medal-copper.svg'
        else
          return '/img/leaderboard-medal-others.svg'
    },
    //
    // 토큰 값 양식
    //
    decorate(number=0) {
      const regexp = /\B(?=(\d{3})+(?!\d))/g;
      return number.toString().replace(regexp, ',');
    },
    //
    // 순위가 1000위 이상인지 확인
    //
    isOver1000(data, isBet) {
      if(data[`${isBet}_rank`] === 1000 || data[`${isBet}_rank`] === 0)
        return true;
      else
        return false;
    },

    /**
     * 캐러셀 드래그중 클릭을 방지하기 위한 코드
     */
    onMouseDown($event, val) {
      this.carouselEvent.down = val;
      this.carouselEvent.start = $event.clientX;
    },
    /**
     * 캐러셀 드래그중 클릭을 방지하기 위한 코드
     */
    onMouseUp($event, val) {
      if (this.carouselEvent.down !== val) {
        this.carouselEvent.down = -1;
        this.carouselEvent.start = 0;
        this.carouselEvent.preventClick = false;
      } else {
        if (Math.abs(this.carouselEvent.start - $event.clientX) > 50) {
          this.carouselEvent.preventClick = true;
          setTimeout(() => this.carouselEvent.preventClick = false, 500);
        }
      }
    },
    /**
     * 캐러셀 드래그중 클릭을 방지하기 위한 코드
     */
    onMouseMove($event, val) {
      if (this.carouselEvent.down !== val) {
        this.carouselEvent.down = -1;
        this.carouselEvent.start = 0;
      } else {
        if (Math.abs(this.carouselEvent.start - $event.clientX) > 50) {
          this.carouselEvent.preventClick = true;
          setTimeout(() => this.carouselEvent.preventClick = false, 500);
        }
      }
    },
    /**
     * 캐러셀 이미지 클릭을 처기하는 함수
     */
    onClickCarousel(uri) {
      if (!this.carouselEvent.preventClick) {
        this.routeTo(uri);
      }
    }
  },
   components: {
    'g-footer': Footer,
  },
} 
</script>

<style lang="scss">
.agile {
  min-width: 312px;
  width: 100%;
  min-height: 160px;
  order: 0;
  margin-bottom: 56px;
  border-radius: 30px;
  @media (min-width: 984px) {
    width: 376px;
    height: 192px;
    order: 1;
    margin-bottom: 0;
  }
}

.slide {
  display: block;
  -o-object-fit: cover;
  object-fit: cover;
  border-radius: 20px;
	width: 100%;
  min-width: 312px;
  min-height: 160px;

  cursor: pointer;
  @media (min-width: 984px) {
    width: 376px;
    height: 192px;
  }
}

.agile__dots {
  bottom: -10px;
  left: 50%;
  position: absolute;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.agile__dot {
  margin: 0 10px;
}

.agile__dot button {
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  display: block;
  height: 10px;
  font-size: 0;
  line-height: 0;
  margin: 0;
  padding: 0;
  transition-duration: 0.3s;
  width: 10px;
}

.agile__dot--current button, .agile__dot:hover button {
  background-color: #fff;
}
</style>

<style lang="scss" scoped>
@import '../scss/flex.scss';
@import "../scss/fonts.scss";
@import "../scss/variable.scss";

#home {
  @extend .flex-wfill;
  @extend .flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  margin: 0px;
  padding: 0px;
  width: 100%;
  min-height: 1140px;
  height: 100%;
  color: white;
  background-image: url('/img/mobile-background.svg');
  background-repeat: repeat;
  background-position: center;
  background-size: 40%;
  @media (min-width: 984px) {
    background-image: url('/img/background-red.jpg');
    background-size: cover;
  }
}

.layout-content {
  @extend .flex;
  flex-direction: column;
  align-items: start;
  width: 60%;
  min-width: 312px;
  padding: 28px 0;
  margin-left: auto;
  margin-right: auto;
  @media (min-width: 984px) {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 40px 0;
    width: 936px;
  }
}

.line-break {
    display:block;
  @media (min-width: 984px) {
    display:inline-block;
  }  
}

.header {
  @extend .flex;
  order: 1;
  width: 100%;
  flex-direction: column;
  @media (min-width: 984px) {
    justify-content: space-between;
    flex-direction: row;
  }
}

.sicbo-wrap {
  @extend .flex;
  @extend .flex-middle;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  min-height: 160px;
  order:1;
  margin-bottom: 56px;
  @media (min-width: 984px) {
    flex-direction: row;
    justify-content: start;
    width: 348px;
    height: 192px;
    order:0;
  }
}

.sicbo-img {
  width: 100%;
  min-width: 312px;
  min-height: 160px;
  margin-bottom: 20px;
  border-radius: 15px;
  cursor: pointer;
  @media (min-width: 984px) {
    display: none;
  }
}

.sicbo-img-pc {
  display: none;
  @media (min-width: 984px) {
    cursor: pointer;
    width: 375.53px;
    height: 192px;
    display: block;
  }
}

.sicbo-text {
  @extend .text-normal;
  text-align: center;
  line-height: 20px;
  font-weight: 400;
  color: #FFFFFF;
  @media (min-width: 984px) {
    text-align: left;
    width: 450px;
    height: 60px;
    padding: 20px 0
  }
}

.winner-wrap {
  order: 4;
  @media (min-width: 984px) {
    width:536px;
    order: 3;
    margin-right: 24px;
    margin-top: -70px;
  }
}

.winner-title {
  @extend .text-title-big;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  width: 100%;
  height: 28px;
  margin-bottom: 28px;
  text-align: center;
  @media (min-width: 984px) {
    height: 56px;
    text-align: left;
    margin-bottom: 0;
    line-height: 56px;
  }
}

.content-wrap {
  @extend .flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 112px;
  @media (min-width: 984px) {
    margin-top: 28px;
    margin-bottom: 0;
  }
}

.content-bg {
  background: rgba(0,0,0,0);
  @extend .flex-middle;
  height: 296px;
  @media (min-width: 984px) {
    display: flex !important;
    height: 124px;
  }
}

.content-text {
  @extend .text-normal;
  display: block;
  height: 120px;
  color: #FFFFFF;
  text-align: center;
  padding: 20px 0;
  display:block;
  font-weight: 400;
  @media (min-width: 984px) {
    display: inline;
    text-align: left;
    height: 80px;
    padding-left: 16px;
  }
}

.content-img {
  display: block;
  margin: 0 auto;
  min-width: 208px;
  height: 176px;
  border-radius: 15px;
  @media (min-width: 984px) {
    min-width: 144px;
    height: 124px;
  }
}

.partner-wrap {
  width: 100%;
  margin-bottom: 84px;
  @media (min-width: 984px) {
    margin: 28px 0 0 0;
  }
}

.partner-logo {
  width: 30%;
  min-width: 124px;
  min-height: 36px;
  margin: 12px 0 28px 0;
  @media (min-width: 984px) {
    margin: 0;
    width: 124px;
    height: 36px;
  }
}

.logo-wrap {
  @extend .flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 984px) {
    justify-content: space-around;
    height: 70px;
    flex-direction: row;
  }
}

.notice-bar-wrap {
  @extend .flex;
  @extend .flex-end;
  order: 0;
  width: 100%;
  margin-bottom: 20px;
  @media (min-width: 984px) {
    order: 2;
    margin: 28px 0;
    justify-content: flex-end !important;
  }
}

.notice-bar {
  @extend .flex;
  @extend .flex-middle;
  box-sizing: border-box;
  width: 100%;
  background: #240709;
  height: 30px;
  border: 1px solid rgba(0,0,0,0);
  box-shadow: 0 0 0 1px #FFD8A1 inset;
  @media (min-width: 984px) {
    width:376px;
  }
}

.notice-bar-img {
  width: 20px;
  height: 20px;
  margin: 5px 9px;
}

.notice-bar-text {
  @extend .text-normal;
  color: #EBA375;
  font-weight: 400;
} 

.leaderboard {
  @extend .flex;
  @extend .flex-column;
  order: 3;
  width: 100%;
  margin-bottom: 56px;
  @media (min-width: 984px) {
    width: 376px;
    margin-bottom: 128px;
  }
}
.leaderboard-title {
  @extend .flex;
  @extend .flex-center;
  @extend .flex-middle;
  @extend .text-title-big;
  color: #FFFFFF;
  background: #240709;
  height: 44px;
  border-radius: 8px 8px 0 0;
}

.title-bracket {
  font-size: 12px;
  font-weight: 400;
  line-height: 38px;
  margin-left: 6px;
  align-self: flex-end;
}

.leaderboard-header {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between;
  color: white;
  height: 36px;
  background: #240709;
  box-shadow: inset 4px 6px 20px rgba(255, 255, 255, 0.25)
}


.leaderboard-header-text {
  text-align: center;
  @extend .text-small;
  font-weight: normal;
}

.leaderboard-rank-width {
  width: 36px;
} 

.leaderboard-player-width {
  min-width: 120px;
  width: 38%;
  @media (min-width: 984px) {
    width: 136px;
  }
}

.leaderboard-points-width {
  min-width: 78px;
  width: 24%;
  @media (min-width: 984px) {
    width: 102px;
  }
}

.leaderboard-prize-width {
  min-width: 78px;
  width: 20%;
  @media (min-width: 984px) {
    width: 96px;
  }
}

.leaderboard-header-rank {
  @extend .leaderboard-header-text;
  @extend .leaderboard-rank-width;
}

.leaderboard-header-player {
  @extend .leaderboard-header-text;
  @extend .leaderboard-player-width;
}

.leaderboard-header-points {
  position: relative;
  @extend .leaderboard-header-text;
  @extend .leaderboard-points-width;
}

.leaderboard-header-prize {
  position: relative;
  @extend .leaderboard-header-text;
  @extend .leaderboard-prize-width;
}

.sort-btn {
  position: absolute;
  right: 3px;
  top: 5px;
  cursor: pointer;
}

.leaderboard-list-container {
  overflow-y: scroll;
  overflow-x: hidden;
  height:320px;
  background: #240709;
  color: white;

    &::-webkit-scrollbar-track
    {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
    }

    &::-webkit-scrollbar
    {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb
    {
      border-radius: 10px;
      box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background: #483031;
    }
}

.leaderboard-row {
  @extend .flex;
  @extend .flex-middle;
  justify-content: space-between;
  height: 32px;
}

.leaderboard-row-text {
  @extend .text-small;
  text-align: center;
  font-weight: normal;
}

.leaderboard-row-rank {
  @extend .leaderboard-row;
  @extend .leaderboard-row-text;
  @extend .leaderboard-rank-width; 
  margin: 0;
  display: flex;
  position: relative;
}

.rank-img {
  margin: auto 6px;
}

.rank-img-mine {
  margin-left: -2px;
}

.rank-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color:white;
  font-weight: 500;
}

.textgold {
  color: #977F00;
}

.textsilver {
  color: #7B7B7B;
}

.textcopper {
  color: #714819;
}

.leaderboard-row-player {
  @extend .leaderboard-row-text;
  @extend .leaderboard-player-width; 
}
.leaderboard-row-points {
  @extend .leaderboard-row-text;
  @extend .leaderboard-points-width;
}

.leaderboard-row-prize {
  @extend .leaderboard-row-text;
  @extend .leaderboard-prize-width;
}

.leaderboard-row-mine-wrap {
  height: 48px;
  background: #240709;
}

.leaderboard-row-mine {
  @extend .leaderboard-row;
  @extend .flex;
  justify-content: space-between;
  margin: 8px 0;
  border: 1px solid rgba(0,0,0,0);
  border-radius: 6px;
  box-shadow: 0 0 0 1px #FFD8A1 inset;
}
.leaderboard-footer {
  @extend .text-small;
  @extend .flex;
  @extend .flex-middle;
  height: 40px;
  font-weight: 400;
  background: #240709;
  height: 40px;
  border-radius: 0px 0px 15px 15px;
}
</style>