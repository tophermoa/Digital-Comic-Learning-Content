var GameQuizCard = function(){
	var $this = this;

	// CUSTOM SETTINGS
	$this.type = "page";
	$this.isRandom = false;
	$this.showNumbering = true;
	$this.isTimer = false;
	$this.startNumber = 1;
	this.card = new Card();
}

GameQuizCard.prototype.init = function(current_settings) {
	var $this = this;
	
	// INITIALIZE
	$this.current_settings = current_settings;
	$this.isswipe = false;
	$this.isStartTime = false;
	$this.slick = true;
	$this.question_data = [];
	$this.curr_soal=0;
	$this.isAppend=0;
	$this.count_benar=0;
	$this.curr_soal=0;
	$this.arr_alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	$this.cek_jawaban_timeout = 900;

	$this.popup_slick = 1; //set popup slider slick

	// GET JSON
	$.get("config/setting_quiz_slide_"+$this.current_settings["slide"]+".json",function(e){
		console.log(e);
		// JIKA ADA SETTINGS DI JSON
		if(e["settings"]){
			$this.type = (e["settings"]["type"])?e["settings"]["type"]:$this.type;
			$this.isRandom = (e["settings"]["isRandom"])?e["settings"]["isRandom"]:$this.isRandom;
			$this.showNumbering = (e["settings"]["showNumbering"])?true:false;
			$this.isTimer = (e["settings"]["duration"])?true:false;
			$this.countTime = (e["settings"]["duration"])?e["settings"]["duration"]:$this.countTime;
			$this.startNumber = (e["settings"]["startNumber"])?e["settings"]["startNumber"]:$this.startNumber;
			if($this.type == "popup"){
				$this.popupType = (e["settings"]["popupType"])?e["settings"]["popupType"]:"order";
			}
			$this.totalQuestion = (e["settings"]["totalQuestion"])?e["settings"]["totalQuestion"]:e["list_question"].length;
		}
		$this.question_data = e["list_question"];

		/*Get tutorial data*/
		$this.tutorial_data = e["list_tutorial"];
		/*End get tutorial data*/

		//Setting question
		if(e["question"] != undefined){
			$this.soal = e["list_question"];
			$this.question_DaDSorting = e["question"];
			$this.pilihanType = e["pilihanType"];
		}

		// INITIALIZE GAME QUIZ TYPE
		if($this.type == "page" || $this.type == "slider" || $this.type == "story"){
			$this.$clone = $(".slider-content").first().clone();
		}
		else if($this.type == "popup"){
			$this.$clone = $("#game_quiz_popup .game_quiz_popup").clone();
		}

		$this.$pilihan_clone = $($this.$clone).find(".pilihan").first().clone();
		$this.category_wrap = $($this.$clone).find(".category").first().clone();
		$this.select = $($this.$clone).find("select").first().clone();
		$this.number_pilihan_dadsequence = $($this.$clone).find(".number_dad_sequence li").first().clone();

		// INITIALIZE DRAG AND DROP
		$this.drop = $(".drop").first().clone();
		$this.drag = $(".drag").first().clone();
		$($this.drop).css({"display":"inline-block"});
		$($this.drag).css({"display":"inline-block"});
		$(".drop_wrapper").html("");
		$(".drag_wrapper").html("");

		// REMOVE ALL CONTENT
		$("#game_quiz_page").html("");
		$("#game_quiz_page").css("visibility","visible");
		$("#game_quiz_popup .modal-content").html("");

		console.log("setTutorial");
		$this.mulai_game();

	},'json');
};

GameQuizCard.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.question_data.length; i++) {
		arr_quest.push(i);
	}

	if($this.isRandom == true || ($this.type == "popup" && $this.popupType == "random")){
		do{
			var rand = Math.ceil(Math.random()*(arr_quest.length-1));
			arr_rand.push(arr_quest[rand]);
			arr_quest.splice(rand,1);
		}while(arr_quest.length>0);

		returnQuest = arr_rand;
	}
	else{
		returnQuest = arr_quest;
	}

	var start = returnQuest.length-(returnQuest.length-$this.totalQuestion);
	var end = returnQuest.length-$this.totalQuestion;
	returnQuest.splice(start,end);

	return returnQuest;
};

GameQuizCard.prototype.mulai_game = function() {
	var $this = this;
	
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	game.temp = game.scorm_helper.getSingleData("temp");
	if(ldata == undefined){
		ldata = [];
	}
	// console.log(ldata);
	// console.log(game.temp);
	// console.log($this.question_data.length);
	if(game.temp == 1 || ldata["answer"]== undefined || ldata["answer"]== null && (game.temp == 0 && ldata["answer"].length < $this.question_data.length)){
		game.scorm_helper.setSingleData("temp",0);
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		// console.log(sdata);
		$this.list_question = sdata["list_question"];
		$this.list_answer = sdata["answer"];
		$this.curr_soal = sdata["answer"].length;

		$this.setTutorial();
		if($this.type == "page" || $this.type == "slider"){
			$this.show_question();
		}
		else if($this.type == "popup"){
			$this.init_button();
		}
		else if($this.type == "story"){
			$this.storyQuiz();
		}
	}
	else{
		if(ldata["answer"].length < ldata["list_question"].length){
			$this.list_question = ldata["list_question"];
			$this.list_answer = ldata["answer"];
			$this.curr_soal = ldata["answer"].length;

			$this.setTutorial();
			if($this.type == "page" || $this.type == "slider"){
				$this.show_question();
			}
			else if($this.type == "popup"){
				$this.init_button();
			}
			else if($this.type == "story"){
				$this.storyQuiz();
			}
		}else{
			game.scorm_helper.setSingleData("temp",0);
			game.nextSlide();
		}
	}
};

