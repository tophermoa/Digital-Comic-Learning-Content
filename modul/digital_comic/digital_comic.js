var DigitalComic = function() {

}

DigitalComic.prototype.init = function(current_settings) {
	$this = this;


	$this.gamedata = game.scorm_helper.getSingleData('game_data');
	$this.gamedata = ($this.gamedata == undefined ? [] : $this.gamedata);
	$this.curr_stage = ($this.gamedata["curr_stage"] == undefined ? 1 : $this.gamedata["curr_stage"]);

	$this.game_click = game.scorm_helper.getSingleData("game_click");
	$this.game_click = ($this.game_click != undefined ? $this.game_click : {});
	$this.currChapter = ($this.game_click["currChapter"] != undefined ? $this.game_click["currChapter"] : 1);
	$this.mq_data = ($this.game_click["mq_data_" + $this.currChapter] != undefined ? $this.game_click["mq_data_" + $this.currChapter] : {});
	$this.mq_data["comic"] = ($this.mq_data["comic"] != undefined ? $this.mq_data["comic"] : undefined);
	$this.current_settings = current_settings;
	$this.comic_items = $(".comic_items").first().clone();
	$this.background = $(".comic_bg").first().clone();
	$this.box = $(".box").first().clone();
	$this.title = $(".rb-wrap").first().clone();
	$this.mini_quiz = $(".slider-content").first().clone();
	$this.$pilihan_clone = $(".slider-content").find(".pilihan").first().clone();
	$this.category_wrap = $(".slider-content").find(".category").first().clone();
	$this.button = $(".button").first().clone();
	$this.image_path = "modul/digital_comic/image";
	$this.slide_game_map = 0;
	$this.delay;
	$this.timeout;
	$this.start = ($this.mq_data["start"] != undefined ? $this.mq_data["start"] : 0);
	$this.arr_alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	$(".comic_wrapper").html("");

	$.get("modul/digital_comic/setting_dc_slide_" + $this.current_settings["slide"] + ".json", function(e) {
		$this.list_bg = e["list_bg"];
		$this.list_box = e["list_box"];
		$this.settings = (e["settings"] != undefined ? e["settings"] : {});
		$this.jsondata;
		if ($this.game_click["mq_data_" + $this.currChapter] != undefined) {
			$this.jsondata = $this.game_click["mq_data_" + $this.currChapter]["comic"];
		} else {
			$this.jsondata = $this.list_bg;
		}
		//set audio background
		game.audio.audioBackground.src = "modul/digital_comic/audio/" + $this.list_bg[(parseInt($this.currChapter)-1)]["audio"];
		game.audio.audioBackground.loop = true;
		game.audio.audioBackground.play();
		
		$(".gesture_wrapper").css("height","100vh");
		$this.setBG();
		$("html").css({
			"background-image": "url('modul/digital_comic/image/dc/chapter-1/bg2.jpg')",
			"background-size": "cover",
			"background-repeat": "no-repeat"
		});
	}, "json");
};


