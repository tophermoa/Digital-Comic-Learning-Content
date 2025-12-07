var Slider = function(){

}
Slider.prototype.init = function(current_settings) {
	var $this = this;
	game.temp = 1;
	$this.current_settings = current_settings;
	$this.list_slider = $(".list_slider").first().clone();
	$this.popupList = $("#popupList").find(".description").first().clone();
	$this.button = $(".button").first().clone();
	$this.ccButton = $(".click_and_show_wrapper .button_click_and_show").first().clone();
	$this.ccButton_image = $(".click_and_show_image .button_click_and_show").first().clone();
	$this.cloneList = $(".point_wrapper_block").first().clone();
	$this.cloneWrapper = $(".point_wrapper").first().clone();
	$this.flipcard = $(".flipcard").first().clone();
	$this.total_slide;

	$("#ulasan").html("");
	$($this.list_slider).find(".button_wrapper").html("");
	$($this.list_slider).find(".click_and_show_wrapper").html("");
	$($this.list_slider).find(".click_and_show_image").html("");

	$.get("config/setting_slider_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.audio = e["audio"];
		$this.background = e["background"];
		$this.listSlider = e["list_slider"];
		$this.total_slide = e["list_slider"].length;
		// $this.setting = (e["setting"] != undefined ? e["setting"] : []);
		$this.createSlider();
	  },'json');
};

Slider.prototype.addVideoEvent = function(clone) {
    var $this = this;
    $(clone).find(".video").click(function(e) {
        $(this).off();
        $(this).find(".bg-video").find("img").attr("src", "assets/image/slider/replay.png");
        // try {
        //     moleawiz.sendCommand("cmd.force_orientation");
        // } catch (e) {
        //     console.log(e);
        // }
        $("#video .btn-close").hide();
        $("#video .btn-close").click(function(e) {
            $(this).off();
            try {
                moleawiz.sendCommand("cmd.force_potrait");
            } catch (e) {
                console.log(e);
            }
            $this.stopVideo();
            $this.addVideoEvent(clone);

            $(".slider-content .button_wrapper .button").removeAttr("disabled");

        });
        $this.playVideo();

        $("#video1").on("ended",function(e){
        	$("#video .btn-close").show();
        });

        //if triple click, button close toggle 
        let show_btn_close = 0;
  //       window.addEventListener('click', function (evt) {
		//     if (evt.detail === 20) {
		//         // alert('triple click!');

		//         if(show_btn_close == 0){
		//        		show_btn_close = 1;
		//        		$("#video .btn-close").show();
		//         }else{
		//         	show_btn_close = 0;
		//         	$("#video .btn-close").hide();
		//         }
		//     }
		// });
    });
};
Slider.prototype.playVideo = function() {
	$("#video").show();
	$("#video1").show();
	$("#video1").get(0).play();
};
Slider.prototype.stopVideo = function() {
	$("#video").hide();
	$("#video1")[0].pause();
	$("#video1")[0].currentTime = 0;
}

