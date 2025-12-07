var Chapter = function() {

}

Chapter.prototype.init = function(current_settings) {
	var $this = this
	$this.current_settings = current_settings;
	$this.gamedata = game.scorm_helper.getSingleData('game_data');
	$this.total_soal = 0;
	$this.total_step = 0;
	$this.game_click = game.scorm_helper.getSingleData("game_click");
	$this.game_click = ($this.game_click != undefined ? $this.game_click : {});
	$this.idxClick = ($this.game_click["idxClick"] != undefined ? $this.game_click["idxClick"] : []);
	$this.currChapter = ($this.game_click["currChapter"] != undefined ? $this.game_click["currChapter"] : undefined);
	$this.stage = $(".stage").first().clone();
	$this.image_path = "modul/digital_comic/image";
	$(".stage_wrapper").html("");
	$.get("modul/digital_comic/setting_chapter_slide_" + $this.current_settings["slide"] + ".json", function(e) {
		$this.background = e["background"];
		$this.itemsrow = e["items_row"];
		$this.items = e["items"];
		$this.button = e["button"];
		$this.settings = e["settings"];

		//count step
		$this.step_data = e["items"];
		$this.total_step = $this.step_data.length;
		game.total_step = $this.total_step;
		$this.tutorial_data = e["list_tutorial"];

		if (game.flag_show_tutorial == 0) {
			game.flag_show_tutorial = 1;
			$this.showTutorial();
		}

		$this.setData();
		$("html").css({
			"background-image": "url('modul/digital_comic/image/dc/chapter-1/bg2.jpg')",
			"background-size": "cover",
			"background-repeat": "no-repeat"
		});
	}, "json");
};

/*Function get total soal from all stage*/
Chapter.prototype.get_total_soal = function() {
	var $this = this;
	$this.total_soal = game.total_soal;

	if ($this.total_soal == 0) {
		for (var i = 0; i < $this.total_step; i++) {
			let no = $this.current_settings["slide"] + (i + 1);
			const no_2 = i;
			$.get("config/setting_quiz_slide_" + no + ".json", function(e3) {
				$this.total_soal += e3["list_question"].length;
				game.total_soal = $this.total_soal;

				if (($this.total_step - 1) == no_2) {
					$this.setData();
				}
			}, 'json');
		}
	} else {
		$this.setData();
	}
};