GameQuizCard.prototype.init_button = function() {
	var $this = this;
	var index = 0;

	// INITIAL TIME
	if($this.isTimer){
		$this.countTime+=1;
		$(".timer .text_time").html($this.setTimer());
		$(".timer").show();
	}
	else{
		$(".timer").remove();
	}
	$this.startGameTimer();

	$this.temp_button = game.scorm_helper.getSingleData("temp_button");
	if($this.temp_button == null || $this.temp_button == undefined){
		$this.temp_button = [];
	}

	$(".game_quiz_popup_pilihan").each(function(e){
		if($(this).attr("index") == undefined){
			$(this).attr("index",index);
		}
		index +=1;

		if($this.popupType == "order"){
			for (var i = 0; i < $this.temp_button.length; i++) {
				if(parseInt($(this).attr("index")) == $this.temp_button[i]){
					if($this.list_answer[i] == 1){
						$(this).addClass("done right");
					}
					else if($this.list_answer[i] == 0){
						$(this).addClass("done wrong");
					}
				}
			}
		}
		else{
			if($this.list_answer[parseInt($(this).attr("index"))] == 1){
				$(this).addClass("done right");
			}
			else if($this.list_answer[parseInt($(this).attr("index"))] == 0){
				$(this).addClass("done wrong");
			}
		}

		if(!$(this).hasClass("done")){
			$(this).click(function(e){
				// remove styling feedback
				$(".modal_feedback").removeClass("benar");
				$(".modal_feedback").removeClass("salah");

				if($this.popupType == "consistent" || $this.popupType == "random"){
					$this.curr_soal = parseInt($(this).attr("index"));
				}
				else{
					$this.curr_soal = $this.list_answer.length;
				}
				$this.show_question();
			});
		}
	});

	
};

GameQuizCard.prototype.show_question = function() {
	console.log("show_question");
	var $this = this;
	var $clone;
	$this.question_with_image = 0;
	$this.mc_pilihan_with_image = 0;
	// console.log("$this.question_with_image: "+$this.question_with_image);

	$("#game_quiz_page").html("");
	$clone = $this.$clone.first().clone();

	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];
	if(!$this.showNumbering){
		$clone.find(".number_question").hide();
	}

	if($current_soal["type"] == "dad_sorting"){
		$clone.find(".ribbon-content").html($this.question_DaDSorting);
	}else{
		$clone.find(".ribbon-content").html($current_soal['title']);
	}
	
	// setting question numbering
	$clone.find(".curr_soal").html(parseInt($this.startNumber-1)+parseInt($this.curr_soal+1));
	$clone.find(".total_soal").html(($this.startNumber-1)+$this.list_question.length);
	
	// remove all content
	$clone.find(".pilihan_wrapper").html("");
	$clone.find(".category_wrapper").html("");

	//add class
	$($clone).addClass($current_soal["type"]);

	//remove content number dad sequence
	if($current_soal["type"] == "dadsequence"){
		$clone.find(".number_dad_sequence").html("");
	}

	if($current_soal["type"] == "dad_sorting"){
		$clone.find(".hr_cust").hide();
		$clone.find(".text_question").hide();
		// $clone.find(".badge_soal_div").hide();
		$clone.find(".button_wrapper").hide();
		$this.initDaDSorting($clone);
	}

	console.log($this.type);
	if($this.type == "page" || $this.type == "slider"){
		console.log("game_quiz_page");
		$("#game_quiz_page").append($clone);
		$($clone).attr("id","slide_"+"_"+$this.curr_soal);
		$($clone).attr("curr_soal",$this.curr_soal);
	}
	else if($this.type == "popup"){
		$("#game_quiz_popup .modal-content").html($clone);
		$("#game_quiz_popup").modal("show");
	}

	if($current_soal["title"]){
		var rb_height = $($clone).find(".ribbon_header").innerHeight();
		if($current_soal["image"]){
			var qw_margin_top = 88; //if height ribbon_header 89.8 px, margin top 88px
			var pd_img_rb = $($clone).find(".ribbon_header").innerHeight();
			console.log(pd_img_rb);
			//normal height 90px
			if(pd_img_rb > 90){
				pd_img_rb -= 90;
				var height_qw = 88;
				console.log(height_qw);
				height_qw += pd_img_rb;
				console.log(height_qw);
				// $($clone).find(".question-wrapper").css("margin-top",height_qw+"px");
			}
			// $($clone).find("#img_soal").css("margin-top",pd_img_rb+"px");
		}else{
			$($clone).find(".place_question").css({"margin-top":"0px","background":"none"});
			$($clone).find(".rb-wrap").css({"position":"relative"});
		}
	}

	if($this.isAppend == 0){
		$this.isAppend = 1;

		if($this.type != "popup"){
			// INITIAL TIME
			if($this.isTimer){
				$this.countTime+=1;
				$(".timer .text_time").html($this.setTimer());
			}
			else{
				$(".timer").remove();
			}
		}

		console.log($this.type);
		if($this.type == "page"){
			if($this.popup_slick == 1){
				$this.cloneLogoImage = $("#popupList-2 .logo_image img").first().clone();
				$this.cloneWrapper = $("#popupList-2 .point_wrapper").first().clone();
				$("#popupList-2").find(".logo_image").html("");
				$("#popupList-2").find(".slider_wrapper").html("");

				// $this.countSlide = $this.tutorial_data.length;
				// if($this.listSlider[parseInt($(this).attr("index"))]["image_logo"]){
				// 	$("#popupList .logo_image").find("img").attr("src","assets/image/slider/"+$this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_logo"]);
				// 	$("#popupList").find(".logo_image").show();
				// }else{
				// 	$("#popupList").find(".logo_image").hide();
				// }

				/*Generate content to tutorial*/
					// console.log($this.tutorial_data);
					if ($this.tutorial_data.length > 0) {
						$("#popupList-2").find(".slider_wrapper").html("");
						// console.log($this.cloneWrapper.find(".point_desc"));
						for (var i = 0; i < $this.tutorial_data.length; i++) {
							var cWrapper = $($this.cloneWrapper).first().clone();
							var cLogoImage = $($this.cloneLogoImage).first().clone();
							// Setting image
							if($this.tutorial_data[i]["image"] != undefined){
								cLogoImage.attr("id","logo_image-"+i);
								cLogoImage.attr("src","assets/image/tutorial/"+$this.tutorial_data[i]["image"]);
								
								if(i>0){
									cLogoImage.hide();
								}
							}

							//Setting logo_image
							$(".logo_image").append(cLogoImage);

							// Setting title
							cWrapper.find(".title").html($this.tutorial_data[i]["title"]);

							// Setting desc
							// console.log(cWrapper.find(".point_desc"));
							cWrapper.find(".point_desc").html($this.tutorial_data[i]["desc"]);

							// var cList = $($this.cloneList).first().clone();
							// $(cList).find(".point_desc").html($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"][m][n]);
							// $(cWrapper).append(cList);

							if((i+1) < $this.tutorial_data.length){
								cWrapper.find(".button_wrapper").hide();
							}else{
								cWrapper.find(".button_wrapper").show();
							}

							$("#popupList-2").find(".slider_wrapper").append(cWrapper);
						}
					}
				/*End generate content to tutorial*/

				$("#popupList-2").modal({backdrop: 'static',keyboard: true,show: true});
				// console.log($(this)[0]["tutorial_data"]);
				$this.sliderPopup();

				$("#popupList-2 .start-game").click(function(e){
					$this.startGameTimer();
					game.audio.audioButton.play();
			        $("#popupList-2").modal('hide');
			        //remove slide slider wrapper, if slick call again slider old not appear
			        $("#popupList-2 .slider_wrapper .slick-track").remove();
			    });

			}else{
				console.log("call setTutorial");
				$this.setTutorial();
			}

			$this.settingPage($clone);
			/*$.getScript( "assets/js/jquery.mobile-1.4.5.min.js", function( data, textStatus, jqxhr ) {
				$this.settingPage($clone);
			});*/
		}
		else{
			if($this.type!="popup"){
				$this.startGameTimer();
			}
			$this.settingPage($clone);
		}
		
	}
	else{
		$this.settingPage($clone);
	}

	if($this.type == "slider"){
		$this.curr_soal+=1;
		if($this.curr_soal<$this.list_question.length){
			$this.show_question();	
		}
		else{
			$('#game_quiz_page').slick({
		        dots: true,
		        infinite: false,
		        speed: 500,
		        adaptiveHeight:true,
		        slidesToShow: 1,
        		slidesToScroll: 1
	      	});
		}
	}

	if($this.isTimer && $this.type != "popup"){
		$(".timer").show();
	}
};

