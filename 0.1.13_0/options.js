window.addEventListener('load', ()=>{
	
	
	document.getElementById('view_speedrate_label').textContent = chrome.i18n.getMessage("view_speedrate_label");
	document.querySelector('.step_label').textContent = chrome.i18n.getMessage("step_label");
	document.querySelectorAll('.sec_label').forEach(ele=>{
		ele.textContent = chrome.i18n.getMessage("sec_label");
	});
	document.querySelector('.keyboard_shortcuts').textContent = chrome.i18n.getMessage("keyboard_shortcuts");
	document.querySelector('.decrease_playback_rate').textContent = chrome.i18n.getMessage("decrease_playback_rate");
	document.querySelector('.increase_playback_rate').textContent = chrome.i18n.getMessage("increase_playback_rate");
	document.querySelector('.max_playback_rate').textContent = chrome.i18n.getMessage("max_playback_rate");

	document.getElementById('use_second_seek_label').textContent = chrome.i18n.getMessage("use_second_seek_label");

	document.querySelector('.rewind_forward_time_label').textContent = chrome.i18n.getMessage("rewind_forward_time_label");
	document.querySelector('.rewind_shortcut_text').textContent = chrome.i18n.getMessage("rewind_shortcut_text");
	document.querySelector('.forward_shortcut_text').textContent = chrome.i18n.getMessage("forward_shortcut_text");
	
	console.log(chrome.runtime.getManifest().version);



	function step_load(items){
		const target = document.getElementById("speedrate_step");
		if(items.speedrate_step === 0.125){
			target.value = "s0125";
		}
		else if(items.speedrate_step === 0.25){
			target.value = "s0250";
		}
	}


	chrome.storage.local.get( null , items=>{
		console.log(items);
		
		if(items.check_view_speedrate){
			document.getElementById("check_view_speedrate_id").checked = true;
		}
		if(items.check_use_second_seek){
			document.getElementById("check_use_second_seek_id").checked = true;
		}
		step_load(items);

		document.getElementById("seektime_id").value = items.seektime;

		document.querySelectorAll(".seektime_label").forEach(ele=>{
			ele.textContent = items.seektime;
		});
		
	});

	document.getElementById("speedrate_step").addEventListener("change", e=>{
		const value = e.target.value;
		let new_step;
		if(value === "s0125"){
			new_step = 0.125;
		}
		else if(value === "s0250"){
			new_step = 0.25;
		}
		chrome.storage.local.set({'speedrate_step': new_step}, ()=>{
			console.log(new_step, "저장");
			e.target.blur();
		});
	});

	document.getElementById("check_view_speedrate_id").addEventListener("click", e=>{
		chrome.storage.local.set({'check_view_speedrate': e.target.checked}, ()=> console.log(e.target.checked,"save"));
	});

	document.getElementById("check_use_second_seek_id").addEventListener("click", e=>{
		chrome.storage.local.set({'check_use_second_seek': e.target.checked}, ()=> console.log(e.target.checked,"save"));
	});

	document.getElementById("seektime_id").addEventListener("input", e=>{
		document.querySelectorAll(".seektime_label").forEach(ele=>{
			ele.textContent = e.target.value;
		});
		chrome.storage.local.set({'seektime': e.target.value}, ()=>{
			console.log(e.target.value, "저장");
		});
	});

	


});