DigitalComic.prototype.setFeedback = function(dataquiz, flag) {
	var $this = this;

	if (flag == 1) {

		for (var i = 0; i < dataquiz["list_feedback"].length; i++) {
			$clone = $this.comic_items.clone();
			$clone.html("");

			if (dataquiz["list_feedback"][i]["feedback_box"]) {
				for (j = 0; j < dataquiz["list_feedback"][i]["feedback_box"].length; j++) {
					$clone_box = $this.box.clone();
					if (dataquiz["list_feedback"][i]["feedback_box"][j]["fade"]) {
						$clone_box.attr("data-aos", "fade-" + dataquiz["list_feedback"][i]["feedback_box"][j]["fade"]);
					}
					if (dataquiz["list_feedback"][i]["feedback_box"][j]["delay"]) {
						$clone_box.attr("data-aos-delay", dataquiz["list_feedback"][i]["feedback_box"][j]["delay"]);
					}
					$clone_box.css(dataquiz["list_feedback"][i]["feedback_box"][j]["position"]);

					//feedback_box image
					if (dataquiz["list_feedback"][i]["feedback_box"][j]["image"]) {
						$clone_box.find(".img_box").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + dataquiz["list_feedback"][i]["feedback_box"][j]["image"]);
					} else {
						$clone_box.find(".img_box").remove();
					}
					if (dataquiz["list_feedback"][i]["feedback_box"][j]["text"]) {
						$clone_box.find("p").html(dataquiz["list_feedback"][i]["feedback_box"][j]["text"]["text"]);
						$clone_box.find("p").css(dataquiz["list_feedback"][i]["feedback_box"][j]["text"]["css"]);
					} else {
						$clone_box.find("p").remove();
					}
					if (dataquiz["list_feedback"][i]["feedback_box"][j]["seru_mark"] != undefined && dataquiz["list_feedback"][i]["feedback_box"][j]["seru_mark"] != false) {
						
					} else {
						$clone_box.find(".seru_mark").remove();
					}
					$clone.attr("feedback", dataquiz["idx"])

					$clone.append($clone_box);
				}
			}

			$clone_bg = $this.background.clone();
			$clone.append($clone_bg);
			$clone.find(".comic_bg").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + dataquiz["list_feedback"][i]["background"]);
			$(".comic_wrapper").append($clone);
		}
		setTimeout(() => {
			var reverse = dataquiz["list_feedback"].reverse();
			for (var u = 0; u < reverse.length; u++) {
				for (let l = 0; l < $this.mq_data["comic"].length; l++) {
					if ($this.mq_data["comic"][l]["mini_quiz"]) {
						if ($this.mq_data["comic"][l]["mini_quiz"]["idx"] == dataquiz["idx"]) {
							$this.mq_data["comic"].splice((l + 1), 0, reverse[u]);
						}
					}
				}
			}
		}, 600);


		setTimeout(() => {
			$this.setBG()
		}, 800);
		$this.initAos();
	} else {

		$clone = $this.comic_items.clone();
		$clone.html("");

		if (dataquiz["feedback_box"]) {
			for (j = 0; j < dataquiz["feedback_box"].length; j++) {
				$clone_box = $this.box.clone();
				if (dataquiz["feedback_box"][j]["fade"]) {
					$clone_box.attr("data-aos", "fade-" + dataquiz["feedback_box"][j]["fade"]);
				}
				if (dataquiz["feedback_box"][j]["delay"]) {
					$clone_box.attr("data-aos-delay", dataquiz["feedback_box"][j]["delay"]);
				}
				$clone_box.css(dataquiz["feedback_box"][j]["position"]);

				//feedback_box image
				if (dataquiz["feedback_box"][j]["image"]) {
					$clone_box.find("img").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + dataquiz["feedback_box"][j]["image"]);
				} else {
					$clone_box.find("img").remove();
				}
				if (dataquiz["feedback_box"][j]["text"]) {
					$clone_box.find("p").html(dataquiz["feedback_box"][j]["text"]["text"]);
					$clone_box.find("p").css(dataquiz["feedback_box"][j]["text"]["css"]);
				} else {
					$clone_box.find("p").remove();
				}
				if (dataquiz["feedback_box"][j]["seru_mark"] != undefined && dataquiz["feedback_box"][j]["seru_mark"] != false) {
					
				} else {
					$clone_box.find(".seru_mark").remove();
				}
				$clone.attr("feedback", dataquiz["idx"])

				$clone.append($clone_box);
			}
		}

		$clone_bg = $this.background.clone();
		$clone.append($clone_bg);
		$clone.find(".comic_bg").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + dataquiz["background"]);
		$(".comic_wrapper").append($clone);
	}
}

DigitalComic.prototype.initAos = function() {
	var $this = this;

	setTimeout(function() {
		AOS.init();
	}, 1000);
}