GameQuizCard.prototype.initDaDSorting = function(slider_content) {
	console.log("initDaDSorting");
	var $this = this;
	
	$this.clone = $(slider_content).find(".card").first().clone();
	$this.bullet_soal = $(".total_soal_wrapper .bullet_num").first().clone();

	$(slider_content).find(".card_wrapper").html("");
	$(slider_content).find(".total_soal_wrapper").html("");
	// $(".text_time").html($this.setTimer());

	// $("#tutorial .tutorial.card").addClass("done");
	// $("#tutorial .tutorial.card").addClass("active");
			
	// $("#tutorial").modal("show");

	$("#tutorial .start-game").click(function(e){
		if($this.isTimer){
			$this.time = setInterval(function() {
				if($this.countTime>0){
					$(".timer .text_time").html($this.setTimer());
				}
				else{
					$(".timer .text_time").html("00:00");
					$this.setResult();
				}
			},1000);
		}

		game.audio.audioButton.play();
		$(this).off();
		$("#tutorial").modal("hide");
	});

	// console.log($this.list_question);
	let $curr_soal = $this.question_data[$this.list_question[$this.curr_soal]];
	for (var i = $this.list_question.length-1; i >=0 ; i--) {
		
		var $bullet = $this.bullet_soal.clone();
		
		if(i>=$this.curr_soal){
			var $clone = $this.clone.clone();
			// console.log($clone);
			$($clone).css({
				'z-index':parseInt($this.list_question.length-i),
				'top':parseInt(2*i)
		     });  
			$($clone).attr("question",parseInt($this.list_question[i]));
			if($this.question_data[$this.list_question[i]]["image"]){
				$($clone).find(".icon_card").attr("src","assets/image/game_quiz/card/list_soal_icon/"+$this.question_data[$this.list_question[i]]["icon"]);
			}
			// console.log($this.question_data[$this.list_question[i]]);
			$($clone).find(".desc_card").html($this.question_data[$this.list_question[i]]["desc"]);
			// console.log($clone);
			// console.log($(slider_content));
			// console.log($(slider_content).find(".card_wrapper"));
			$(slider_content).find(".card_wrapper").append($clone);
			// console.log($(slider_content).find(".card_wrapper"));
		}
		
		if(($this.list_question.length-1)-i<$this.curr_soal){
			// if(parseInt($this.list_answer["answer"][($this.list_question.length-1)-i]) == 1){
			// 	$($bullet).addClass("benar");
			// }
			// else{
			// 	$($bullet).addClass("salah");
			// }
		}
		$(".total_soal_wrapper").append($bullet);
		
	}
	// console.log(slider_content);
	$(slider_content).find(".card").draggable({
		cursor: 'move',
		revert : function(event, ui) {
			console.log("revert");
			if(!$this.isDrop){
				return true;
			}
			else{
				$(this).css({"top":"0","left":"0"});
			}
        },
		drag: function( event, ui ) {
			console.log("drag");
			$(".drop-target").css({"z-index":0});
			$(this).parent().css({"z-index":1});
			$this.isDrop = false;
			$this.selectedDrag = $(this);
		}
    });

    $(slider_content).find('.drop-target').droppable({
	  drop: function( event, ui ) {
	  	console.log("drop");
	  	$this.isDrop = true;
	  	console.log($this.soal);
	  	console.log($this.selectedDrag);
	  	console.log(parseInt($this.selectedDrag.attr("question")));
	  	console.log($this.curr_soal);
	  	var drag_jwb = $this.soal[parseInt($this.selectedDrag.attr("question"))]["jawaban"];
	  	console.log($(this));
	  	var drop_jwb = parseInt($(this).attr("index"));
	  	$this.selectedDrag.remove();
	  	// console.log($(this));
	  	if(!$(this).hasClass("active")){
	  		$(this).addClass("active");
	  	}
	  	console.log("index: ",drop_jwb, "jawaban: ",drag_jwb);
	  	if((drop_jwb == 1 &&  drag_jwb == 1) || (drop_jwb == 0 &&  drag_jwb == 0)){
	  		// if(drop_jwb == 1 && !$(".drop-benar").hasClass("active")){
	  		// 	$(".drop-benar").addClass("active");
	  		// }
	  		// else if(drop_jwb == 0 && !$(".drop-salah").hasClass("active")){
	  		// 	$(".drop-salah").addClass("active");
	  		// }
	  		game.scorm_helper.pushAnswer(1);
	  		let src = "assets/audio/correct.mp3";
	  		game.audio.audio_dynamic(src).play();
			$(".alert").addClass("benar");

	  	}
	  	else{
	  		game.scorm_helper.pushAnswer(0);

	  		let src = "assets/audio/incorrect.mp3";
	  		game.audio.audio_dynamic(src).play();
			$(".alert").addClass("salah");
	  	}
	  	
	  	setTimeout(() => {
	  		$(".alert").removeClass("benar");
	  		$(".alert").removeClass("salah");
		  	$this.curr_soal=$this.curr_soal+1;
		  	// console.log($(".text_num .curr_soal"));
		  	

		  	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
		  	console.log(ldata);
			if($this.curr_soal>=$this.soal.length){
				// console.log($this.card);
				// alert("test");
				$this.card.setResult();
			}else{
				$(".text_num .curr_soal").html(parseInt($this.curr_soal+1));
			}
		},800);
	  }
	});

	$this.DaDSequence_setPilihan(slider_content);
};

