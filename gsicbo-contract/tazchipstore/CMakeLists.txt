cmake_minimum_required(VERSION 3.5)
project(gsicbo VERSION 1.0.0)

find_package(eosio.cdt)

if (CMAKE_BUILD_TYPE MATCHES Debug)
  add_definitions(-DDEBUG=1)
endif()

### Generate the wasm and abi
add_contract( tazchipstore tazchipstore tazchipstore.cpp )