DigitalComic.prototype.setBG = function() {
	$this = this;

	if (game.checkDevice() == "on-desktop"){
		$(".body-wrapper").addClass("on-desktop")
	} else {
		$(".body-wrapper").removeClass("on-desktop")
	}


	if ($("#body").hasClass("modal-open")) {
		$("#body").removeClass("modal-open");
	}
	var showbacktotop = false;
	var start = $this.start != 0 ? $this.start : 0;
	var chapter = undefined;

	var array = [];
	for (let q = 0; q < $this.jsondata.length; q++) {
		if ($this.jsondata[q]["chapter"]) {
			chapter = $this.jsondata[($this.currChapter - 1)]["data"];
		} else {
			chapter = $this.jsondata;
		}
	}

	for (var y = start; y < chapter.length; y++) {
		array.push(chapter[y]);

		if (chapter[y]["mini_quiz"]) {
			if (chapter[y]["mini_quiz"]["jawaban_click"] == undefined) {
				$this.start = (1 + y + chapter[y]["mini_quiz"]["list_feedback"].length);
				break;
			}
		}
	}

	$this.mq_data["comic"] = chapter;
	$this.game_click["mq_data_" + $this.currChapter] = $this.mq_data;

	game.scorm_helper.setSingleData("game_click", $this.game_click);

	for (i = 0; i < array.length; i++) {
		$clone = $this.comic_items.clone();
		$clone.html("");
		if (array[i]["feedback_box"]) {
			$this.setFeedback(array[i], 0);
		} else {
			if (array[i]["list_box"]) {
				for (j = 0; j < array[i]["list_box"].length; j++) {
					$clone_box = $this.box.clone();
					if (array[i]["list_box"][j]["fade"]) {
						$clone_box.attr("data-aos", "fade-" + array[i]["list_box"][j]["fade"]);
					}
					if (array[i]["list_box"][j]["delay"]) {
						$clone_box.attr("data-aos-delay", array[i]["list_box"][j]["delay"]);
					}
					$clone_box.css(array[i]["list_box"][j]["position"]);
					
					if (array[i]["list_box"][j]["timeout"]) {
						$clone_box.addClass("timeout");
						setTimeout(() => {
							$clone_box.removeClass("timeout");
						}, array[i]["list_box"][j]["timeout"]);
					}

					//list_box image
					if (array[i]["list_box"][j]["image"]) {
						$clone_box.find(".img_box").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + array[i]["list_box"][j]["image"]);
					} else {
						$clone_box.find(".img_box").remove();
					}
					if (array[i]["list_box"][j]["text"]) {
						$clone_box.find("p").html(array[i]["list_box"][j]["text"]["text"]);
						$clone_box.find("p").css(array[i]["list_box"][j]["text"]["css"]);
					} else {
						$clone_box.find("p").remove();
					}
					if (array[i]["list_box"][j]["seru_mark"] != undefined && array[i]["list_box"][j]["seru_mark"] != false) {
						
					} else {
						$clone_box.find(".seru_mark").remove();
					}
					$clone.append($clone_box);
				}
			}



			if (array[i]["mini_quiz"]) {
				$mini_quiz = $this.mini_quiz.clone();
				$mini_quiz.hide();

				// remove all content
				$mini_quiz.find(".pilihan_wrapper").html("");
				$mini_quiz.find(".category_wrapper").html("");

				// if image is available -> setting image
				if (array[i]["mini_quiz"]["image"]) {
					$mini_quiz.find("#img_soal").show();
					$mini_quiz.find("#img_soal").attr("src", "assets/image/game_quiz/list_img/" + array[i]["mini_quiz"]["image"]);
				} else {
					$mini_quiz.find("#img_soal").hide();
				}

				if (array[i]["mini_quiz"]["quiz_css"]) {
					$mini_quiz.css(array[i]["mini_quiz"]["quiz_css"]);
				}

				$($mini_quiz).addClass(array[i]["mini_quiz"]["type"]);
				if (array[i]["mini_quiz"]["type"] != "tf") {
					$($mini_quiz).find(".pilihan_jawaban_wrapper").addClass(array[i]["mini_quiz"]["type"]);
				} else {
					$($mini_quiz).find(".pilihan_jawaban_wrapper").remove();
				}

				if (array[i]["mini_quiz"]["title"]) {
					$mini_quiz.find(".text_question .ribbon-content").html(array[i]["mini_quiz"]["title"]["text"]);
					$mini_quiz.find(".text_question .ribbon_header.red").css(array[i]["mini_quiz"]["title"]["css"]);
				}

				if (array[i]["mini_quiz"]["type"] == "mc" ||
					array[i]["mini_quiz"]["type"] == "mmc" ||
					array[i]["mini_quiz"]["type"] == "dadsequence" ||
					array[i]["mini_quiz"]["type"] == "dadseqcat" ||
					array[i]["mini_quiz"]["type"] == "tf" ||
					array[i]["mini_quiz"]["type"] == "judge") {
					// setting question
					if (array[i]["mini_quiz"]["question"]) {
						$mini_quiz.find(".text_question .soal").html(array[i]["mini_quiz"]["question"]);
					} else {
						$mini_quiz.find(".text_question").hide();
					}

					// random pilihan
					var arr_temp = [];
					var arr_rand = [];

					for (var k = 0; k < array[i]["mini_quiz"]["pilihan"].length; k++) {
						arr_temp.push(k);
					}

					for (var k = 0; k < array[i]["mini_quiz"]["pilihan"].length; k++) {
						var rand = Math.floor((Math.random() * (arr_temp.length - 1)));
						arr_rand.push(arr_temp[rand]);
						arr_temp.splice(rand, 1);
					}

					if (array[i]["mini_quiz"]["type"] != "tf") {
						$mini_quiz.find(".pilihan_wrapper").removeClass('hide');
						for (var k = 0; k < arr_rand.length; k++) {
							$app_pilihan = $this.$pilihan_clone.clone();
							$app_category = $this.category_wrap.clone();

							$app_pilihan.find(".txt_pilihan").html(array[i]["mini_quiz"]["pilihan"][arr_rand[k]]["text"]);
							$app_pilihan.attr("index", array[i]["mini_quiz"]["pilihan"][arr_rand[k]]["index"]);
							$($app_pilihan).addClass(array[i]["mini_quiz"]["type"]);
							if (array[i]["mini_quiz"]["type"] != "dadsequence") {
								$($app_pilihan).find(".bul_abjad").html($this.arr_alphabet[k]);
							} else {
								$($app_pilihan).find(".bul_abjad").html(k + 1);
								$($app_pilihan).find(".bul_abjad").show();
							}
							if (array[i]["mini_quiz"]["type"] == "judge") {
								$($app_pilihan).find(".bullet").hide();
								$($app_pilihan).css("text-align", "center");
							}

							$mini_quiz.find(".pilihan_wrapper").append($app_pilihan);


						}
					} else {
						$mini_quiz.find(".truefalse_wrapper").removeClass('hide');

						var flagTrueFalseText = 1;
						if (flagTrueFalseText == 1) {
							$mini_quiz.find(".btn-standard--true").html(array[i]["mini_quiz"]["pilihan"][0]["text"]);
							$mini_quiz.find(".btn-standard--false").html(array[i]["mini_quiz"]["pilihan"][1]["text"]);
						}
					}
				}


				if (array[i]["background-color"]) {
					$mini_quiz.css("background-color", array[i]["background-color"]);
				}
				if (array[i]["background-image"]) {
					$mini_quiz.css({
						"background-image": "url('modul/digital_comic/image/dc/chapter-" + $this.curr_stage + "/" + array[i]["background-image"] + "')",
						"background-size": "100%",
						"background-repeat": "no-repeat"
					});
				}

				if (array[i]["background-color-cut"]) {
					$clone.css("background-color", array[i]["background-color-cut"]);
				}

				if (array[i]["mini_quiz"]["title"]) {
					var rb_height = $($mini_quiz).find(".ribbon_header").innerHeight();
					if (array[i]["mini_quiz"]["image"]) {
						var pd_img_rb = $($mini_quiz).find(".ribbon_header").innerHeight() - 20;
						$($mini_quiz).find("#img_soal").css("margin-top", pd_img_rb + "px");
					} else {
						if (array[i]["mini_quiz"]["type"] == "mc") {

						} else {
							$($mini_quiz).find(".place_question").css({
								"background": "none"
							});
						}
						$($mini_quiz).find(".rb-wrap").css({
							"position": "relative"
						});
					}
				}
				if (array[i]["mini_quiz"]["type"] == "tf" || array[i]["mini_quiz"]["type"] == "judge") {
					$($mini_quiz).find(".place_question").css({
						"height": "100%"
					});
				}
				$clone.append($mini_quiz);
				setTimeout(() => {
					$mini_quiz.show();
				}, 800);
				$this.settingPage($mini_quiz, array[i]["mini_quiz"]);

			}

			if (array[i]["button"]) {
				$clone_button = $this.button.clone();
				$clone_button.html(array[i]["button"]["text"]);
				$clone_button.css(array[i]["button"]["position"]);
				$clone.append($clone_button);
				showbacktotop = true;
				$clone_button.unbind().click(function(e) {
					game.audio.audioBackground.pause();
					game.audio.audioBackground.currentTime = 0;
					game.setSlide($this.settings["next_slide"]);
				});
			}
			if (showbacktotop == true) {
				$(".back_up").show();
			}
			$clone_bg = $this.background.clone();
			$clone.append($clone_bg);
			if (array[i]["background"]) {
				$clone.find(".comic_bg").attr("src", $this.image_path + "/dc/chapter-" + $this.curr_stage + "/" + array[i]["background"]);
			} else {
				$clone.find(".comic_bg").remove();
			}
			$(".comic_wrapper").append($clone);
		}

	}
	setTimeout(() => {
		$(".comic_items").each(function(){
			$(this).removeClass("hide");
		});
	}, 200);


	$(".back_up").unbind().click(function(e) {
		var body = $("html, body");
		body.stop().animate({
			scrollTop: 0
		}, 1500, 'swing', function() {});
	});
	if (game.scorm_helper.getSingleData("hammer") != undefined) {
		if ($this.delay == undefined || $this.delay == 0) {
			$(".gesture_wrapper").hide();
			$("#gw-0").hide();
			$("#gw-1").hide();
			$("#gw-2").hide();
			$("#gw-1 img").attr("src", "");
			$("#gw-2 img").attr("src", "");
		} else {
			$this.timeout = setTimeout(() => {
				$(".gesture_wrapper").hide();
				$("#gw-0").hide();
				$("#gw-1").hide();
				$("#gw-2").hide();
				$("#gw-1 img").attr("src", "");
				$("#gw-2 img").attr("src", "");
			}, 3000);
		}
	}

	var gesture_0 = new Hammer(document.getElementById('gw-0'));
	gesture_0.get('swipe').set({
		direction: Hammer.DIRECTION_VERTICAL
	});
	setTimeout(() => {
		$(".gesture_wrapper").hide();
		$(".gesture_wrapper").find("#gw-0").hide();
	}, 5000);
	gesture_0.on("swipe", function(ev) {


		$("#gw-0").hide();
		$(".back_up").hide();
		game.scorm_helper.setSingleData("hammer", 1);
		$("html, body").stop().animate({
			scrollTop: 500
		}, 500, 'swing', function() {});
		setTimeout(() => {
			$(".gesture_wrapper").hide();
		}, 500);
	});
	$this.initAos();
};

