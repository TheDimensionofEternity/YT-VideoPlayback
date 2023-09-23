const default_options = {
	test_mode: false,
	speedrate_step: 0.25,
	check_view_speedrate: true,
	check_use_second_seek: true,
	seektime: 2,
}

chrome.storage.local.get( null , items=>{
	for (const key in default_options) {
		if(typeof items[key] === "undefined"){
			chrome.storage.local.set({[key]: default_options[key]}, ()=>console.log(key, "set default"));
		}
	}
});