GameQuizCard.prototype.DaDSequence_setPilihan = function(slider_content) {
	var $this = this;
	// console.log($this.question_data);
	// console.log($this.curr_soal);
	// console.log($this.list_question);
	// console.log($this.question_data[$this.list_question[$this.curr_soal]]);
	var pilihan = $this.question_data[$this.list_question[$this.curr_soal]]["pilihan"];
	// console.log(pilihan);
	// console.log($(slider_content));
	// console.log($(slider_content).find(".pilihan_wrapper-2 .pilihan"));
	$(slider_content).find(".pilihan_wrapper-2 .pilihan").each(function(e){
		// console.log($(this).attr("index"));
		// console.log($this.pilihanType);
		if($this.pilihanType == "text"){
			$(this).addClass("text");
			$(this).find(".text_wrap>span>span").html(pilihan[parseInt($(this).attr("index"))]);
		}
		else{
			$(this).addClass("image");
			// console.log(pilihan[parseInt($(this).attr("index"))]);
			$(this).find(".image_wrap .idle").attr("src","assets/image/game_quiz/card/"+pilihan[parseInt($(this).attr("index"))]["idle"]);
			$(this).find(".image_wrap .active").attr("src","assets/image/game_quiz/card/"+pilihan[parseInt($(this).attr("index"))]["active"]);	
		}		
	});

	$(".pilihan").removeClass("active");
	$(".pilihan").click(function(e){
		$(".pilihan").off();
		$(this).addClass("active");
		$this.cekJawaban($(this).attr("index"));
	});
};

GameQuizCard.prototype.cekJawaban = function(index) {
	var $this = this;
	$(".card").each(function(e){
		if(parseInt($(this).attr("question")) == $this.curr_soal){
			$this.curr_card = $(this);
			if($this.direction == 0){
				$(this).addClass("quitLeft");
				$this.direction=1;
			}
			else{
				$(this).addClass("quitRight");
				$this.direction=0;
			}
		}
	});

	var response = $this.question_data[$this.list_quest[$this.curr_soal]]["desc"];

	if(parseInt(index) == $this.question_data[$this.list_quest[$this.curr_soal]]["jawaban"]){
		// benar
		$(".total_soal_wrapper>div:nth-child("+($this.curr_soal+1)+")").addClass("benar");
		game.scorm_helper.pushAnswer(1,response);
		game.audio.audioBenar.play();
		$(".alert").addClass("benar");
	}
	else{
		// salah
		game.scorm_helper.pushAnswer(0,response);
		$(".total_soal_wrapper>div:nth-child("+($this.curr_soal+1)+")").addClass("salah");
		game.audio.audioSalah.play();
		$(".alert").addClass("salah");
	}

	setTimeout(function() {
		$($this.curr_card).hide();
		$(".alert").removeClass("salah");
		$(".alert").removeClass("benar");
		$this.curr_soal=$this.curr_soal+1;

		if($this.curr_soal<$this.list_quest.length){
			$this.setPilihan();
		}
		else{
			$this.setResult();
		}
	},800);
};



GameQuizCard.prototype.setTutorial = function() {
	var $this = this;
	console.log("setTutorial");
	
	// get current soal
	console.log($this.question_data);
	console.log($this.curr_soal);
	var $current_soal = $this.question_data[$this.curr_soal];
	// var $current_soal = $this.current_soal;
	console.log($current_soal);
	// var $current_soal["type"] = "swipe";

	if($this.curr_soal<$this.question_data.length){
		$("#tutorial .tutorial").removeClass("active");
		if(!$("#tutorial .tutorial."+$current_soal["type"]).hasClass("done")){
			$("#tutorial .tutorial."+$current_soal["type"]).addClass("done");
			$("#tutorial .tutorial."+$current_soal["type"]).addClass("active");
			$("#tutorial").modal('show');
		}
		$("#tutorial .start-game").click(function(e){
			$this.startGameTimer();
			game.audio.audioButton.play();
	        $("#tutorial").modal('hide');
	    });
	}

	// $("#tutorial .tutorial."+$current_soal["type"]).slick({
	// 	slidesToShow: 1,
	// 	dots: true,
 //        infinite: false,
 //        speed: 500,
 //        arrows: false,
 //        variableWidth: true
	// });
	// $("#tutorial .tutorial."+$current_soal["type"]).on("afterChange", function(event, slick, currentSlide, nextSlide){
	// 	if(currentSlide+1 == $this.countSlide){
	// 		$("#tutorial .button_wrapper").show();
	// 	}else{
	// 		$("#tutorial .button_wrapper").hide();
	// 	}
	// });
	// $("#tutorial").find(".slider_wrapper")[0].slick.refresh();
	// $('.modal').on('shown.bs.modal', function (e) {
	// 	$("#tutorial").find(".slider_wrapper").resize();
	// });
};

