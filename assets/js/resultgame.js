/**
* this is a class for generate game results either star or score.
* @class
* @author     NejiElYahya
*/

var ResultGame = function(){

}


ResultGame.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$.get("config/setting_result_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.score = e["score"];
		$this.arr_game_slide = e["game_slide"];
		$this.back_slide = e["back_slide"];
		$this.perfect = e["perfect"];
		$this.win = e["win"];
		$this.lose = e["lose"];
		$this.setResult();
	},'json');
};

ResultGame.prototype.setResult = function() {
	var $this = this;
	// remove jquery mobile
	$("html").removeClass("ui-mobile");
	/*comment by elim*/
	if(game.scorm_helper.getSingleData("score") == undefined){
		if($this.arr_game_slide){
			var arr = [];
			for (var i = 0; i < $this.arr_game_slide.length; i++) {
				arr.push("game_slide_"+$this.arr_game_slide[i]);
			}
			var game_quiz = game.scorm_helper.getQuizResult(arr);
		}else{
			var game_quiz = game.scorm_helper.getQuizResult(["game_slide_7"]);
		}
		// count all game score range 0-5 for the star
		var score = parseInt(game_quiz["score"])/parseInt(game_quiz["total_soal"])*game.max_score;
		/*end comment by elim*/
		// count score range 0-100 for save to cmi.raw.score
		var count = score/game.max_score*100;
	}else{
		var score = game.scorm_helper.getSingleData("score");
		var count = game.scorm_helper.getSingleData("score");
	}
	// for score in text
	$(".result_score").html(Math.round(score));
	if($this.score){
		$(".star_wrapper").hide();
		$(".score_wrapper").show();
	}else{
		$(".star_wrapper").show();
		$(".score_wrapper").hide();
	}
	if(!$this.back_slide){
		// save score to to cmi.raw.score
		game.scorm_helper.sendResult(Math.round(count));
		// set duration and save to scorm
		game.scorm_helper.setDuration();
	}
	// if score larger than minimum grade
	if(Math.round(score) == game.max_score){
		// set to win
		// $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
		game.audio.audioMenang.play();
		if(!$this.back_slide){
			game.scorm_helper.setStatus("passed");
		}
		//$(".result_wrapper").css("background","url(assets/image/result/"+$this.win["background"]+") no-repeat center / cover");
		$(".result_wrapper").find("source").attr("src","assets/image/result/"+$this.perfect["background"]);
		$(".result_wrapper #video")[0].load();
		$interval = setInterval(function(){
			if($(".result_wrapper #video")[0].readyState == 4){
				clearInterval($interval);
				$(".result_wrapper #video").show();
				$(".result_wrapper #video")[0].play();
			}
		},100);
		$(".result_wrapper").addClass("win");
		if($this.perfect["ribbon"]){
			$(".ribbon_result img").attr("src","assets/image/result/"+$this.perfect["ribbon"]);
		}else{
			$(".ribbon_result").hide();
		}
		if($this.perfect["score_css"]){
			$(".score_wrapper").css($this.perfect["score_css"]);
		}
		$(".result_wrapper .text_wrapper").html($this.perfect["description"]["text"]);
		if($this.perfect["description"]["css"]){
			$(".result_wrapper .text_wrapper").css($this.perfect["description"]["css"]);
		}
		/*$(".button").html($this.perfect["button"]["text"]);
		if($this.perfect["button"]["button_css"]){
			$(".button").css($this.perfect["button"]["button_css"]);
		}*/
		//$(".button").addClass("btn-next-result");
		// go to next slide
		$(".btn_restart").hide();
		if($this.back_slide){
			$(".btn_quit").html("NEXT");
		}
		$(".btn_quit").click(function(e){
			game.audio.audioButton.play();
			//$(this).off();
			if($this.back_slide){
				game.setSlide($this.back_slide);
			}else{
				try{
		            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
		            btn_back.click();
		        }
		        catch(e){
		            top.window.close();
		        }
	    	}
		});
	}
	else if(Math.round(score) >= game.min_score){
		// set to win
		// $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
		game.audio.audioMenang.play();
		if(!$this.back_slide){
			game.scorm_helper.setStatus("passed");
		}
		game.scorm_helper.setSingleData("restart",true);
		//$(".result_wrapper").css("background","url(assets/image/result/"+$this.win["background"]+") no-repeat center / cover");
		$(".result_wrapper").find("source").attr("src","assets/image/result/"+$this.win["background"]);
		$(".result_wrapper #video")[0].load();
		$interval = setInterval(function(){
			if($(".result_wrapper #video")[0].readyState == 4){
				clearInterval($interval);
				$(".result_wrapper #video").show();
				$(".result_wrapper #video")[0].play();
			}
		},100);
		$(".result_wrapper").addClass("win");
		if($this.win["ribbon"]){
			$(".ribbon_result img").attr("src","assets/image/result/"+$this.win["ribbon"]);
		}else{
			$(".ribbon_result").hide();
		}
		if($this.win["score_css"]){
			$(".score_wrapper").css($this.win["score_css"]);
		}
		$(".result_wrapper .text_wrapper").html($this.win["description"]["text"]);
		if($this.win["description"]["css"]){
			$(".result_wrapper .text_wrapper").css($this.win["description"]["css"]);
		}
		/*$(".button").html($this.win["button"]["text"]);
		if($this.win["button"]["button_css"]){
			$(".button").css($this.win["button"]["button_css"]);
		}*/
		//$(".button").addClass("btn-next-result");
		// go to next slide
		$(".btn_restart").hide();
		$(".btn_restart").click(function(e){
			$(this).off();
			game.audio.audioButton.play();
			game.setSlide(7);
		});
		if($this.back_slide){
			$(".btn_quit").html("NEXT");
		}
		$(".btn_quit").click(function(e){
			game.audio.audioButton.play();
			//$(this).off();
			if($this.back_slide){
				game.setSlide($this.back_slide);
			}else{
				try{
		            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
		            btn_back.click();
		        }
		        catch(e){
		            top.window.close();
		        }
	    	}
		});
	}
	else{
		// set to lose
		// $(".slider-content").css({"background":"url('assets/image/result/bg-lose.png') no-repeat center","background-size":"cover"});

		game.audio.audioKalah.play();
		game.scorm_helper.setSingleData("restart",true);
		//$(".result_wrapper").css("background","url(assets/image/result/"+$this.lose["background"]+") no-repeat center / cover");
		$(".result_wrapper").find("source").attr("src","assets/image/result/"+$this.lose["background"]);
		$("#video")[0].load();
		$interval = setInterval(function(){
			if($(".result_wrapper #video")[0].readyState == 4){
				clearInterval($interval);
				$(".result_wrapper #video").show();
				$(".result_wrapper #video")[0].play();
			}
		},100);
		$(".result_wrapper").addClass("lose");
		if($this.lose["ribbon"]){
			$(".ribbon_result img").attr("src","assets/image/result/"+$this.lose["ribbon"]);
		}else{
			$(".ribbon_result").hide();
		}
		if($this.lose["score_css"]){
			$(".result_wrapper .score_wrapper").css($this.lose["score_css"]);
		}
		$(".result_wrapper .text_wrapper").html($this.lose["description"]["text"]);
		if($this.lose["description"]["css"]){
			$(".result_wrapper .text_wrapper").css($this.lose["description"]["css"]);
		}
		/*$(".button").html($this.lose["button"]["text"]);
		if($this.lose["button"]["button_css"]){
			$(".button").css($this.lose["button"]["button_css"]);
		}*/
		//$(".button").addClass("btn-tryagain");
		$(".btn_restart").click(function(e){
			$(this).off();
			game.scorm_helper.setSingleData("reset", true);
			console.log("klik");
			game.audio.audioButton.play();
			// game.setSlide(5);
			if ($this.lose["gotoSlide"]) {
				game.setSlide($this.lose["gotoSlide"]);
			}
		});
		// click try again button
		if($this.back_slide){
			$(".btn_quit").html("NEXT");
		}
		$(".btn_quit").click(function(e){
			game.scorm_helper.setStatus("failed");
			game.audio.audioButton.play();
			//$(this).off();
			if($this.back_slide){
				game.setSlide($this.back_slide);
			}else{
				try{
		            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
		            btn_back.click();
		        }
		        catch(e){
		            top.window.close();
		        }
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
				$(".star_wrapper .star:nth-child("+count_star+")").addClass("active");
			}
			$(".star_wrapper .star:nth-child("+count_star+")").fadeIn(1000);
		}
		else{
			clearInterval(time_star);
		}
	},200);
};