DigitalComic.prototype.settingPage = function($clone, data) {
	var $this = this;

	$clone.find(".button_wrapper").css("opacity", 1);


	if (data["type"] == "tf") {
		if (data["next_button"] == undefined || data["next_button"]) {
			$clone.find(".btn-submit").hide();
			$clone.find(".next-soal").show();
			$clone.find(".next-soal").attr("disabled", "disabled");
		} else {
			$($clone).find(".button_wrapper").hide();
		}
		if (data["jawaban_click"] != undefined) {
			$($clone).find(".truefalse_wrapper .btn-standard").each(function(index) {
				if (data["jawaban_click"].charAt(0) == "+") {
					if ($(this).attr("index") == data["jawaban_click"].charAt(1)) {
						$(this).addClass("selected right");
						$(this).css("background", "#61DEA8");
					}
				} else if (data["jawaban_click"].charAt(0) == "-") {
					if ($(this).attr("index") == data["jawaban_click"].charAt(1)) {
						$(this).addClass("selected wrong");
						$(this).css("background", "#FF5D57");
					}
				}
			});
		} else {
			$clone.find(".truefalse_wrapper .btn-standard--true").click(function(e) {
				$(this).off();
				$(this).css('background', '#00C46F');
				$(this).addClass('selected');
				var index = $(this).attr("index");

				$($clone).find(".btn-standard--false").off();
				if (data["next_button"] == undefined || data["next_button"]) {
					$($clone).find(".next-soal").show();
				} else {
					$($clone).find(".next-soal").hide();
				}
				$this.cek_jawaban_miniquiz(index, "tf", data);
			});
			$clone.find(".truefalse_wrapper .btn-standard--false").click(function(e) {
				$(this).off();
				$(this).css('background', '#FF2C24');
				$(this).addClass('selected');
				var index = $(this).attr("index");

				$($clone).find(".btn-standard--true").off();
				if (data["next_button"] == undefined || data["next_button"]) {
					$($clone).find(".next-soal").show();
				} else {
					$($clone).find(".next-soal").hide();
				}
				$this.cek_jawaban_miniquiz(index, "tf", data);
			});
		}
	} else if (data["type"] == "mc" || data["type"] == "judge") {

		$clone.find(".header").css("background", "rgb(247, 245, 255)");

		$clone.find(".btn-submit").hide();
		$clone.find(".next-soal").show();
		$clone.find(".next-soal").attr("disabled", "disabled");
		if (data["jawaban_click"] != undefined) {
			$($clone).find(".pilihan").each(function(index) {
				$(this).off("click");
				if (data["jawaban_click"].charAt(0) == "+") {
					if ($(this).attr("index") == data["jawaban_click"].charAt(1)) {
						$(this).addClass("selected_2 right");
					}
				} else if (data["jawaban_click"].charAt(0) == "-") {
					if ($(this).attr("index") == data["jawaban_click"].charAt(1)) {
						$(this).addClass("selected_2 wrong");
					}
					if ($(this).attr("index") == data["jawaban"][0]) {
						$(this).addClass("right");
					}
				}
			});
		} else {
			$clone.find(".pilihan").click(function(e) {
				$clone.find(".pilihan").off();
				if (!$(this).hasClass("active")) {
					$(this).addClass("active");
					$(this).addClass("selected_2");
				} else {
					$(this).removeClass("active");
				}
				var element = $(this);

				$this.cek_jawaban_miniquiz($clone, "mc", data);
			});
		}
	} else if (data["type"] == "mmc") {
		$clone.find(".btn-submit").attr("disabled", "");
		$clone.find(".bul_abjad").remove();
		if (data["jawaban_click"] != undefined) {
			if (data["jawaban_click"].length > 0) {
				$($clone).find(".pilihan").each(function(index) {
					$(this).off("click");

					for (var i = 0; i < data["jawaban_click"].length; i++) {
						if (data["jawaban_click"][i].charAt(0) == "+") {
							if ($(this).attr("index") == data["jawaban_click"][i].charAt(1)) {
								$(this).addClass("right");
							}
						} else if (data["jawaban_click"][i].charAt(0) == "-") {
							if ($(this).attr("index") == data["jawaban_click"][i].charAt(1)) {
								$(this).addClass("wrong");
							}
							if ($(this).attr("index") == data["jawaban"][i]) {
								$(this).addClass("right");
							}
						}
					}
				});
			}
			$clone.find(".button_wrapper").hide();
		} else {
			$clone.find(".button_wrapper").show();
			$clone.find(".pilihan").click(function(e) {
				if (!$(this).hasClass("active")) {
					$(this).addClass("active");
				} else {
					$(this).removeClass("active");
				}

				//check pilihan, untuk set btn submit
				let flag_selected = 0;
				let selected_options = 0;
				$clone.find(".pilihan").each(function() {
					if ($(this).hasClass("active")) {
						selected_options += 1;
						if (selected_options >= data["jawaban"].length) {
							flag_selected = 1;
						}
					}
				});

				if (flag_selected == 1) {
					$clone.find(".btn-submit").removeAttr("disabled");
					$clone.find(".btn-submit").removeClass("disabled");
				} else {
					$clone.find(".btn-submit").attr("disabled", "");
					$clone.find(".btn-submit").addClass("disabled");
				}
			});
		}
	}
	$($clone).find(".btn-submit").click(function(e) {
		if(!$(this).hasClass("disabled")){
			$($clone).find(".button_wrapper").hide();
			$(this).off();
			$(this).hide();
	
	
	
			$clone.find(".pilihan").off();
			if (data["next_button"] == undefined || data["next_button"]) {
	
			} else {
				$($clone).find(".next-soal").hide();
			}
			$this.cek_jawaban_miniquiz($clone, "mmc", data);
		}

	});


	$($clone).css({
		'visibility': 'visible',
		"height": "100%"
	});
	if (data["image"]) {
		var image = $($clone).find("#img_soal").outerHeight() ? $($clone).find("#img_soal").outerHeight() : 0;
	} else {
		var image = 0;
	}
	var ribbon = $($clone).find(".rb-wrap").outerHeight() ? $($clone).find(".rb-wrap").outerHeight() : 0;
	var button = $($clone).find(".button_wrapper").outerHeight() ? $($clone).find(".button_wrapper").outerHeight() : 0;
	var device = $(window).outerHeight();
	var height_soal = device + 40 - (image + ribbon + button);
	$($clone).find(".button_wrapper").css("opacity", 1);
};