GameQuizCard.prototype.sliderPopup = function() {
	var $this = this;

	$("#popupList-2").find(".slider_wrapper").not('.slick-initialized').slick({
		slidesToShow: 1,
		dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        variableWidth: true
	});

	$("#popupList-2").find(".slider_wrapper").on("afterChange", function(event, slick, currentSlide, nextSlide){
		// 	if(currentSlide+1 == $this.countSlide){
		// 		$("#popupList-2 .button_wrapper").show();
		// 	}else{
		// 		$("#popupList-2 .button_wrapper").hide();
		// 	}

		// console.log("currentSlide: "+currentSlide);
		$("#popupList-2").find(".logo_image img").hide();
		$("#popupList-2").find("#logo_image-"+currentSlide).show();
	});

	// console.log($("#popupList-2").find(".slider_wrapper"));
	// console.log($("#popupList-2").find(".slider_wrapper")[0]);
	if($("#popupList-2").find(".slider_wrapper")[0] != undefined){
		$("#popupList-2").find(".slider_wrapper")[0].slick.refresh();
	}

	$('.modal').on('shown.bs.modal', function (e) {
		$("#popupList-2").find(".slider_wrapper").resize();
	});
};

GameQuizCard.prototype.startGameTimer = function() {
	var $this = this;
	if(!$this.isStartTime){
		$this.isStartTime = true;
		if($this.isTimer){
			$this.time = setInterval(function() {
				if($this.countTime>0){
					$(".timer .text_time").html($this.setTimer());
				}
				else{
					clearInterval($this.time);
					$this.time = null;
					$(".timer .text_time").html("00.00");
					game.scorm_helper.setSingleData("temp",0);
					game.nextSlide();
				}
			},1000);
		}
	}
};
GameQuizCard.prototype.setTimer = function() {
	$this = this;
	
	$this.countTime = $this.countTime-1;
	var diffMunites = Math.floor($this.countTime/60);
	var diffSec = Math.floor($this.countTime%60);

	var str = '';
	if(diffMunites<10){
		str=str+"0"+diffMunites+".";
	}
	else if(diffMunites>=10){
		str=str+diffMunites+".";
	}

	if(diffSec<10){
		str=str+"0"+diffSec;
	}
	else if(diffSec>=10){
		str=str+diffSec;
	}

	return str;
};

GameQuizCard.prototype.settingPage = function($clone) {
	var $this = this;
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	if($this.type == "page"){
		// setting prev
		if($this.curr_soal>0){
			$($clone).attr("data-prev","#slide_"+"_"+(parseInt($this.curr_soal)-1));	
		}else{
			$($clone).attr("data-prev","");	
		}
		// setting next
		if(parseInt($this.curr_soal)+1<$this.question_data.length){
			$($clone).attr("data-next","#slide_"+"_"+(parseInt($this.curr_soal)+1));
		}
		else{
			$($clone).attr("data-next","#result");
		}

		/*if($this.curr_soal == 0){
			$.mobile.changePage( "#slide_"+"_"+$this.curr_soal, { transition: "none"} );
		}

		$($clone).swipeleft(function( event ) {
		    $this.next();  
		});*/

		$($clone).find(".next-soal").click(function(e){
			console.log("next-soal");
			$this.next();
		});

		$clone.find(".btn-pass").click(function(e){
			console.log($this.cekComplete());
			// $this.next();
			// if(!$this.cekComplete()){
			// 	console.log($this.type);
			// 	if($this.type == "page"){
			// 		if($this.curr_soal<$this.list_question.length-1){
			// 			$this.curr_soal = $this.curr_soal+1;
			// 			$this.show_question();
			// 		}
			// 	}
			// 	else if($this.type == "popup"){
			// 		$(".game_quiz_popup_pilihan").off();
			// 		$this.init_button();
			// 	}
			// }

			$this.next();
		});
	}

	//call function to set css based on quiz type
	$this.settingCssQuizType($clone, $current_soal);

	if($this.type != "slider"){
		$($clone).find(".btn-submit").click(function(e){
			$(this).off();
			$(this).hide();

			if($current_soal["type"] == "dad"){
				$clone.find(".drag").draggable('disable');
				$clone.find(".drag").css({"margin": "0"});
			}
			else if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
				$clone.find(".pilihan_wrapper").sortable("disable");
			}

			$clone.find(".pilihan").off();
			if($current_soal["next_button"] == undefined || $current_soal["next_button"]){
				$($clone).find(".next-soal").show();
			}else{
				$($clone).find(".next-soal").hide();
			}
			$this.cek_jawaban($clone,$current_soal["type"]);

			if($current_soal["type"] == "dadsequence"){
				// alert("test");
			}else if($current_soal["type"] == "dadseqcat"){
				// kasi jawaban benarnya
				$clone.find(".pilihan_wrapper").html("");
				for (var i = 0; i < $current_soal["jawaban"].length; i++) {
					$app_pilihan = $this.$pilihan_clone.clone();
					$app_pilihan.find(".txt_pilihan").html($current_soal["pilihan"][$current_soal["jawaban"][i]]["text"]);
					$clone.find(".pilihan_wrapper").append($app_pilihan);
				}
			}
		});
	}
	else{
		if($this.curr_soal<$this.list_question.length-1){
			$($clone).find(".btn-submit").remove();
		}
		else{
			$($clone).find(".btn-submit").show();
			$($clone).find(".btn-submit").click(function(e){
				$(this).off();
				$this.cek_jawaban_slider();
			});
		}
	}
	
	$($clone).css({'visibility':'visible',"height":"100%"});
	setTimeout(function(){
		var image = $($clone).find("#img_soal").outerHeight()?$($clone).find("#img_soal").outerHeight():0;
		var ribbon = $($clone).find(".rb-wrap").outerHeight()?$($clone).find(".rb-wrap").outerHeight():0;
		var button = $($clone).find(".button_wrapper").outerHeight()?$($clone).find(".button_wrapper").outerHeight():0;
		var device = $(window).outerHeight();
		var height_soal = device+40-(image+ribbon+button);
		// $($clone).find(".place_question").css("height",height_soal+"px");
	},1000);
};

