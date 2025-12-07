var Game = function(){
	var $this = this;
	this.audio = new Audio();
	this.max_score = 100;
	this.min_score = 80;
	this.kedip = 0;
	this.attemp=0;
	this.isDebug = true;
	this.temp = 1;
	this.startDate = this.getCurrDateTimestamp();
	this.audio_global_startSlide = 1; 
	this.audio_global_endSlide = 5; 
	this.audio_global_startSlide2 = 6; 
	this.audio_global_endSlide2 = 7; 
	this.audio_global_pauseSlides = [];
	// this.audioGlobal = 0;
	this.flag_slider2Page = 0;
	// setting visual novel
	this.game_data = {};
	this.life_max = 5;
	this.total_soal = 3;
	this.complete_bar_type = 2;
	this.flag_click_imgInfo = 1; //apabila ingin menggunakan button info
	this.flag_tutorial_show = 0;
	$this.moleawizDevice;
	
	let url_json = 'config/templete_content.json';
	let type_modul = '';
	if(type_modul == 'click_and_show'){
		url_json = 'config/templete_content_cns.json';
	}else if(type_modul == 'infographic_parallax'){
		url_json = 'config/templete_content_infographicParallax.json';
	}else if(type_modul == 'animated_infographic'){
		url_json = 'config/templete_content_animatedInfographic.json';
	}

	$.get(url_json,function(e){
		$this.arr_content = e["list_slide"];
		$this.curr_module = e["module"];
		$this.curr_course = e["course"];
		$this.mode = e["mode"];
		$this.scorm_helper = new ScormHelper();
		$this.environment = e["environment"];
		$this.create_slide();
	},'json');
}

Game.prototype.create_slide = function() {

	var $this = this;
	var current = $this.scorm_helper.getCurrSlide();
	// current = 51;

	
	$("#content").removeAttr('class');
	$("#content").addClass($this.checkDevice());

	// if($this.flag_slider2Page == 0 && current == 6){
	// 	$this.flag_slider2Page = 1;
	// 	// current -= 2;
	// 	game.setSlide(4);
	// 	return;
	// }else{
	// 	$this.flag_slider2Page = 1;
	// }
	console.log(current);
	var str = $this.arr_content[current]["file"];
	var arr = str.split("/");

	// console.log($this.environment);
	if($this.environment == "game"){
		$(".body-wrapper").addClass("col-xs-12 col-sm-10 col-md-10 col-lg-4");
		$(".body-wrapper").css({"width":"","left":"50%","transform":"translateX(-50%)"});
	}else{
		$(".body-wrapper").css({"width":"100%"});
	}

	if(arr[0] == "muse"){
		window.location = $this.arr_content[current]["file"];
	}
	else{
		$.get($this.arr_content[current]["file"],function(e){
			$this.curr_slide = $(e).clone();
			$this.curr_slide.find(".title-course").html($this.curr_course);
			$this.curr_slide.find(".title-module").html($this.curr_module);
			$("#content").html($this.curr_slide);

			//set audio global
			// if($this.flag_audioGlobal){
				$this.audioGlobal(current);
			// }

			// Set text complete bar visnov
			$this.text_complete_bar = $this.arr_content[current]["text_complete_bar"];

			if($this.arr_content[current]["class"]){
				console.log($this.arr_content[current]["class"]);
				$this.curr_class = new window[$this.arr_content[current]["class"]];
				console.log($this.curr_class);
				$this.curr_class.init($this.arr_content[current]);
			}

			$(".next_page").click(function(e){
				$this.audio.audioButton.play();
				$this.nextSlide();
			});

			$(".prev_page").click(function(e){
				$this.audio.audioButton.play();
				$this.prevSlide();
			});
		});
	}
};