DigitalComic.prototype.cek_jawaban_miniquiz = function($clone, $type, dataquiz) {
	var $this = this;
	var $flag = 0;
	var count = 0;
	$this.delay = 1;

	// CEK JAWABAN BERDASARKAN TIPE NYA
	if ($type == "mc" || $type == "mmc") {
		if ($type == "mmc") {
			dataquiz["jawaban_click"] = [];
		}
		$($clone).find(".pilihan").each(function(index) {
			if ($type == "dadsequence" || $type == "dadseqcat") {
				if ($(this).attr("index") != dataquiz["jawaban"][index]) {
					$flag = 1;
					if ($this.attempt > 1) {
						$($clone).find(".next-soal").html("RETRY");
					}
				}
			} else {
				if ($(this).hasClass("active")) {
					if ($type == "mmc") {
						if (dataquiz["jawaban"].indexOf(parseInt($(this).attr("index"))) != -1) {
							if (dataquiz["jawaban_click"].indexOf("+" + parseInt($(this).attr("index"))) == -1) {
								dataquiz["jawaban_click"].push("+" + parseInt($(this).attr("index")));
							}
						} else {
							if (dataquiz["jawaban_click"].indexOf("-" + parseInt($(this).attr("index"))) == -1) {
								dataquiz["jawaban_click"].push("-" + parseInt($(this).attr("index")));
							}
						}
					}

					$(this).removeClass("active");
					var $cek = 0;
					for (var i = 0; i < dataquiz["jawaban"].length; i++) {
						if (dataquiz["jawaban"][i] == $(this).attr("index")) {
							$cek = 1;
							break;
						}
					}

					if ($cek == 0) {
						$flag = 1;
						$(this).addClass("wrong");
						if ($type != "mmc") {
							dataquiz["jawaban_click"] = "-" + parseInt($(this).attr("index"));
						}
					} else {
						count++;
						$(this).addClass("right");
						if ($type != "mmc") {
							dataquiz["jawaban_click"] = "+" + parseInt($(this).attr("index"));
						}
					}
				}
			}
		});
		$($clone).find(".next-soal").removeAttr("disabled");
	} else if ($type == "tf") {
		if ($clone != dataquiz["jawaban"][0]) {
			dataquiz["jawaban_click"] = "-" + $clone;
			$(".truefalse_wrapper .btn-standard.selected").css("background", "#FF5D57");
			$(".truefalse_wrapper .btn-standard.selected").addClass("wrong");
			$flag = 1;
		} else {
			dataquiz["jawaban_click"] = "+" + $clone;
			$(".truefalse_wrapper .btn-standard.selected").css("background", "#03D178");
			$(".truefalse_wrapper .btn-standard.selected").addClass("right")
		}
		$(".next-soal").removeAttr("disabled");
	}

	if ($type == "mc" || $type == "mmc") {
		if (count != dataquiz["jawaban"].length) {
			$flag = 1;
			$($clone).find(".pilihan").each(function(e) {
				for (var i = 0; i < dataquiz["jawaban"].length; i++) {
					if (dataquiz["jawaban"][i] == $(this).attr("index")) {
						$(this).addClass("right");
						$($clone).find(".num_pilihan.point-" + $(this).attr("index")).addClass("right");
					}
				}
			});
		}
	}
	// END


	if ($flag == 0) {
		$(".modal_feedback").addClass("benar");
		game.audio.audioBenar.play();
	} else {
		$(".modal_feedback").addClass("salah");
		game.audio.audioSalah.play();

	}

	clearInterval($this.timeout);
	clearTimeout($this.timeout);
	setTimeout(() => {
		$(".gesture_wrapper").css("height","0");
		$(".gesture_wrapper").show();
		$("#gw-1 img").attr("src", "assets/image/other/Gesture_Hand_Swipe_Up_Solid_Ungu.gif");
		$("#gw-2 img").attr("src", "assets/image/other/Gesture_Hand_Swipe_Up_Tangan_Ungu.gif");
		$("#gw-1").show();
		$("#gw-2").show();
		$(".gesture_wrapper").css("top", $(".comic_items").last().offset().top);
	}, 300);

	setTimeout(function() {
		$($this.curr_card).hide();
		$this.setFeedback(dataquiz, 1);
	}, 1000);

};