GameQuizCard.prototype.prev = function(prev) {
	var $this = this;
	if(prev){
        $( ":mobile-pagecontainer" ).pagecontainer( "change", prev, {
            transition: "slide",
            reverse: true
        });
    }
};

GameQuizCard.prototype.next = function() {
	var $this = this;
	$(".modal_feedback").removeClass("benar");
	$(".modal_feedback").removeClass("salah");

	$this.setTutorial();

	//var next = $(".ui-page-active").jqmData("next");

	$(".button_next_page").removeClass("active");
	var $this = this;

	if($this.isswipe){
		$this.isswipe = false;
		if($this.cekComplete()){
			game.scorm_helper.setSingleData("temp",1);
			game.nextSlide();
		}
		else{
			$this.show_question();
			//game.next(next);	
		}
	}
	
};

GameQuizCard.prototype.cek_jawaban = function($clone,$type) {
	var $this = this;
	var $flag=0;
	var count = 0;
	$this.isswipe = true;
	// get current soal
	var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

	var arr_response = [];
	// console.log($this.list_question);
	// console.log(arr_response);
	for (var i = 0; i < $this.list_question.length; i++) {
		// console.log($this.question_data);
		// console.log($this.question_data[$this.list_question[i]]);
		// console.log($this.question_data[$this.list_question[i]]["question"]);
		// console.log(arr_response);
		arr_response.push($this.question_data[$this.list_question[i]]["question"]);
		// console.log(arr_response);
	}

	let modal_feedback_name;
	if($type == "tf"){
		modal_feedback_name = "modal_benarsalah";
	}else{
		modal_feedback_name = "modal_feedback";
	}
	// modal_feedback_name = "modal_feedback";

	if($flag==0){
		// $(".modal_feedback").addClass("benar");
		$("."+modal_feedback_name).addClass("benar");

		$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("right");
		$this.list_answer[$this.curr_soal]=1;
		game.audio.audioBenar.play();
		$(".alert").addClass("benar");
	}
	else{
		// $(".modal_feedback").addClass("salah");
		$("."+modal_feedback_name).addClass("salah");

		$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("wrong");
		$this.list_answer[$this.curr_soal]=0;
		game.audio.audioSalah.play();
		$(".alert").addClass("salah");
	}
	game.scorm_helper.setAnswer($this.list_answer,arr_response);

	$(".game_quiz_popup_pilihan").off();
	$(".game_quiz_popup_pilihan[index='"+$this.curr_soal+"']").addClass("done");

	if($this.popupType == "order"){
		$this.temp_button.push($this.curr_soal);	
	}

	// SHOW FEEDBACK JIKA TERDAPAT FEEDBACK
	var isFeedback = false;
	if($current_soal["feedback"]){
		isFeedback = true;
		// $("#modal_feedback .description p").html($current_soal["feedback"]);
		$("#"+modal_feedback_name+" .description p").html($current_soal["feedback"]);
	}
	else if($current_soal["feedback_benar"] && $current_soal["feedback_salah"]){
		isFeedback = true;
		if($flag == 0){
			// $("#modal_feedback .description p").html($current_soal["feedback_benar"]);
			$("#"+modal_feedback_name+" .description p").html($current_soal["feedback_benar"]);
		}
		else{
			// $("#modal_feedback .description p").html($current_soal["feedback_salah"]);
			$("#"+modal_feedback_name+" .description p").html($current_soal["feedback_salah"]);
		}
	}
	
	if(isFeedback){
		// $("#modal_feedback").modal("show");
		$("#"+modal_feedback_name).modal("show");

		if(modal_feedback_name == "modal_benarsalah"){
			setTimeout(function(){
				$("#"+modal_feedback_name).modal("hide");

				//function go to slide
				if($current_soal["cerita"] == undefined && !$current_soal["next_button"]){
					if($this.cekComplete()){
						game.scorm_helper.setSingleData("temp",0);
						game.nextSlide();
					}else{
						$this.next();
					}
				}else if($current_soal["cerita"] != undefined && !$current_soal["next_button"]){
					$(".modal_feedback").removeClass("benar");
					$(".modal_feedback").removeClass("salah");
					if($this.cekComplete()){
						game.scorm_helper.setSingleData("temp",1);
						game.nextSlide();
					}
					else{
						$this.curr_soal += 1;
						$this.storyQuiz();
					}
				}
			},1000);
		}

		$("#"+modal_feedback_name+" .close_feedback").click(function(e){
			$(this).off();
			$("#modal_feedback").modal("hide");
			if($current_soal["cerita"] == undefined && !$current_soal["next_button"]){
				if($this.cekComplete()){
					game.scorm_helper.setSingleData("temp",0);
					game.nextSlide();
				}else{
					$this.next();
				}
			}else if($current_soal["cerita"] != undefined && !$current_soal["next_button"]){
				$(".modal_feedback").removeClass("benar");
				$(".modal_feedback").removeClass("salah");
				if($this.cekComplete()){
					game.scorm_helper.setSingleData("temp",1);
					game.nextSlide();
				}
				else{
					$this.curr_soal += 1;
					$this.storyQuiz();
				}
			}
		});
	}
	// END

	setTimeout(function() {
		$($this.curr_card).hide();
		$(".alert").removeClass("salah");
		$(".alert").removeClass("benar");

		if(!$this.cekComplete()){
			if($this.type == "page"){
				if($this.curr_soal<$this.list_question.length-1){
					$this.curr_soal = $this.curr_soal+1;
					//$this.show_question();
				}
			}
			else if($this.type == "popup"){
				$(".game_quiz_popup_pilihan").off();
				$this.init_button();
			}
		}
		else{
			if(!isFeedback && $this.type != "page"){
				game.scorm_helper.setSingleData("temp",0);
				game.nextSlide();
			}
		}
		$("#game_quiz_popup").modal("hide");

	},800);

	if($this.type == "page"){
		$(".button_next_page").addClass("active");
	}
};

