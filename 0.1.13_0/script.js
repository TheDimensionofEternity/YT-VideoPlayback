function run_script(items){
    ////////////////////////////////////
    ////// 재생속도 조절
    const min_value = 0.1;
    const max_value = 16;
    const step = items.speedrate_step || 0.25; // 0.125 0.25
    let last_now_speed;
    let last_last_speed;
    const popup_msg = new (function(){
        let popup_msg_timer;
        let popup_msgbox;
        this.print = function(text = "test", fadeouttime = 1000){
            if(popup_msg_timer){
                clearInterval(popup_msg_timer);
                popup_msgbox && popup_msgbox.remove();
            }
            const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player.ytp-embed");
            popup_msgbox = document.createElement("div");
            popup_msgbox.setAttribute("style","position:absolute; z-index: 10; top: 10%; left: 50%; transform:translateX(-50%); background: rgba(0,0,0,0.5); color: white; font-size: 25px; padding: 15px 20px; border-radius: 10px; text-shadow: 2px 2px 2px black;");
            const orig_textbox = document.querySelector(".ytp-bezel-text");
            if(orig_textbox){
                const orig_style = window.getComputedStyle(orig_textbox);
                popup_msgbox.style['font-size'] = orig_style.getPropertyValue("font-size");
                popup_msgbox.style['border-radius'] = orig_style.getPropertyValue("border-radius");
                popup_msgbox.style['text-shadow'] = orig_style.getPropertyValue("text-shadow");
                popup_msgbox.style.background = orig_style.getPropertyValue("background");
                popup_msgbox.style.padding = orig_style.getPropertyValue("padding");
            }
            popup_msgbox.textContent = text;
            player.appendChild(popup_msgbox);
        
            popup_msg_timer = setTimeout(()=>{
                popup_msgbox && popup_msgbox.remove();
                popup_msg_timer = null;
                popup_msgbox = null;
            },fadeouttime);
        }
        this.clear_popup = function(){
            if(popup_msg_timer){
                clearInterval(popup_msg_timer);
                popup_msgbox && popup_msgbox.remove();
            }
        }

        this.bar_msg = function(text){
            const playbackRate_info = document.querySelector(".playbackRate_info") || playbackRate_ui_make();
            if(playbackRate_info) playbackRate_info.textContent = `(${text})`;
        }
    });

    function ytb_msg_hide(){
        const textmsgbox = document.querySelector(".ytp-bezel-text-wrapper");
        if(textmsgbox){
            textmsgbox.parentNode.style.display = 'none';
        }
    }

    function get_ytb_speed(player_video){
        player_video ??= find_video();
        if(!player_video){
            return;
        }
        return player_video.playbackRate;
    }

    function ytb_speed_change(add){
        const player_video = find_video();
        if(!player_video){
            return;
        }
        const now_speed = player_video.playbackRate;
        let new_speed = add ? Number((now_speed + add).toFixed(3)) : 1;
        if(new_speed < min_value){
            new_speed = now_speed;
        }
        else if(new_speed > max_value){
            new_speed = now_speed;
        }
        if(new_speed < 1 + step && new_speed > 1 - step){
            new_speed = 1;
        }
        player_video.playbackRate = new_speed;
        items.test_mode && console.log("now:", now_speed, "add speed", add, "new speed", new_speed);
        popup_msg.print(new_speed + "x");
        setTimeout(ytb_msg_hide, 0);
    }

    function ytb_time_change(add){
        const player_video = find_video();
        if(!player_video){
            return;
        }
        const duration = player_video.duration;
        const now_speed = player_video.playbackRate;
        const new_time = Math.min(player_video.currentTime + (add * now_speed), duration - 0.1);
        if(duration <= new_time){
            return;
        }
        player_video.currentTime = new_time;

        items.test_mode && console.log("add time", add, "new time",new_time, "duration", duration);
        popup_msg.print(`${add > 0 ? "+ ":"- "}${Math.abs(add)} sec`, 300);
        setTimeout(ytb_msg_hide, 0);
    }

    function playbackRate_ui_make(player,player_video){
        if(!items.check_view_speedrate){
            return false;
        }
        player = player || document.getElementById("movie_player") || document.querySelector(".html5-video-player.ytp-embed");
        const controls = player?.querySelector('.ytp-chrome-controls .ytp-left-controls');
        player_video = player_video || find_video();
        if(controls){
            const chaptercontainer = controls.querySelector(".ytp-chapter-container");
            const msgbox = document.createElement("div");
            msgbox.setAttribute("class","playbackRate_info");
            msgbox.setAttribute("style","display:inline-block; vertical-align: top; margin-right: 5px;");
            msgbox.textContent = `(${player_video.playbackRate}x)`;
            controls.insertBefore(msgbox, chaptercontainer);
            player.setAttribute("playbackRate_change_loaded","");
            return msgbox;
        }
        return false;
    }

    function find_video(){ // 숨겨진 미니플레이어가 생기는 경우가 발생해서, src가 있는 플레이어 따로 체크
        const video_list = document.querySelectorAll("video");
        if(video_list.length === 1){
            return video_list[0];
        }
        let return_ele;
        [...video_list].some(e=>{
            if(e.currentSrc){
                return_ele = e;
                if(!(e.paused || e.ended || e.seeking || e.readyState < e.HAVE_FUTURE_DATA)){
                    return true; // 현재 재생중인 비디오 최우선
                }
            }
        });
        return return_ele;
    }


    function speedchange_ui_init(){
        // const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player.ytp-embed");
        // const video_tag = find_video();
        // if(!player || !video_tag){
        //     return false;
        // }
        const docuElem = document.documentElement;
        if(!docuElem.hasAttribute("playbackRate_change_loaded")){
            // last_now_speed = get_ytb_speed(video_tag);
            docuElem.addEventListener("keydown", event=>{
                last_now_speed ??= get_ytb_speed();
                const target = event.target;
                if(target.isContentEditable) return;
                const nodeName = target.nodeName;
                if(nodeName === "TEXTAREA" || (nodeName === 'INPUT' && /^(?:text|password|search|date|datetime|datetime-local|email|month|number|tel|time|url|week)$/i.test(target.type))) return;
                const key = event.key;
                //if(key === ";") ytb_speed_change(-step);
                //else if(key === "'") ytb_speed_change(step);
                const player_video = find_video();
                if(key === ">"){
                    if(get_ytb_speed(player_video) >= 2){
                        event.preventDefault();
                        ytb_speed_change(step);
                    }
                    else if(step === 0.125 && (get_ytb_speed(player_video) % 0.25 === 0 || last_last_speed > last_now_speed)){
                        event.preventDefault();
                        ytb_speed_change(step);
                    }
                    else{
                        popup_msg.clear_popup();
                    }
                }
                else if(key === '<'){ // 플레이어가 2배속일때 1.75로 강제로 내리지 않도록 주의 -> 1.75에서 2로 올리기가 안되는 상태에 빠짐
                    let temp_speed;
                    if(get_ytb_speed(player_video) > 2){
                        event.preventDefault();
                        ytb_speed_change(-step);
                    }
                    else if(step === 0.125 && ((temp_speed = get_ytb_speed(player_video)) % 0.25 === 0 || last_last_speed < last_now_speed) && temp_speed > 0.25){
                        event.preventDefault();
                        ytb_speed_change(-step);
                    }
                    else{
                        popup_msg.clear_popup();
                    }
                }
                else if(items.check_use_second_seek && (event.metaKey || event.shiftKey) && (key == "ArrowLeft" || key == "ArrowRight")){
                    // ctrl + 화살표는 챕터이동 단축키이므로, ctrl단축키 조합 삭제
                    event.preventDefault();
                    const seektime = Number(items.seektime);
                    if(key == "ArrowLeft"){
                        ytb_time_change(-seektime);
                    }
                    else if(key == "ArrowRight"){
                        ytb_time_change(+seektime);
                    }
                }
            }, true);
            docuElem.addEventListener("ratechange", e=>{
                items.check_view_speedrate && popup_msg.bar_msg(e.target.playbackRate+"x");
                last_last_speed = last_now_speed;
                last_now_speed = e.target.playbackRate;
            }, true);
            // playbackRate_ui_make(player, video_tag);
            playbackRate_ui_make();
            items.test_mode && console.log("playbackRate keydown addEventListener", document.documentElement);
            docuElem.setAttribute("playbackRate_change_loaded","");
        }
    }

    function player_observer(){
        const urlParams = new URLSearchParams(location.search);
        const pathname = location.pathname;
        if((pathname.search(/\/watch/) >= 0 && urlParams.get('v')) || pathname.search(/\/embed\//) >= 0) {
            speedchange_ui_init();
        }
    }
    //player_observer();
    window.addEventListener("yt-navigate-finish", e=>{ // 옛날 ui는 spfdone
        items.test_mode && console.log('yt-navigate-finish event');
        player_observer(); //
    });
    window.addEventListener("yt-navigate-start", e=>{
        items.test_mode && console.log('yt-navigate-start event');
        player_observer();
    });
    if(document.readyState !== "complete"){
        window.addEventListener("load",e=>{
            items.test_mode && console.log('load event',location.href);
            player_observer();
        });
    }
    else{
        items.test_mode && console.log('load_2',location.href);
        player_observer();
    }






}

chrome.storage.local.get( null , run_script);