Slider.prototype.createSlider = function() {
	var $this = this;
	$(".slider-content").css({"background":$this.background});
	if($this.audio){
		console.log($this.audio);
		$this.audio_slider = game.audio.audio_dynamic($this.audio);
		$this.audio_slider.play();
	}
	for (var i = 0; i < $this.listSlider.length; i++) {
		var clone = $this.list_slider.clone();

		if($this.listSlider[i]["type"] == "infografis"){
			$(clone).find(".col_md_two").css({"height":"100vh","overflow-y":"auto"});
			$(clone).find(".button_wrapper").css({"margin-bottom":"4.244031830238727vh"});
			//$(clone).find(".img-load").imgViewer2();
		}
		
		//content image
		if($this.listSlider[i]["image"]){
			if($this.listSlider[i]["image"]){
				$(clone).find(".right-container").addClass("absolute");
				$(clone).find(".img-load").attr("src","assets/image/slider/"+$this.listSlider[i]["image"]);
				$(clone).find(".col_md_two").css("max-width","100%");
			}

			if($this.listSlider[i]['image_click'] != undefined){
				if($this.listSlider[i]['image_click'] == true){
					$this.flag_image_click = true;
				}
			}

			if($this.listSlider[i]['type'] != undefined){
				if ($this.listSlider[i]['type'] == "video"){
					$(clone).find(".cover").hide();
					$(clone).find(".video_slider").show();
					$(clone).find(".video_slider source").attr("src","assets/image/slider/"+$this.listSlider[i]["image"]);
				}
			}
		}
		else{
			$(clone).find(".keterangan").css("padding","3.183023872679045vh");
			$(clone).find(".img-load").remove();	
		}

		if($this.listSlider[i]["ribbon"]){
			$(clone).find(".ribbon-content").html($this.listSlider[i]["ribbon"]);
			if($this.listSlider[i]["ribbon_css"]){
				$(clone).find(".ribbon_header").css($this.listSlider[i]["ribbon_css"]);
			}
		}
		else{
			$(clone).find(".rb-wrap").remove();
		}

		//content text
		if($this.listSlider[i]["text"]){
			if(!$this.listSlider[i]["image"] && !$this.listSlider[i]["ribbon"]){
				$(clone).find(".left-container").hide();
			}
			if($this.listSlider[i]["flipcard"] || $this.listSlider[i]["click_and_show_image"]){
                $(clone).find(".keterangan").css("height","auto");
                $(clone).find(".keterangan").addClass("flip");
                $(clone).find(".right-container").addClass("flex");
            }
			if($this.listSlider[i]["text"].indexOf("[first name]") != -1){
				var txt_name = $this.listSlider[i]["text"];
                var name = game.scorm_helper.getName();
                var firstname = name.split(", ");
                var real_name = txt_name.replace("[first name]",firstname[0]);
                $(clone).find(".keterangan").html(real_name);
			}else{
				$(clone).find(".keterangan").html($this.listSlider[i]["text"]);
			}
		}
		else{
			$(clone).find(".keterangan").remove();	
		}

		//content video
		if($this.listSlider[i]["video"]){
			$("#video").find("source").attr("src","assets/video/"+$this.listSlider[i]["video"]);
			$("#video1")[0].load();
			$this.addVideoEvent(clone);
		}
		else{
			$(clone).find(".bg-video").remove();
		}

		//content click and show
		if($this.listSlider[i]["click_and_show"]){
			var list = $this.listSlider[i]["click_and_show"];
			for (var l = 0; l < list.length; l++) {
				var cButton = $($this.ccButton).first().clone();
				$(cButton).find(".text").html(list[l]["title"]);
				$(clone).find(".click_and_show_wrapper").append(cButton);
				$(cButton).attr("index",l);
				$(cButton).click(function(e){
					game.audio.audioButton.play();
					$("#popupList").find(".slider_wrapper").html("");
					$("#popupList .title").html($(this).find(".text").html());
					for (var m = 0; m < list[parseInt($(this).attr("index"))]["list"].length; m++) {
						var cWrapper = $($this.cloneWrapper).first().clone();
						cWrapper.html("");
						for(var n = 0; n < list[parseInt($(this).attr("index"))]["list"][m].length; n++){
							var cList = $($this.cloneList).first().clone();
							$(cList).find(".point_desc").html(list[parseInt($(this).attr("index"))]["list"][m][n]);
							$(cWrapper).append(cList);
						}
						$("#popupList").find(".slider_wrapper").append(cWrapper);
					}
					$("#popupList .btn-close").click(function(e){
						game.audio.audioButton.play();
						$(this).off();
						$("#popupList").modal("hide");
						$("#popupList").find(".slider_wrapper").slick('unslick');
					});

					$("#popupList").modal({backdrop: 'static',keyboard: true,show: true});
					$this.sliderPopup();
					/*if(list[parseInt($(this).attr("index"))]["list"].length > 1){
						$this.sliderPopup();
					}*/
				});
			}
		}
		else{
			$(clone).find(".click_and_show_wrapper").remove();
		}
		if($this.listSlider[i]["click_and_show_image"]){
			var list = $this.listSlider[i]["click_and_show_image"];
			$($this.ccButton_image).find(".text").html($this.listSlider[i]["text"]);
			for (var l = 0; l < list.length; l++) {
				var cButton = $($this.ccButton_image).find(".image_click_and_show").first().clone();
				$(cButton).find(".text_icon").find("p").html(list[l]["title"]);
				if(list[l]["invisible_title"]){
					$(cButton).find(".text_icon").hide();
				}else{
					$(cButton).find(".text_icon").show();
				}
				$(cButton).find(".icon_image").attr("src","assets/image/slider/"+list[l]["image"]);
				
				if(list[l]["col_xs"] != undefined){
					var col_xs = list[l]["col_xs"];
					// console.log($(cButton));
					$(cButton).removeClass("col-xs-6");
					$(cButton).addClass("col-xs-"+col_xs);
					$(cButton).find(".icon_image").css({"width":"100%","height":"100%"});
					$(cButton).find("p").css({"width":"100%"});
					$(cButton).css({"height":"26.4vh"});
					// console.log($(cButton).closest(".click_and_show_image"));
					$(clone).find(".click_and_show_image").css({"padding":"3.6vh 3.55vh"});
				}

				$(clone).find(".click_and_show_image").append(cButton);
				$(cButton).attr("index",l);
				if(list[l]["noclick"] != undefined || !list[l]["noclick"]){
					$(cButton).click(function(e){
						// game.audio.audioButton.play();
						let src = "assets/audio/sound_button_image.wav";
						game.audio.audio_dynamic(src).play();
						if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_after_click"]){
							$(this).find(".icon_image").attr("src","assets/image/slider/"+$this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_after_click"]);
						}
						if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["nextslide"]){
							game.audio.audioButton.play();
							game.setSlide($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["nextslide"]);
						}else{
							$("#popupList").find(".slider_wrapper").html("");
							$("#popupList .title").html($(this).find(".text_icon").html());
							$this.countSlide = $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length;
							if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_logo"]){
								$("#popupList .logo_image").find("img").attr("src","assets/image/slider/"+$this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["image_logo"]);
								$("#popupList").find(".logo_image").show();
							}else{
								$("#popupList").find(".logo_image").hide();
							}
							for (var m = 0; m < $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length; m++) {
								var cWrapper = $($this.cloneWrapper).first().clone();
								cWrapper.html("");
								for(var n = 0; n < $this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"][m].length; n++){
									var cList = $($this.cloneList).first().clone();
									$(cList).find(".point_desc").html($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"][m][n]);
									$(cWrapper).append(cList);
								}
								$("#popupList").find(".slider_wrapper").append(cWrapper);
							}
							$("#popupList .button_wrapper").click(function(e){
								// game.audio.audioButton.play();
								let src = "assets/audio/sound_button_popup.wav";
								game.audio.audio_dynamic(src).play();
								$(this).off();
								$("#popupList").modal("hide");
								// $("#popupList").find(".slider_wrapper").slick('unslick');
							});

							$("#popupList").modal({backdrop: 'static',keyboard: true,show: true});
								
							setTimeout(()=>{
								$("#popupList .description").scrollTop(0);
							},300);

							// $this.sliderPopup();
							//$("#popupList .button_wrapper").hide();
							/*if($this.listSlider[parseInt($(this).closest(".list_slider").attr("data-slick-index"))]["click_and_show_image"][parseInt($(this).attr("index"))]["list"].length > 1){
								$this.sliderPopup();
								$("#popupList .button_wrapper").hide();
							}*/
						}
					});
				}
			}

			//setting gesture tap
			$(".gesture_wrapper").show();
			$(".gesture_wrapper img").unbind().click(()=>{
				game.audio.audioGesture.play();
				$(".gesture_wrapper").hide();
			});
		}
		else{
			$(clone).find(".click_and_show_image").remove();
		}

		if($this.listSlider[i]["flipcard"]){
            $(clone).find(".flip_wrapper").html("");
            for(j = 0; j < $this.listSlider[i]["flipcard"].length; j++){
                var afterclick = $this.listSlider[i]["flipcard"];
                $clone_flipcard = $this.flipcard.clone();
                $clone_flipcard.find(".flipcard_front").css("background","url(assets/image/slider/"+$this.listSlider[i]["flipcard"][j]["bg_front"]+") no-repeat center / cover");
                $clone_flipcard.find(".flipcard_front p").html($this.listSlider[i]["flipcard"][j]["text_front"]);
                $clone_flipcard.find(".flipcard_back .header_flipback").css("background",$this.listSlider[i]["flipcard"][j]["bg_back"]);
                $clone_flipcard.find(".flipcard_back .title_flip").html($this.listSlider[i]["flipcard"][j]["text_front"]);
                $clone_flipcard.find(".flipcard_back .content_flip").html($this.listSlider[i]["flipcard"][j]["text_back"]);
                $clone_flipcard.find(".flipcard_front").click(function(){
                    var complete = false;
                    var $flipcard_front = $(this);
                    var afterclick2 = afterclick[$(this).parent().attr("data-slick-index")]["bg_afterclik"];
                    $flipcard_front.addClass("active");
                    $flipcard_front.parent().find(".flipcard_back").addClass("active");
                    setTimeout(function(){
                        $flipcard_front.css("background","url(assets/image/slider/"+afterclick2+") no-repeat center / cover");
                    },250);
                    if(!$flipcard_front.parent().hasClass("select")){
                        $flipcard_front.parent().addClass("select");
                    }
                    $(clone).find(".flip_wrapper .flipcard").each(function(){
                        if(!$(this).hasClass("select")){
                            complete = false;
                            return false;
                        }else{
                            complete = true;
                        }
                    });
                    if(complete){
                        $(clone).find(".button").removeAttr("disabled");
                    }
                });
                $clone_flipcard.find(".flipcard_back").click(function(){
                    $(this).removeClass("active");
                    $(this).parent().find(".flipcard_front").removeClass("active");
                });
                $(clone).find(".flip_wrapper").append($clone_flipcard);
            }
        }else{
            $(clone).find(".flip_wrapper").remove();
        }
		
		$("#ulasan").append(clone);
		if($this.listSlider[i]["ribbon"]){
			var rb_height = $(clone).find(".ribbon_header").innerHeight();
			if($this.listSlider[i]["image"]){
				var pd_img_rb = $(clone).find(".ribbon_header").innerHeight()-20;
				$(clone).find(".col_md_two").css("margin-top",pd_img_rb+"px");
			}else{
				$(clone).find(".col_md_two").css("margin-top",rb_height+"px");
			}
		}

		if($this.listSlider[i]["button"]){
			for (var j = 0; j < $this.listSlider[i]["button"].length; j++) {
				var cloneBtn = $this.button.clone();
				var show_button = true;
				$(cloneBtn).html($this.listSlider[i]["button"][j]["text"]);
				if($this.listSlider[i]["button"][j]["css"]){
					$(cloneBtn).css($this.listSlider[i]["button"][j]["css"]);
				}
				$(clone).find(".button_wrapper").append(cloneBtn);
				if($this.listSlider[i]["click_and_show_image"]){
					var list_clone = $this.listSlider[i]["click_and_show_image"];
					for(var k = 0; k < list_clone.length; k++){
						if(list_clone[k]["rmpt"] == undefined){
							show_button = true;
							break;
						}else if(game.scorm_helper.getSingleData(list_clone[k]["text"]) == undefined){
							show_button = false;
							break;
						}
					}
					if(show_button){
						$(cloneBtn).show();
					}else{
						$(cloneBtn).hide();
					}
				}
				if($this.listSlider[i]["button"][j]["complete"]){
					game.scorm_helper.sendResult(100);
					game.scorm_helper.setStatus("passed");
					$(cloneBtn).click(function(e){
						game.audio.audioButton.play();
						try{
				            var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
				            btn_back.click();
				        }
				        catch(e){
				            top.window.close();
				        }
					});
				}
				else if($this.listSlider[i]["button"][j]["gotoSlide"]){
					$(cloneBtn).attr("gotoSlide",$this.listSlider[i]["button"][j]["gotoSlide"]);
					$(cloneBtn).click(function(e){
						$(this).off();
						game.audio.audioButton.play();
						game.scorm_helper.setSlide(parseInt($(this).attr("gotoSlide"))-1);
						game.nextSlide();
					});
				}
				else{
					if($this.listSlider[i]["video"]){
						//set button disabled
						$(cloneBtn).attr("disabled","");

						$(cloneBtn).click(function(e){
							e.preventDefault();
							game.audio.audioButton.play();
							 // game.nextSlide();
							
							$("#popupAlertVideo").modal({backdrop: 'static',keyboard: true,show: true});
							$('.modal-backdrop').appendTo('#content');
							$("#popupAlertVideo .popupalert-yes").click(function(e){
							    $(this).off();
							    $("#popupAlertVideo").modal("hide");
							    game.audio.audioButton.play();
							    game.nextSlide();
							});
							$("#popupAlertVideo .popupalert-no").click(function(e){
								$(this).off();
								$("#popupAlertVideo .popupalert-yes").off();
								game.audio.audioButton.play();
							    $("#popupAlertVideo").modal("hide");
							});
							$("#popupAlertVideo .img-popup").click(function(e){
								$(this).off();
								$("#popupAlertVideo .popupalert-yes").off();
								game.audio.audioButton.play();
							    $("#popupAlertVideo").modal("hide");
							});
						});
					}
					else{
						if($this.listSlider[i]["button"][0]["popup"]){
							if($this.listSlider[i]["button"][0]["popup_gotoSlide"]){
								var popup_nextslide = $this.listSlider[i]["button"][0]["popup_gotoSlide"];
							}
							var pop = $this.listSlider[i]["button"][0]["popup"];
							$(cloneBtn).click(function(e){
								let src = "assets/audio/sound_button_slider.wav";
								game.audio.audio_dynamic(src).play();
								$("#"+pop).modal({backdrop: 'static',keyboard: true,show: true});
								$("#"+pop+" .popupalert-yes").click(function(e){
								    $(this).off();
								    $("#"+pop).modal("hide");
								    let src = "assets/audio/sound_button_popup.wav";
								    game.audio.audio_dynamic(src).play();
								    if(popup_nextslide){
								    	game.scorm_helper.setSlide(parseInt(popup_nextslide)-1);
										game.nextSlide();
								    }else{
								    	game.nextSlide();
									}
								});
								$("#"+pop+" .popupalert-no").click(function(e){
									$(this).off();
									$("#"+pop+" .popupalert-yes").off();
									// game.audio.audioButton.play();
									let src = "assets/audio/sound_button_popup.wav";
									game.audio.audio_dynamic(src).play();
								    $("#"+pop).modal("hide");
								});
								$("#"+pop+" .img-popup").click(function(e){
									$(this).off();
									$("#"+pop+" .popupalert-yes").off();
									// game.audio.audioButton.play();
									let src = "assets/audio/sound_button_popup.wav";
									game.audio.audio_dynamic(src).play();
								    $("#"+pop).modal("hide");
								});
							});
						}else{
							var tutorial = $this.listSlider[i]["button"][0]["tutorial"];
							var link = $this.listSlider[i]["button"][0]["link"];
							$(cloneBtn).click(function(e){
								if(tutorial){
									$("#tutorial .tutorial").removeClass("active");
									$("#tutorial .tutorial.link_web").addClass("done");
									$("#tutorial .tutorial.link_web").addClass("active");
									$("#tutorial").modal('show');
									$("#tutorial .start-game").click(function(e){
										$("#tutorial").modal('hide');
										$(this).off();
										game.audio.audioButton.play();
										window.open(link);
								    });
								}else{
									let src = "assets/audio/sound_button_slider.wav";
									game.audio.audio_dynamic(src).play();
									if($this.audio){
										$this.audio_slider.pause();
									}
									game.nextSlide();
								}
							});
						}
					}
				}
			}
		}
		else{
			$(clone).find(".button_wrapper").remove();
		}

		if($this.listSlider[i]["flipcard"]){
            if($this.listSlider[i]["flipcard_type"] == "essensial"){
                $(clone).find(".button").attr("disabled","disabled");
            }
            $(clone).find(".flip_wrapper").slick({
                dots: true,
                infinite: false,
                speed: 500,
                arrows: false,
                centerMode: true,
                centerPadding: '1em'
            });
        }

		if($this.listSlider[i]["style"] != "" && $this.listSlider[i]["style"] != undefined){
			let style = $this.listSlider[i]["style"];
			// console.log(style);
			// console.log(Object.keys(style));
			let arr_keys = Object.keys(style);
			// console.log(arr_keys.length);
			for (var k = 0; k < arr_keys.length; k++) {
				// console.log($(arr_keys[k]));
				$(arr_keys[k]).css(style[arr_keys[k]]);
			}
		}
	}
	setTimeout(function(){
		$(".list_slider").each(function(index){
			var image = $(this).find(".img-load").outerHeight()?$(this).find(".img-load").outerHeight():0;
			var ribbon = $(this).find(".rb-wrap").outerHeight()?$(this).find(".rb-wrap").outerHeight():0;
			var button = $(this).find(".button_wrapper").outerHeight()?$(this).find(".button_wrapper").outerHeight():0;
			var keterangan = $(this).find(".keterangan").outerHeight()?$(this).find(".keterangan").outerHeight():0;
			var device = $(window).outerHeight();

			if($this.listSlider[index] !=undefined){
				if(!$this.listSlider[index]["click_and_show_image"]){
					if($this.listSlider[index]["image"] && $this.listSlider[index]["ribbon"]){
						var height_text = device-(image+ribbon+button)+40;
					}else if($this.listSlider[index]["image"]){
						var height_text = device-(image+ribbon+button)+20;
					}else{
						var height_text = device-(image+ribbon+button);
					}
					$(this).find(".right-container").css("max-height",height_text+"px");
				}else{
					var height_cas = device-(image+ribbon+button+keterangan+20);
					$(this).find(".click_and_show_image").css("height",height_cas+"px");
				}
			}
		});
	},1000);
	$('#ulasan').slick({
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false
      });
      /*$("#ulasan").on('afterChange', function(event, slick, currentSlide, nextSlide){
         $(".img-load").each(function(e){
           var src = $(this).attr("src");
           $(this).attr("src",src);
         });
     });*/

    /*$("#popupList").slick({
    	dots: true,
    	infinite: false,
    	speed: 500
    });*/
	
	if($this.flag_image_click != undefined){
		if($this.flag_image_click == true){
			$(clone).find(".video img").eq($this.total_slide - 1).click(function(e){
			    // $(this).off();
			    // alert($this.total_slide);
			    game.nextSlide();
			});
		}
	}
};

Slider.prototype.sliderPopup = function() {
	var $this = this;
	$("#popupList").find(".slider_wrapper").slick({
		slidesToShow: 1,
		dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        variableWidth: true
	});
	$("#popupList").find(".slider_wrapper").on("afterChange", function(event, slick, currentSlide, nextSlide){
		if(currentSlide+1 == $this.countSlide){
			$("#popupList .button_wrapper").show();
		}else{
			$("#popupList .button_wrapper").hide();
		}
	});
	//$("#popupList").find(".slider_wrapper")[0].slick.refresh();
	/*$('.modal').on('shown.bs.modal', function (e) {
		$("#popupList").find(".slider_wrapper").resize();
	});*/
};