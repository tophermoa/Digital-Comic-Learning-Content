/**
* this is a class for generate game results either star or score.
* @class
* @author     NejiElYahya
*/

var Result = function(){

}


Result.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$.get("config/setting_result_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.win = e["win"];
		$this.lose = e["lose"];
		$this.settings = e["settings"];
		$this.game_slide = e['game_slide'];
		$this.setResult();
	},'json');
};

Result.prototype.setResult = function() {
	var $this = this;
	// remove jquery mobile
	$("html").removeClass("ui-mobile");
	// setting start or score
	var isScore = ($this.settings["score"] == true ? true : false);
	
	let game_quiz;
	if($this.game_slide != undefined){
		let arr_temp = [];
		for(let i=0; i<$this.game_slide.length; i++ ){
			let a = 'game_slide_'+$this.game_slide[i];
			arr_temp.push(a);
		}
		console.log(arr_temp);
		game_quiz = game.scorm_helper.getQuizResult(arr_temp);
	}else{
		game_quiz = game.scorm_helper.getQuizResult(["game_slide_3"]);
	}
	console.log(game_quiz);
	// count all game score range 0-5 for the star
	var score = parseInt(game_quiz["score"])/parseInt(game_quiz["total_soal"])*game.max_score;
	// var score = 100;
	console.log(score);
	// score = 0;
	/*end comment by elim*/
	// count score range 0-100 for save to cmi.raw.score
	var count = score/game.max_score*100;
	// for score in text
	$(".result_score").html(Math.round(score));
	if(isScore){
		$(".star-wrapper").hide();
		$(".score_wrapper").show();
	}else{
		$(".star-wrapper").show();
		$(".score_wrapper").hide();
	}
	$('.header').hide();
	// $(".img-result-wrapper").css("padding-top",$(".div_header").innerHeight()-20);
	// save score to to cmi.raw.score
	game.scorm_helper.sendResult(Math.round(count));
	// set duration and save to scorm
	game.scorm_helper.setDuration();
	// if score larger than minimum grade
	if(Math.round(score) >= game.min_score){
		// set to win
		// $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
		game.audio.audioMenang.play();
		game.scorm_helper.setStatus("passed");
		$(".btn-next-result").css({"display":"block"});
		$(".slider-content").addClass("win");
		$(".slider-content").css($this.win["background"]);
		$(".ribbon_result .ribbon_win").attr("src","assets/image/result/"+$this.win["ribbon_image"]);
		$(".ribbon_result .title-result").html($this.win["ribbon_text"]);
		$(".ribbon_result .title-result").css("color",$this.win["ribbon_color"]);
		$(".div_header").css("background",$this.win["ribbon_background"]);
		//set image
		let flag_video = 0;	
		if($this.lose["type"] != undefined){
			if($this.lose["type"] == "video"){
				flag_video = 1;
			}
		}

		if(flag_video == 1){
			$(".img-result-wrapper .img-menang").hide();
			let clone_video = $(".video_slider").clone();
			$(".video_slider").remove();
			$(".img-result-wrapper").append(clone_video);
			$(clone_video).find("source").attr("src","assets/image/result/"+$this.win["image"]);
			$(clone_video).show();
		}else{
			$(".img-result-wrapper .img-menang img").attr("src","assets/image/result/"+$this.win["image"]);
		}

		// $(".result_wrapper.win_wapper").css("background",$this.win["background_text"]);
		$(".result_wrapper.win_wapper .desc").html($this.win["text"]);
		$(".result_wrapper.win_wapper .desc").css("color",$this.win["color"]);
		$(".result_wrapper.win_wapper").css("color",$this.win["color"]);
		$(".slider-content.win").css("color",$this.win["color"]);
		$(".button").html($this.win["button_text"]);
		$(".button").css($this.win["button_css"]);
		// go to next slide
		$(".btn-next-result").click(function(e){
			// game.audio.audioButton.play();
			let src = "assets/audio/sound_button_result.wav";
			game.audio.audio_dynamic(src).play();
			//$(this).off();
			if($this.win["gotoSlide"] != undefined){
				game.setSlide($this.lose["gotoSlide"]);
			}else{
				setTimeout(function(){
					try{
						var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
						btn_back.click();
					}
					catch(e){
						top.window.close();
					}
				},1000);
			}
		});
	}
	else{
		// set to lose
		// $(".slider-content").css({"background":"url('assets/image/result/bg-lose.png') no-repeat center","background-size":"cover"});
		game.scorm_helper.setStatus("failed");
		game.audio.audioKalah.play();
		$(".btn-tryagain").css({"display":"block"});
		$(".slider-content").addClass("lose");
		$(".slider-content").css($this.lose["background"]);
		$(".ribbon_result .ribbon_lose").attr("src","assets/image/result/"+$this.lose["ribbon_image"]);
		$(".ribbon_result .title-result").html($this.lose["ribbon_text"]);
		$(".ribbon_result .title-result").css("color",$this.lose["ribbon_color"]);
		$(".div_header").css("background",$this.lose["ribbon_background"]);
		//set image
		let flag_video = 0;	
		if($this.lose["type"] != undefined){
			if($this.lose["type"] == "video"){
				flag_video = 1;
			}
		}

		if(flag_video == 1){
			$(".img-result-wrapper .img-kalah").hide();
			let clone_video = $(".video_slider").clone();
			$(".video_slider").remove();
			$(".img-result-wrapper").append(clone_video);
			$(clone_video).find("source").attr("src","assets/image/result/"+$this.lose["image"]);
			$(clone_video).show();
		}else{
			$(".img-result-wrapper .img-kalah img").attr("src","assets/image/result/"+$this.lose["image"]);
		}

		// $(".result_wrapper.lose_wapper").css("background",$this.lose["background_text"]);
		$(".result_wrapper.lose_wapper .desc").html($this.lose["text"]);
		$(".result_wrapper.lose_wapper .desc").css("color",$this.lose["color"]);
		$(".result_wrapper.lose_wapper").css("color",$this.lose["color"]);
		$(".slider-content.lose").css("color",$this.lose["color"]);
		// $(".button").html($this.lose["button_text"]);
		// $(".button").css($this.lose["button_css"]);

		console.log($this.lose);
		if($this.lose["button_2"] != undefined){
			//set btn-game
			$(".btn-game").html($this.lose["button"]["text"]);
			$(".btn-game").css($this.lose["button"]["css"]);
			$(".btn-game").show();
			// $(".btn-game").addClass("btn-tryagain-result");
			if($this.lose["button"]["gotoSlide"] != undefined){
				$(".btn-game").unbind().click(function(){
					let src = "assets/audio/sound_button_result.wav";
					game.audio.audio_dynamic(src).play();
					//set ldata quiz
					console.log(game.scorm_helper.ldata);
					game.scorm_helper.ldata = {};
					console.log(game.scorm_helper.ldata);

					//set game_data
					// let arr_temp = {
					// 	"slide": 3,
					// 	"total_soal_current_slide": $this.game_data["total_soal_current_slide"]
					// }

					// $this.game_data = arr_temp;
					// game.game_data = $this.game_data;

					game.setSlide($this.lose["button"]["gotoSlide"]);
				});
			}
			$(".btn-game-2").html($this.lose["button_2"]["text"]);
			$(".btn-game-2").css($this.lose["button_2"]["button_css"]);
			// $(".btn-game-2").addClass("btn-tryagain-result");
			$(".btn-game-2").show();
		}else{
			$(".button").html($this.lose["button_text"]);
			$(".button").css($this.lose["button_css"]);
			$(".button").addClass("btn-tryagain-result");
		}

		// click try again button
		$(".btn-tryagain").click(function(e){
			// game.audio.audioButton.play();
			let src = "assets/audio/sound_button_result.wav";
			game.audio.audio_dynamic(src).play();
			//$(this).off();

			if($this.lose["button_2"]["gotoSlide"] != undefined){
				game.setSlide($this.lose["button_2"]["gotoSlide"]);
			}else{
				setTimeout(function(){
					try{
						var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
						btn_back.click();
					}
					catch(e){
						top.window.close();
					}
				},1000);
			}
		});
	}

	// set star
	var flag=0;
	var count_star=0;

	var time_star = setInterval(function() {
		count_star++;
		if(count_star<=game.max_score){
			if(count_star<=score){
				$(".star-wrapper .star:nth-child("+count_star+")").addClass("active");	
			}
			$(".star-wrapper .star:nth-child("+count_star+")").fadeIn(1000);
			$(".star-wrapper .star:nth-child("+count_star+")").css({"display":"inline-block"});
			
		}
		else{
			clearInterval(time_star);
		}
	},200);
};