Game.prototype.checkDevice = function() {
	var $this = this;

	// init check Device
	$this.moleawizDevice = $this.scorm_helper.infoDevice();
	var deviceInfo = $this.scorm_helper.infoDevice();
	// console.log(deviceInfo);

	if(deviceInfo != undefined){
		var devicePlatform = deviceInfo.platform;
		var isTablet = deviceInfo.is_tablet;

		const getOrientation = deviceInfo.orientation;
		const orientationLowerCase = getOrientation.toLowerCase();
		
		var deviceOrientation = orientationLowerCase.indexOf("landscape") > -1 ? "landscape" : "portrait"
	
		if(devicePlatform.toLowerCase() == "android"){
			if(deviceOrientation == "portrait" && isTablet == "false") return "on-mobile-portrait";
			if(deviceOrientation == "portrait" && isTablet == "true") return "on-tablet-portrait";
			if(deviceOrientation == "landscape" && isTablet == "false") return "on-mobile-landscape";
			if(deviceOrientation == "landscape" && isTablet == "true") return "on-tablet-landscape";
		} else {
			if(devicePlatform.toLowerCase() == "ios" && isTablet == "false" && deviceOrientation == "portrait") return "on-mobile-portrait";
			if(devicePlatform.toLowerCase() == "ios" && isTablet == "false" && deviceOrientation == "landscape") return "on-mobile-landscape";
			if(devicePlatform.toLowerCase() == "ios" && isTablet == "true" && deviceOrientation == "portrait") return "on-tablet-portrait";
			if(devicePlatform.toLowerCase() == "ios" && isTablet == "true" && deviceOrientation == "landscape") return "on-tablet-landscape";
		}

	} else {
		return "on-desktop";
	}

}


Game.prototype.audioGlobal = function(current) {
	var $this = this;

	// console.log($this.audio_global_startSlide, current, $this.audio_global_endSlide);
	// console.log($this.audio_global);
	if($this.audio_global_startSlide <= current  && current < $this.audio_global_endSlide || $this.audio_global_startSlide2 <= current  && current < $this.audio_global_endSlide2){
		// console.log("test");
		let flag_pause = 0;
		if($this.audio_global_pauseSlides.length > 0){
			if($this.audio_global_pauseSlides.indexOf(current) > -1){
				if($this.audio_global != undefined){
					flag_pause = 1;
					// console.log("pause");
					$this.audio_global.pause();
					$this.audio_global = undefined;
				}
			}
		}

		if($this.audio_global == undefined && flag_pause == 0){
			// console.log("play");
			let src = "assets/audio/BGM_Opening.mp3";
			$this.audio_global = $this.audio.audio_dynamic(src);
			$this.audio_global.loop = true;
			$this.audio_global.play();
		}
	}else{
		if($this.audio_global != undefined){
			// console.log("pause");
			$this.audio_global.pause();
			$this.audio_global = undefined;
		}
	}
}

