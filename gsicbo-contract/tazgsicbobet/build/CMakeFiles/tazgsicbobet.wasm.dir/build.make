# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.10

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build

# Include any dependencies generated for this target.
include CMakeFiles/tazgsicbobet.wasm.dir/depend.make

# Include the progress variables for this target.
include CMakeFiles/tazgsicbobet.wasm.dir/progress.make

# Include the compile flags for this target's objects.
include CMakeFiles/tazgsicbobet.wasm.dir/flags.make

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o: CMakeFiles/tazgsicbobet.wasm.dir/flags.make
CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o: ../tazgsicbobet.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o"
	/usr/bin/eosio-cpp  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o -c /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/tazgsicbobet.cpp

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.i"
	/usr/bin/eosio-cpp $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/tazgsicbobet.cpp > CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.i

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.s"
	/usr/bin/eosio-cpp $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/tazgsicbobet.cpp -o CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.s

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.requires:

.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.requires

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.provides: CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.requires
	$(MAKE) -f CMakeFiles/tazgsicbobet.wasm.dir/build.make CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.provides.build
.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.provides

CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.provides.build: CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o


# Object files for target tazgsicbobet.wasm
tazgsicbobet_wasm_OBJECTS = \
"CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o"

# External object files for target tazgsicbobet.wasm
tazgsicbobet_wasm_EXTERNAL_OBJECTS =

tazgsicbobet.wasm: CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o
tazgsicbobet.wasm: CMakeFiles/tazgsicbobet.wasm.dir/build.make
tazgsicbobet.wasm: CMakeFiles/tazgsicbobet.wasm.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable tazgsicbobet.wasm"
	$(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/tazgsicbobet.wasm.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
CMakeFiles/tazgsicbobet.wasm.dir/build: tazgsicbobet.wasm

.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/build

CMakeFiles/tazgsicbobet.wasm.dir/requires: CMakeFiles/tazgsicbobet.wasm.dir/tazgsicbobet.cpp.o.requires

.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/requires

CMakeFiles/tazgsicbobet.wasm.dir/clean:
	$(CMAKE_COMMAND) -P CMakeFiles/tazgsicbobet.wasm.dir/cmake_clean.cmake
.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/clean

CMakeFiles/tazgsicbobet.wasm.dir/depend:
	cd /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build /mnt/e/51_git/c004_gsicbo/contract/tazgsicbobet/build/CMakeFiles/tazgsicbobet.wasm.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : CMakeFiles/tazgsicbobet.wasm.dir/depend