GameQuizCard.prototype.cek_jawaban_slider = function() {
	var $this = this;
	$(".slider-content").each(function(e){
		var $flag=0;
		var count = 0;
		var $current_soal = $this.question_data[$this.list_question[parseInt($(this).attr("curr_soal"))]];

		if($current_soal["type"] == "mc"|| $current_soal["type"] == "mmc"|| $current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat")
		{
			$(this).find(".pilihan").each(function(index){
				if($current_soal["type"] == "dadsequence" || $current_soal["type"] == "dadseqcat"){
					if($(this).attr("index") != $current_soal["jawaban"][index]){
						$flag=1;
					}
				}
				else{
					if($(this).hasClass("active")){
						$(this).removeClass("active");
						var $cek=0;
						for (var i = 0; i < $current_soal["jawaban"].length; i++) {
							if($current_soal["jawaban"][i] == $(this).attr("index")){
								$cek=1;
								break;
							}
						}

						if($cek == 0){
							$flag=1;
						}
						else{
							count++;
						}
					}
				}
			});
		}
		else if($current_soal["type"] == "dad"){
			$(this).find(".drop").each(function(e){
				if($(this).attr("index") != $(this).find(".drag").attr("index")){
					$flag=1;
				}
			});
		}
		else if($current_soal["type"] == "dpd"){
			$(this).find("select").each(function(e){
				if($(this).val().toLowerCase() != $current_soal["jawaban"][parseInt($(this).attr("index"))].toLowerCase()){
					$flag = 1;
				}
			});
		}
		
		if($current_soal["type"] == "mc" || $current_soal["type"] == "mmc"){
			if(count != $current_soal["jawaban"].length){
				$flag=1;
			}
		}

		if($flag==0){
			$this.list_answer[$this.curr_soal]=1;
		}
		else{
			$this.list_answer[$this.curr_soal]=0;
		}
	});

	var arr_response = [];
	for (var i = 0; i < $this.list_question.length; i++) {
		arr_response.push($this.question_data[$this.list_question[i]]["question"]);
	}

	game.scorm_helper.setAnswer($this.list_answer,arr_response);
	game.scorm_helper.setSingleData("temp",0);
	game.nextSlide();
};

GameQuizCard.prototype.cekComplete = function() {
	var $this = this;
	var flag = 0;
	for (var i = 0; i < $this.list_question.length; i++) {
		if($this.list_answer[i] == undefined || $this.list_answer[i] == null){
			flag = 1;
			break;
		}
	}

	return (flag == 1)?false:true;
};

GameQuizCard.prototype.storyQuiz = function() {
	console.log("storyQuiz");
	var $this = this;
	var $current = $this.question_data[$this.list_question[$this.curr_soal]];
	if(!$this.slick){
		$("#game_quiz_page").slick("unslick");
	}
	$("html").removeClass("ui-mobile");
	$("#game_quiz_page").html("");
	$(".modal_feedback").removeClass("benar");
	$(".modal_feedback").removeClass("salah");
	for(var i = 0;i < $current["cerita"].length; i++){
		var $current_soal = $current["cerita"][i];
		var $clone = $this.$clone.clone();
		$clone.find(".curr_soal").html(parseInt($this.curr_soal+1));
		$clone.find(".total_soal").html($this.list_question.length);

		$clone.find(".pilihan_wrapper").html("");
		$clone.find(".category_wrapper").html("");

		if($current_soal["image"]){
			$clone.find("#img_soal").show();
			$clone.find("#img_soal").attr("src","assets/image/game_quiz/list_img/"+$current_soal["image"]);
		}
		else{
			$clone.find("#img_soal").hide();
		}
		$($clone).addClass($current_soal["type"]);

		$("#game_quiz_page").append($clone);

		if($current_soal["type"] == "mc"||
			$current_soal["type"] == "mmc"||
			$current_soal["type"] == "dadsequence"||
			$current_soal["type"] == "dadseqcat" ||
			$current_soal["type"] == "tf")
		{
			// setting question
			if($current_soal["text"]){
				$clone.find(".text_question").html($current_soal["text"]);
			}
			if($current_soal["pilihan"]){
				// random pilihan
				var arr_temp = [];
				var arr_rand = [];

				for (var i = 0; i < $current_soal["pilihan"].length; i++) {
					arr_temp.push(i);
				}

				for (var i = 0; i < $current_soal["pilihan"].length; i++) {
					var rand = Math.floor((Math.random() * (arr_temp.length-1)));
					arr_rand.push(arr_temp[rand]);
					arr_temp.splice(rand, 1);
				}

				if($current_soal["type"] != "tf"){
					// console.log("tf");
					$clone.find(".pilihan_wrapper").removeClass('hide');
					for (var i = 0; i < arr_rand.length; i++) {
						$app_pilihan = $this.$pilihan_clone.clone();
						$app_category = $this.category_wrap.clone();

						$app_pilihan.find(".txt_pilihan").html($current_soal["pilihan"][arr_rand[i]]["text"]);
						$app_pilihan.attr("index",$current_soal["pilihan"][arr_rand[i]]["index"]);
						$($app_pilihan).addClass($current_soal["type"]);
						$($app_pilihan).find(".bul_abjad").html($this.arr_alphabet[i]);

						$clone.find(".pilihan_wrapper").append($app_pilihan);

						if($this.question_data[$this.curr_soal]["type"] == "dadseqcat"){
							$($app_category).html($this.question_data[$this.curr_soal]["category"][i]);
							$clone.find(".category_wrapper").append($app_category);
						}
					}
				}else{
					$clone.find(".truefalse_wrapper").removeClass('hide');

					var flagTrueFalseText = 1;
					if(flagTrueFalseText == 1){
						$clone.find("#text_wrap-1").html($current_soal["pilihan"][0]["text"]);
						$clone.find("#text_wrap-2").html($current_soal["pilihan"][1]["text"]);
					}
				}
			}
		}
		if($current_soal["type"] == "tf"){
			$clone.find(".btn-submit").hide();
			$clone.find(".btn-standard--true").click(function(e){
				$(this).off();
				$(this).css('background','#00C46F');
				$(this).addClass('selected');
				var index = $(this).attr("index");

				setTimeout(function(){
					// alert('true');
					$($clone).find(".btn-standard--false").off();
					if($current["next_button"] == undefined || $current["next_button"]){
						console.log($current["next_button"]);
						if($current["next_button"] == undefined){
							$($clone).find(".next-soal").hide();
						}else{
							$($clone).find(".next-soal").show();
						}
					}else{
						$($clone).find(".next-soal").hide();
					}
					$this.cek_jawaban(index,"tf");
				},$this.cek_jawaban_timeout);
			});
			$clone.find(".btn-standard--false").click(function(e){
				$(this).off();
				$(this).css('background','#FF2C24');
				$(this).addClass('selected');
				var index = $(this).attr("index");

				setTimeout(function(){
					// alert('false');
					$($clone).find(".btn-standard--true").off();
					if($current["next_button"] == undefined || $current["next_button"]){
						$($clone).find(".next-soal").show();
					}else{
						$($clone).find(".next-soal").hide();
					}
					$this.cek_jawaban(index,"tf");
				},$this.cek_jawaban_timeout);
			});
		}
		$($clone).find(".next-soal").click(function(e){
			console.log("next-soal 2");
			$(".modal_feedback").removeClass("benar");
			$(".modal_feedback").removeClass("salah");
			if($this.cekComplete()){
				game.scorm_helper.setSingleData("temp",1);
				game.nextSlide();
			}
			else{
				$this.curr_soal += 1;
				$this.storyQuiz();
			}
		});
	}
	$("#game_quiz_page").slick({
		dots: false,
		arrows: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
		slidesToScroll: 1
	});
	$this.slick = false;
};

GameQuizCard.prototype.settingCssQuizType = function($clone, $current_soal) {
	var $this = this;
	// jangan set class pilihan_jawaban_wrapper hide


	/*setting css height pilihan_wrapper*/
	let h_wrap = $clone.find(".wrap").innerHeight();
    console.log('h_wrap: '+h_wrap);
    let h_rb_wrap = $clone.find(".rb-wrap").innerHeight();
    console.log('h_rb_wrap: '+h_rb_wrap);
    let h_wrapper_slick_dots_cust = $clone.find(".wrapper_slick_dots_cust").innerHeight();
    console.log("h_wrapper_slick_dots_cust: "+h_wrapper_slick_dots_cust);
    let mt_question_wrapper = 24;
    let h_pjw = h_wrap - h_rb_wrap - h_wrapper_slick_dots_cust - mt_question_wrapper;
    console.log("h_pjw: "+h_pjw);

    console.log("$this.question_with_image: "+$this.question_with_image);
    if($this.question_with_image == 1){
    	let mt_question_wrapper = 108;
    	let mtb_text_question_mc_img = 38;
    	h_pjw = h_pjw - mt_question_wrapper - mtb_text_question_mc_img;
    }
    /*end setting css height pilihan_wrapper*/

	if($current_soal["type"] == "mc" || $current_soal["type"] == "mmc" || $current_soal["type"] == "tf"){
	    console.log("h_pjw: "+h_pjw);
	    if(h_wrap <= 667){
	    	// $clone.find(".pilihan_jawaban_wrapper").css({"max-height":h_pjw,"padding-bottom":"32px"});
	    }else{
	    	// $clone.find(".pilihan_jawaban_wrapper").css({"max-height":h_pjw});
	    }
		console.log($clone.find(".pilihan_wrapper").innerHeight());

		if($current_soal["type"] == "tf"){
			// $clone.find(".text_question_mc_img").css({"margin":"22px 0px 24px 0px"});
		}
		else{
			//setting style quiz mc, mmc
			$clone.find(".place_question").css("margin-right", "unset");
			$clone.find(".text_question_mc_img").css({"text-align":"left"});
			// $clone.find(".pilihan_wrapper").css({"padding":"0 48px 40px 0"});

			//setting style quiz mc and pilihan with image
			if($current_soal["type"] == "mc" && $this.mc_pilihan_with_image == 1){
				// $clone.find(".place_question").css({"margin-left": "40px"});
				// $clone.find(".question-wrapper").css({"margin-top": "0px"});
				// $clone.find(".text_question_mc_img").css({"margin":"14px 48px 24px 40px"});
				// $clone.find(".pilihan_wrapper").css({"padding": "0px 40px 24px 28px"});
				// $clone.find(".pilihan_jawaban_wrapper").css({"overflow-y": "scroll","padding-bottom": "60px"});
				//if image soal undefined
				if($current_soal["image"] == undefined){
					// $clone.find(".pilihan_jawaban_wrapper").css({"max-height": "368px"});
				}
			}
		}
	}else if($current_soal["type"] == "dpd"){
		console.log("h_pjw: "+h_pjw);
	    if(h_wrap <= 667){
	    	$clone.find(".place_question").css({
	    		"max-height":h_pjw,
	    		"margin-right":"8px",
	    		"overflow-y":"scroll"
	    	});
	    }else{
	    	$clone.find(".place_question").css({
	    		"max-height":h_pjw,
	    		"margin-right":"8px",
	    		"overflow-y":"scroll"
	    	});
	    }
	}else if($current_soal["type"] == "dadsequence"){
		$clone.find(".ribbon_header").css({"padding-top":"10.2%","text-align":"left"});
		$clone.find(".pilihan_jawaban_wrapper").css("position","relative");
	}else if($current_soal["type"] == "essai"){
		$clone.find(".pilihan_jawaban_wrapper").hide();
	}else if($current_soal["type"] == "dad"){
		$clone.find(".drop_wrapper-2 .badge_soal_div-2 .text_num").css("padding","1px");
	}else if($current_soal["type"] == "mc_custom"){
		$clone.find(".pilihan_jawaban_wrapper .pilihan_wrapper").hide();
		$clone.find(".wrapper_slick_dots_cust").css("height","129px");

		//jika question ada image
		if($this.question_with_image == 1){
			// $clone.find(".text_question_mc_img").css("margin","14px 48px 24px 40px");
		}
	}
};