Game.prototype.setProgresBarStage = function() {
    console.log("setProgresBarStage");
    var $this = this;

    let var_a;
    let var_b;
    console.log(game.game_data);
    console.log(game.total_soal);
    // console.log(mode);

    let game_quiz = game.scorm_helper.getQuizResult(['game_slide_4','game_slide_6','game_slide_8','game_slide_10']);
    // console.log(game_quiz);

    let mode = 2; //mode 1 berdasarkan total step; mode 2 berdasarkan total soal
    if(mode == 2){
        // var_a = (game.game_data["last_score"] != undefined ? game.game_data["last_score"] : 0);
        var_a = game_quiz["score"];
        var_b = game.total_soal;
    }else{
		if(game.scorm_helper.getSingleData("game_data")){
			var game_data = game.scorm_helper.getSingleData("game_data");
			console.log(game_data)
			if(game_data["push_stage"]){
				var_a = (game_data["push_stage"] != undefined ? game_data["push_stage"].length : 0);
				var_b = game.total_step;
			} else {
				var_a = (game_data["complete_stage"] != undefined ? game_data["complete_stage"].length : 0);
				var_b = game.total_step;
			}
		}
    }
    
    // console.log(var_a);
    // console.log(var_b);
    var percent = (var_a / var_b * 100);
    // console.log(percent);
    if(isNaN(percent)){
        percent = 0;
    }
    // percent = 100;
    $(".progress-bar").css("width",percent+"%");

    // game.complete_bar_type = 1;
    if(game.complete_bar_type == 2){
        $(".progress").hide();
        $(".progress_2").show();

        //hide icon complete bar
        if($this.hide_icon_complete_bar == true){
            $(".progress_2 .progress-value .fa").hide();
        }else{
            $(".progress_2 .progress-value .fa").hide();
            $(".progress_2 .progress-title").html($this.text_complete_bar);
            // console.log(percent);
            if(percent <= 69){
              $(".progress_2 .progress-value #icon-2").css("display","table");
              $(".progress_2 .progress-bar").css("background-color","#FFBC3E");
            }else if(percent > 69 && percent <= 99){
              $(".progress_2 .progress-bar").css("background-color","#FFBC3E");
              $(".progress_2 .progress-value #icon-3").css("display","table");
            }else{
              $(".progress_2 .progress-bar").css("background-color","#8AEA2A");
              $(".progress_2 .progress-value #icon-3").css("display","table");
            }
        }

        //setting css life
        $(".header .life").css("padding-left","19.2%");
    }else{
        $(".progress").show();
        /*Function setting css progress-bar*/
            if(percent == 0){
                $(".complete_bar .progress-value").css("right", "-5.4vw");
            }
        /*End function setting css progress-bar*/

        //hide icon complete bar
        if($this.hide_icon_complete_bar == true){
            $(".progress-value .fa").hide();
        }else{
            $(".progress-value .fa").hide();
            if(percent <= 69){
              $(".progress-value #icon-2").css("display","table");
            }else if(percent > 69 && percent <= 99){
              $(".progress-bar").css("background-color","#FFBC3E");
              $(".progress-value #icon-3").css("display","table");
            }else{
              $(".progress-bar").css("background-color","#8AEA2A");
              $(".progress-value #icon-3").css("display","table");
            }
        }
    }
}

Game.prototype.setSlide = function(idx_slide) {
    console.log("setSlide");
    // this.audio.audioButton.play();
    this.scorm_helper.setSlide(parseInt(idx_slide)-1);
    this.nextSlide();
};

Game.prototype.nextSlide = function() {
	if(this.scorm_helper.getCurrSlide()<this.arr_content.length-1){
		this.scorm_helper.nextSlide();
		this.create_slide();
	}
};
Game.prototype.prevSlide = function() {
	if(this.scorm_helper.getCurrSlide()<this.arr_content.length-1){
		this.scorm_helper.setSlide(this.scorm_helper.getCurrSlide()-2);
		this.scorm_helper.nextSlide();
		this.create_slide();
	}
};

Game.prototype.prev = function(prev) {
	var $this = this;
	if(prev){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", prev, {
            transition: "slide",
            reverse: true
        });
    }
};

Game.prototype.next = function(next) {
	var $this = this;
	if(next){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", next, {
            transition: "slide"
        });
    }
};

Game.prototype.getDate = function() {
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	var dateString = "";
	var newDate = new Date();  
	dateString += newDate.getDate() + " "; 
	dateString += (months[newDate.getMonth()]) + " "; 
	dateString += newDate.getFullYear();

	return dateString;
};
Game.prototype.getFullDate = function() {
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	var dateString = "";
	var newDate = new Date();  
	dateString += newDate.getDate() + " "; 
	dateString += (months[newDate.getMonth()]) + " "; 
	dateString += newDate.getFullYear() + " ";
	dateString += newDate.getHours()+":";
	dateString += newDate.getMinutes()+":";
	dateString += newDate.getSeconds();
	return dateString;
};

Game.prototype.StringToDate = function(str) {
	var arr = str.split(" ");
	var months = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember" ];
	
	var get_month=0;
	for (var i = 0; i < months.length; i++) {
		if(months[i] == arr[1]){
			get_month = i+1;
			break;
		}
	}

	game.debug(get_month+"/"+arr[0]+"/"+arr[2]+" "+arr[3]);
	var date = new Date(get_month+"/"+arr[0]+"/"+arr[2]+" "+arr[3]);
	return date;
};

Game.prototype.getCurrDateTimestamp = function() {
	var date =  new Date();
	return date.getTime();
};