Chapter.prototype.setData = function() {
	var $this = this;
	var $col = 12 / $this.itemsrow;
	var $mod = $this.items.length % 2;
	$(".header").show();
	if ($this.gamedata == undefined) {
		$this.curr_step = 0;
		$this.life = game.life_max;
	} else {
		$this.curr_step = $this.gamedata["curr_step"] != undefined ? $this.gamedata["curr_step"] : 0;
		$this.life = ($this.gamedata["last_life"] != undefined ? $this.gamedata["last_life"] : game.life_max);
	}



	/*Function set timer global*/
	if (game.time_global == true) {
		if (game.start_timer_global == 0) {
			game.startTimerGlobal();
		}
	} else {
		$(".timer").hide();
	}
	/*End function set timer global*/



	$(".slider-content").css($this.background);
	$(".button_wrapper").find(".button_finish").html($this.button["text"]);
	$(".button_wrapper").find(".button_finish").css($this.button["css"]);
	$(".button_finish").unbind().click(function(e) {
		if (!$(this).hasClass("disabled")) {
			$(this).off();
			let src = "assets/audio/sound_button_chapter.wav";
			let audio_dynamic = game.audio.audio_dynamic(src);
			audio_dynamic.play();
			game.setSlide($this.button["gotoslide"])
		}
	});

	for (var i = 0; i < $this.items.length; i++) {
		var $clone = $this.stage.clone();
		$($clone).attr("index", i + 1);
		$($clone).attr("name", $this.items[i]);
		$($clone).addClass("col-xs-" + $col);
		if (i == $this.items.length - 1 && $mod != 0 && $this.itemsrow > 1) {
			$($clone).addClass("centered");
		}
		$($clone).find(".img_stage").attr("src", $this.image_path + "/stage_chapter/" + $this.items[i]["default"]);

		let complete_stage_arr = ($this.gamedata != undefined ? $this.gamedata["complete_stage"] : []);
		$($clone).addClass("canclick");
		if ($this.gamedata != undefined) {
			if ($this.gamedata["complete_stage"] != undefined) {
				var complete = $this.gamedata["complete_stage"];
				var failed = $this.gamedata["failed_stage"];

				for (var j = 0; j < complete.length; j++) {
					if (complete[j] == $($clone).attr("index")) {
						$($clone).addClass("complete");
						$($clone).removeClass("canclick");
					}
				}

			}
		}

		if ($this.idxClick.length == $this.items.length) {
			$(".button_wrapper").find(".button_finish").removeClass("disabled");
		} else {
			$(".button_wrapper").find(".button_finish").addClass("disabled");
		}

		if ($($clone).hasClass("complete")) {
			$($clone).find(".img_stage").attr("src", $this.image_path + "/stage_chapter/" + $this.items[i]["complete"]);
			$($clone).unbind().click(function(e) {

				let index = $(this).attr("index");

				let a = $this.current_settings["slide"] + parseInt(index);
				if ($this.gamedata == undefined) {
					$this.gamedata = {};
				} else {

				}

				$this.gamedata["curr_stage"] = parseInt(index);
				game.scorm_helper.setSingleData("game_data", $this.gamedata);

				game.setSlide(a);
			});
		} else if ($($clone).hasClass("failed")) {
			$($clone).find(".img_stage").attr("src", $this.image_path + "/stage_chapter/" + $this.items[i]["failed"]);
		} else if ($($clone).hasClass("canclick")) {
			$($clone).unbind().click(function(e) {

				let index = $(this).attr("index");

				let a = $this.current_settings["slide"] + parseInt(index);
				if ($this.gamedata == undefined) {
					$this.gamedata = {};
				} else {

				}

				if ($this.idxClick.indexOf(index) == -1) {
					$this.idxClick.push(index);
				}

				for (let l = 0; l < $this.idxClick.length; l++) {
					let index_1 = parseInt($this.idxClick[l]);
					$('.stage[index=' + index_1 + '] .badge_wrapper').hide();
				}
				$this.currChapter = index;

				$this.gamedata["curr_stage"] = parseInt(index);
				game.scorm_helper.setSingleData("game_data", $this.gamedata);

				game.nextSlide();

				$this.game_click["idxClick"] = $this.idxClick;
				$this.game_click["currChapter"] = $this.currChapter;
				game.scorm_helper.setSingleData("game_click", $this.game_click);
			});
		} else {
			$($clone).addClass("lock");
			$($clone).append("<img class='padlock' src=$this.image_path+'/stage_chapter/gembok.png'>");
		}
		//set unread notification
		if ($this.settings["notif"] != undefined) {
			if ($this.settings["notif"] != "") {
				$($clone).find(".badge_wrapper").show();
			}
		}
		$(".stage_wrapper").append($clone);
	}
	for (let l = 0; l < $this.idxClick.length; l++) {
		let index_1 = parseInt($this.idxClick[l]);
		$('.stage[index=' + index_1 + '] .badge_wrapper').hide();
	}

};

Chapter.prototype.setLife = function() {
	var $this = this;
	var count_star = 0;

	$(".header .star-wrapper").show();
	$(".star-wrapper .star").removeClass('canclick');
	var time_star = setInterval(function() {
		count_star++;
		if (count_star <= game.life_max) {
			if (count_star <= $this.life) {
				$(".star-wrapper .star:nth-child(" + count_star + ")").addClass("canclick");
			}
			$(".star-wrapper .star:nth-child(" + count_star + ")").fadeIn(1000);
			$(".star-wrapper .star:nth-child(" + count_star + ")").css({
				"display": "inline-block"
			});
		} else {
			clearInterval(time_star);
		}
	}, 200);
};

Chapter.prototype.showTutorial = function() {
	$("#tutorial").modal({
		backdrop: 'static',
		keyboard: true,
		show: true
	});
	$("#tutorial .tutorial.snake").show();
	$("#tutorial .img_tutorial").hide();
	$("#tutorial .description").css({
		"border-radius": "16px",
		"background": "#0F1F2B"
	});
	$("#tutorial .description p").css({
		"margin": "7vh 0 15vh 0",
		"color": "#EC953E"
	});
	$("#tutorial .start-game").click(function(e) {
		game.audio.audioButton.play();
		$("#tutorial").modal("hide");
	});
}