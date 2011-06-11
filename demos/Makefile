MODE=optimize

all: group_size_visualizer_opt.js view_switcher_opt.js

group_size_visualizer_opt.js: group_size_visualizer.js ../yunabe/ui/group_size_visualizer.js
	closurec --mode=$(MODE) -d group_size_visualizer_opt.js group_size_visualizer.js -p ../yunabe || rm -f group_size_visualizer_opt.js

view_switcher_opt.js: view_switcher.js ../yunabe/ui/view_switcher.js
	closurec --mode=$(MODE) -d view_switcher_opt.js view_switcher.js -p ../yunabe -e ../externs/google_search_api.js

clean:
	rm *_opt.js
