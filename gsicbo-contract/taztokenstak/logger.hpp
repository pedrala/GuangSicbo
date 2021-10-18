#pragma once

#if DEBUG
#include <eosio/print.hpp>
#define log(...) eosio::print(__VA_ARGS__, " / ")
#define logi(...) eosio::print("[info]", __VA_ARGS__, " / ")
#define logd(...) eosio::print("[debug]", __VA_ARGS__, " / ")
#define loge(...) eosio::print("[error]", __VA_ARGS__, " / ")
#else
#define log(...)
#define logi(...)
#define logd(...)
#define loge(...)
#endif