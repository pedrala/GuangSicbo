(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-0bca115a"],{"8f12":function(e,t,a){"use strict";a.r(t);var i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"layout"},[a("div",{staticClass:"content-wrap"},[a("div",{staticClass:"title"},[e._v(e._s(e.$t("vip.vip")))]),a("div",{staticClass:"user-info-wrap"},[a("div",{staticClass:"user-medal-wrap"},[a("img",{staticClass:"user-medal-img",attrs:{src:e.vipMedal,alt:""}})]),a("div",{staticClass:"levelup-guide"},[e._v("\n        "+e._s(e.$t("vip.levelup1"))+"\n        "),a("div",{staticClass:"stress"},[e._v(e._s(e.formatedNumber(e.nextLevelTazChip))+" TAZ Chip")]),e._v("\n        "+e._s(e.$t("vip.levelup3"))+"\n      ")]),a("div",{staticClass:"levelup-gauge"},[a("img",{staticClass:"gauge-medal-img",attrs:{src:e.vipMedal,alt:""}}),a("div",{staticClass:"gauge-bar-wrap"},[a("div",{staticClass:"gauge-bar-bg"}),a("div",{staticClass:"gauge-bar-fg",style:"width:"+e.nextLevel+"%"}),a("div",{staticClass:"gauge-bar-text"},[e._v(e._s(e.nextLevel.toFixed(1))+"%")])]),a("img",{staticClass:"gauge-medal-img",attrs:{src:e.nextLevelMedal,alt:""}})]),a("div",{staticClass:"bonus-description"},[e._v("\n        "+e._s(e.$t("vip.desc1"))),a("br"),e._v(e._s(e.$t("vip.desc2"))+"\n        "),a("br"),a("br"),a("div",{staticClass:"stress"},[e._v(e._s(e.$t("vip.desc3")))]),e._v("\n        "+e._s(e.$t("vip.desc4"))+"\n      ")])]),a("div",{staticClass:"vip-level-wrap"},[a("div",[a("div",{staticClass:"vip-level-title-wrap"},[a("div",{staticClass:"vip-level-title"},[e._v(e._s(e.$t("vip.vipLevel")))]),a("img",{staticClass:"ribbon",attrs:{src:"/img/vip/ribbon.svg"}})]),a("div",{staticClass:"rank-wrap"},[a("div",{staticClass:"axis-bg"}),a("div",{staticClass:"row-title"},[a("div",{staticClass:"wager-header"},[e._v(e._s(e.$t("vip.wager"))),a("br"),e._v(e._s(e.$t("vip.tazChip")))]),a("div",{staticClass:"bonus-header"},[e._v(e._s(e.$t("vip.bonus"))),a("br"),e._v(e._s(e.$t("vip.percentage")))])]),a("div",{staticClass:"level-row-wrap"},e._l(e.levels,(function(t){return a("div",{key:t.level,staticClass:"level-row"},[a("div",{staticClass:"wager-text"},[e._v(e._s(t.wager))]),a("div",{staticClass:"level-text"},[e._v(e._s(t.level))]),a("div",{class:t.barsize}),a("img",{staticClass:"rank-medal",attrs:{src:t.medalImg}}),a("div",{staticClass:"bonus-text"},[e._v(e._s(t.percentage))])])})),0)])])])]),a("g-footer")],1)},s=[],r=(a("8e6e"),a("ac6a"),a("456d"),a("6b54"),a("a481"),a("bd86")),c=(a("7f7f"),a("2f62")),v=a("fd2d");function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,i)}return a}function n(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(a,!0).forEach((function(t){Object(r["a"])(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(a).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}var p=[0,1e6,5e6,1e7,5e7,1e8,5e8,1e9,25e8,75e8,15e9],g={data:function(){return{levels:[{wager:"1 M",level:1,barsize:"bar-level-1",medalImg:"/img/vip/ic-vip1.svg",percentage:"0.02 %"},{wager:"5 M",level:2,barsize:"bar-level-2",medalImg:"/img/vip/ic-vip2.svg",percentage:"0.03 %"},{wager:"10 M",level:3,barsize:"bar-level-3",medalImg:"/img/vip/ic-vip3.svg",percentage:"0.04 %"},{wager:"50 M",level:4,barsize:"bar-level-4",medalImg:"/img/vip/ic-vip4.svg",percentage:"0.05 %"},{wager:"100 M",level:5,barsize:"bar-level-5",medalImg:"/img/vip/ic-vip5.svg",percentage:"0.06 %"},{wager:"500 M",level:6,barsize:"bar-level-6",medalImg:"/img/vip/ic-vip6.svg",percentage:"0.07 %"},{wager:"1,000 M",level:7,barsize:"bar-level-7",medalImg:"/img/vip/ic-vip7.svg",percentage:"0.09 %"},{wager:"2,500 M",level:8,barsize:"bar-level-8",medalImg:"/img/vip/ic-vip8.svg",percentage:"0.11 %"},{wager:"7,500 M",level:9,barsize:"bar-level-9",medalImg:"/img/vip/ic-vip9.svg",percentage:"0.13 %"},{wager:"15,000 M",level:10,barsize:"bar-level-10",medalImg:"/img/vip/ic-vip10.svg",percentage:"0.15 %"}],userData:{account:"",vip:0,accumulated_bet:0,accumulated_prize:0,staked:0,unstaking:0,unstaking_requested:0,created:"",updated:"",signup_reward:0}}},mounted:function(){this.isLogin&&this.fetchUserData(this.account.name)},watch:{account:function(e){this.fetchUserData(e.name)}},computed:n({},Object(c["d"])({isLogin:function(e){return void 0!==e.common.account.name},account:function(e){return e.common.account}}),{vipMedal:function(){return"/img/vip/ic-vip".concat(this.userData.vip,".svg")},nextLevel:function(){if(this.userData.vip>=10)return 100;var e=p[this.userData.vip+1];return this.userData.accumulated_bet/e*100},nextLevelMedal:function(){return"/img/vip/ic-vip".concat(this.userData.vip>=10?10:this.userData.vip+1,".svg")},nextLevelTazChip:function(){if(this.userData.vip>=10)return 0;var e=p[this.userData.vip+1];return e-this.userData.accumulated_bet}}),methods:{fetchUserData:function(e){var t=this;fetch("".concat(this.$REST_API_SERVER,"/api/v1/users?account=").concat(e),{method:"GET",headers:{"content-type":"application/json"}}).then((function(e){e.json().then((function(e){t.userData=e})).catch((function(e){console.log(e)}))})).catch((function(e){console.log(e)}))},formatedNumber:function(e){var t=/\B(?=(\d{3})+(?!\d))/g;return e.toString().replace(t,",")}},components:{"g-footer":v["a"]}},u=g,o=(a("e3e8"),a("2877")),d=Object(o["a"])(u,i,s,!1,null,"7f299da9",null);t["default"]=d.exports},"9f0d":function(e,t,a){},e3e8:function(e,t,a){"use strict";var i=a("9f0d"),s=a.n(i);s.a}}]);
//# sourceMappingURL=chunk-0bca115a.658bdb24.js.map