Game.prototype.parseTime = function(deff) {
	var str="";
	var diffHours = Math.floor(deff / (1000 * 3600))%24;
	var diffMunites = Math.floor(deff / (1000 * 60))%60;
	var diffSec = Math.floor(deff / 1000)%60;
	var diffMill = deff % 1000;

	if(diffHours<10){
		str=str+"0"+diffHours+":";
	}
	else{
		str=str+diffHours+":";
	}

	if(diffMunites<10){
		str=str+"0"+diffMunites+":";
	}
	else if(diffMunites>=10){
		str=str+diffMunites+":";
	}

	if(diffSec<10){
		str=str+"0"+diffSec;
	}
	else if(diffSec>=10){
		str=str+diffSec+".00";
	}

	this.debug(str);
	return str;
};

Game.prototype.debug = function(string) {
	if(this.isDebug){
		//alert(string);
		console.log(string);
	}
};


Game.prototype.setProgresBar = function() {
    console.log("setProgresBar");
    var $this = this;

    let var_a;
    let var_b;
    console.log(game.game_data);
    console.log(game.total_soal);
    // console.log(mode);

    let game_quiz = game.scorm_helper.getQuizResult(['game_slide_16','game_slide_17','game_slide_18']);
    // console.log(game_quiz);

    let mode = 2; //mode 1 berdasarkan total step; mode 2 berdasarkan total soal
    if(mode == 2){
        // var_a = (game.game_data["last_score"] != undefined ? game.game_data["last_score"] : 0);
        var_a = game_quiz["score"];
        var_b = game.total_soal;
    }else{
        var_a = (game.game_data["curr_step"] != undefined ? game.game_data["curr_step"] : 0);
        var_b = game.total_step;
    }
    
    // console.log(var_a);
    // console.log(var_b);
    var percent = (var_a / var_b * 100);
    // console.log(percent);
    if(isNaN(percent)){
        percent = 0;
    }
    // percent = 100;
    $(".progress-bar").css("width",percent+"%");

    // game.complete_bar_type = 1;
    if(game.complete_bar_type == 2){
        $(".progress").hide();
        $(".progress_2").show();

        //hide icon complete bar
        if($this.hide_icon_complete_bar == true){
            $(".progress_2 .progress-value .fa").hide();
        }else{
            $(".progress_2 .progress-value .fa").hide();
            $(".progress_2 .progress-title").html($this.text_complete_bar);
            // console.log(percent);
            if(percent <= 69){
              $(".progress_2 .progress-value #icon-2").css("display","table");
              $(".progress_2 .progress-bar").css("background-color","#FFBC3E");
            }else if(percent > 69 && percent <= 99){
              $(".progress_2 .progress-bar").css("background-color","#FFBC3E");
              $(".progress_2 .progress-value #icon-3").css("display","table");
            }else{
              $(".progress_2 .progress-bar").css("background-color","#8AEA2A");
              $(".progress_2 .progress-value #icon-3").css("display","table");
            }
        }

        //setting css life
        $(".header .life").css("padding-left","19.2%");
    }else{
        $(".progress").show();
        /*Function setting css progress-bar*/
            if(percent == 0){
                $(".complete_bar .progress-value").css("right", "-5.4vw");
            }
        /*End function setting css progress-bar*/

        //hide icon complete bar
        if($this.hide_icon_complete_bar == true){
            $(".progress-value .fa").hide();
        }else{
            $(".progress-value .fa").hide();
            if(percent <= 69){
              $(".progress-value #icon-2").css("display","table");
            }else if(percent > 69 && percent <= 99){
              $(".progress-bar").css("background-color","#FFBC3E");
              $(".progress-value #icon-3").css("display","table");
            }else{
              $(".progress-bar").css("background-color","#8AEA2A");
              $(".progress-value #icon-3").css("display","table");
            }
        }
    }
}

Game.prototype.showLoading = function (){
	$(".loader_image_index").show();
	$(".modal-backdrop in").show();
}
  
Game.prototype.hideLoading = function (){
	$(".loader_image_index").hide();
	$(".modal-backdrop in").hide();
}