/**
* this is a class for generate game results either star or score.
* @class
* @author     NejiElYahya
*/

var resultStep = function(){

}


resultStep.prototype.init = function(current_settings) {
    var $this = this;
    $this.current_settings = current_settings;
    $this.game_data = (game.scorm_helper.getSingleData('game_data') != undefined ? game.scorm_helper.getSingleData('game_data') : {});
    $this.play_video_interval_step; //variabel interval play video
    $this.video_path = 'assets/image/result/';
    // $this.score = 0;
        console.log("RESULT")
    // console.log("setting_result_step_slide:"+$this.current_settings["slide"]);
    $.get("config/setting_result_step_slide_"+$this.current_settings["slide"]+".json",function(e){
        console.log(e);
        $this.ldata = e;
        $this.score = e["score"];
        $this.background = e["background"];
        $this.win = e["win"];
        $this.lose = e["lose"];
        $this.setResult();
    },'json');
};

resultStep.prototype.setResult = function() {
    var $this = this;
    var notquiz = 0;

    //hide header
    $(".header").hide();

    // remove jquery mobile
    $("html").removeClass("ui-mobile");
    // game.audio.audioBackground.pause();
    // game.audio.audioMotor.pause();

    /*comment by elim*/ //tambah getQuizResult di slide quizVisnov -1 dari current result_step 
    console.log("game_slide_"+($this.current_settings["slide"]-1));
    var game_quiz = game.scorm_helper.getQuizResult(["game_slide_"+($this.current_settings["slide"] - 1)]);
    // var game_quiz2 = game.scorm_helper.getQuizResultPrefix();
    // var game_quiz = game.scorm_helper.getQuizResultPrefix();
    console.log($this.game_data);
    console.log(game_quiz);
    // console.log(game_quiz2);

    // var score = 0; //tambah kalkulasi score 
    // var score = $this.game_data["total_answer_true_2"] / $this.game_data["total_soal_current_slide"] * 100;
    var score = parseInt(game_quiz["score"])/parseInt(game_quiz["total_soal"])*game.max_score;

    /*end comment by elim*/
    // count score range 0-100 for save to cmi.raw.score
    // var count = score/game.max_score*100;
    // for score in text
   // $(".star_score_wrapper").hide();
   //tambah .html score dan score_wrapper
    $(".score").html(Math.round(score));
    if($this.score){
        $(".star_wrapper").hide();
        $(".score_wrapper").show();
    }else{
        $(".star_wrapper").show();
        $(".score_wrapper").hide();
    }
    var complete_stage_arr 

    if(game_quiz["total_soal"] == 0){
        if($this.game_data["evaluation"]){
            let selected_stage = $this.game_data["selected_stage"];
            let push_stage = ($this.game_data["push_stage"] != undefined ? $this.game_data["push_stage"] : []);
            let not_quiz = ($this.game_data["not_quiz"] != undefined ? $this.game_data["not_quiz"] : []);
            notquiz = 1;
            
    
            push_stage.push(selected_stage);
            not_quiz.push(selected_stage);
            
            $this.game_data["push_stage"] = push_stage;
            $this.game_data["not_quiz"] = not_quiz;
            complete_stage_arr = $this.game_data["push_stage"];
        } else {
            let selected_stage = $this.game_data["selected_stage"];
            let complete_stage = ($this.game_data["complete_stage"] != undefined ? $this.game_data["complete_stage"] : []);
            let not_quiz = ($this.game_data["not_quiz"] != undefined ? $this.game_data["not_quiz"] : []);
            notquiz = 1;

            let index_complete = complete_stage.indexOf(selected_stage);
            let index_not_quiz = complete_stage.indexOf(selected_stage);
            if(index_complete == -1){
                complete_stage.push(selected_stage);
            }
            if(index_not_quiz == -1){
                not_quiz.push(selected_stage);
            }
            
            $this.game_data["complete_stage"] = complete_stage;
            $this.game_data["not_quiz"] = not_quiz;
            complete_stage_arr = $this.game_data["complete_stage"];
        }
    } else {
        if($this.game_data["evaluation"]){
            let selected_stage = $this.game_data["selected_stage"];
            let push_stage = ($this.game_data["push_stage"] != undefined ? $this.game_data["push_stage"] : []);
            
    
            push_stage.push(selected_stage);
            
            $this.game_data["push_stage"] = push_stage;
            complete_stage_arr = $this.game_data["push_stage"];
        } else {
            let selected_stage = $this.game_data["selected_stage"];
            let complete_stage = ($this.game_data["complete_stage"] != undefined ? $this.game_data["complete_stage"] : []);
            let failed_stage = ($this.game_data["failed_stage"] != undefined ? $this.game_data["failed_stage"] : []);
            let percent_correct_answer =  game_quiz["score"] / game_quiz["total_soal"] * 100;
            let percent_correct_answer_per_stage = game.max_score;
    
    
            if(percent_correct_answer >=  percent_correct_answer_per_stage){
                let index_failed = failed_stage.indexOf(selected_stage);
                let index_complete = complete_stage.indexOf(selected_stage);
                if(index_failed > -1){
                    failed_stage.splice(index_failed,1);
                }
                // revisi tambah if statement agar setelah stage selected complete tidak ngepush lagi 09-07-21
                if(index_complete == -1){
                    complete_stage.push(selected_stage);
                }
            }else{
                // console.log(game.scorm_helper.ldata);
                let quiz = game.scorm_helper.ldata["quiz"];
                // console.log(quiz.length);
                // console.log($this.question_datas.length);
    
                let index_failed = failed_stage.indexOf(selected_stage);
                let index_complete = complete_stage.indexOf(selected_stage);
                // let start_index = parseInt(quiz.length) - parseInt($this.question_datas.length);
                // quiz.splice(start_index,parseInt($this.question_datas.length));
    
                //kurangi last_score dari score yang salah dijawab pada satage ini
                if($this.game_data["last_score"] > 0){
                    // console.log($this.game_data["total_answer_true"]);
                    // if(selected_stage == 1){
                    //     $this.game_data["last_score"] = 0;
                    // }else{
                        // $this.game_data["last_score"] -= $this.game_data["total_answer_true"];
                    // }
                }
                // revisi tambah if statement agar setelah stage selected complete dan failed lagi, tidak ngepush ke failed_stage 09-07-21
                if(index_failed == -1 && index_complete == -1){
                    // console.log(quiz);
                    failed_stage.push(selected_stage);
                }
            }
    
            if((($this.curr_step+1) < $this.game_data["total_stage"]) && ((complete_stage.length + failed_stage.length) == ($this.curr_step+1))){
                $this.curr_step += 1; 
                $this.game_data["curr_step"] = $this.curr_step;
            }
    
            $this.game_data["complete_stage"] = complete_stage;
            $this.game_data["failed_stage"] = failed_stage;
    
            console.log(score);
            console.log(game.min_score);
            complete_stage_arr = $this.game_data["complete_stage"];
            console.log(complete_stage_arr.indexOf($this.game_data["selected_stage"]));
        }
    }
    

    
    // if(complete_stage_arr.indexOf($this.game_data["selected_stage"]) > -1){
    if(Math.round(score) >= game.min_score || notquiz == 1){
        // set to win
        // $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
        // $this.win["backsound"] = undefined;

        // set kedipan jika current stage complete (centang)
        game.kedip = 0;
         //play audio
        if($this.win["backsound"] != undefined && $this.win["backsound"] != ""){
            let looping = false;
            game.playBacksound($this.win["backsound"], looping);
        }else{
            game.audio.audioMenang.play();
        }

        // game.scorm_helper.setStatus("passed");
        $(".result_wrapper").addClass("win");
        // $(".ribbon_result img").attr("src","assets/image/result/"+$this.win["ribbon"]);
        let img_url = "assets/image/result/"+$this.win["ribbon"];
        $(".ribbon_result .text_ribbon_result").css({"background":"url('"+img_url+"')","background-size":"100% 100%"});
        $(".ribbon_result .text_ribbon_result").html($this.win["ribbon_text"]);
        $(".score_wrapper").css($this.win["score_css"]);
        $(".text_wrapper").html($this.win["description"]["text"]);
        $(".text_wrapper").css($this.win["description"]["css"]);
        $(".button").html($this.win["button"]["text"]);
        $(".button").css($this.win["button"]["button_css"]);
        $(".button").addClass("btn-next-result");

        // $interval = setInterval(function(){
        //     clearInterval($interval);
        //     $(".ribbon_result .text_ribbon_result").css({"background":"url('"+img_url+"')","background-size":"100% 100%"});
        // },300);
        //validasi set background using gif or video
        if($this.ldata['background_video'] != undefined && $this.ldata['background_video'] != ""){
            let $clone = $("#body");
            let src = $this.ldata['background_video'];
            $this.setVideo($clone, src);
        }else{
            $(".result_wrapper").css("background","url(assets/image/cover/"+$this.background+") no-repeat center / cover");
        }

        // go to next slide
        $(".btn-next-result").click(function(e){
            //clear interval play video
            clearInterval($this.play_video_interval_step);

            game.audio.audioButton.play();
            //$(this).off();
            // try{
            //     var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
            //     btn_back.click();
            // }
            // catch(e){
            //     top.window.close();
            // }

            game.setSlide(1);
        });
    }
    else{
        // set to lose
        // $(".slider-content").css({"background":"url('assets/image/result/bg-lose.png') no-repeat center","background-size":"cover"});
        // game.scorm_helper.setStatus("failed");
        // set kedipan jika current stage failed (silang)
        if($this.game_data["complete_stage"].indexOf($this.game_data["selected_stage"]) == -1){
            game.kedip = 1;
        } else {
            game.kedip = 0;
        }
        //play audio
        if($this.lose["backsound"] != undefined && $this.lose["backsound"] != ""){
            let looping = false;
            game.playBacksound($this.lose["backsound"], looping);
        }else{
            game.audio.audioKalah.play();
        }

        $(".result_wrapper").addClass("lose");
        // $(".ribbon_result img").attr("src","assets/image/result/"+$this.lose["ribbon"]);
        let img_url = "assets/image/result/"+$this.lose["ribbon"];
        $(".ribbon_result .text_ribbon_result").css({"background":"url('"+img_url+"')","background-size":"100% 100%"});
        $(".ribbon_result .text_ribbon_result").html($this.lose["ribbon_text"]);
        $(".score_wrapper").css($this.lose["score_css"]);
        $(".text_wrapper").html($this.lose["description"]["text"]);
        $(".text_wrapper").css($this.lose["description"]["css"]);
        $(".button").html($this.lose["button"]["text"]);
        $(".button").css($this.lose["button"]["button_css"]);
        $(".button").addClass("btn-tryagain_step");

        // $interval2 = setInterval(function(){
        //     clearInterval($interval2);
        //     $(".ribbon_result .text_ribbon_result").css({"background":"url('"+img_url+"')","background-size":"100% 100%"});
        // },300);
        //validasi set background using gif or video
        if($this.ldata['background_lose_video'] != undefined && $this.ldata['background_lose_video'] != ""){
            let $clone = $("#body");
            let src = $this.ldata['background_lose_video'];
            $this.setVideo($clone, src);
        }else{
            $(".result_wrapper").css("background","url(assets/image/cover/"+$this.background+") no-repeat center / cover");
        }

        // click try again button
        $(".btn-tryagain_step").click(function(e){
            //clear interval play video
            // alert($this.play_video_interval);
            clearInterval($this.play_video_interval_step);
            // alert($this.play_video_interval);

            game.audio.audioButton.play();
            //$(this).off();
            // try{
            //     var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
            //     btn_back.click();
            // }
            // catch(e){
            //     top.window.close();
            // }

            game.setSlide(1);
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

resultStep.prototype.setVideo = function($clone, src) {
    // console.log("setVideo");
    var $this = this;
    // console.log($("#video").find("source"));
    // console.log($this.video_path+src);
    $("#video").find("source").attr("src",$this.video_path+src);
    // console.log($(".img_video"));
    $(".img_video").hide();
    $("#video").hide();
    $("#video")[0].load();

    game.showLoading();
    $("#video").on("canplay",function(e){
        game.hideLoading();
        $("#video").show();
        $this.playVideo();

        $("#video").on("ended",function(e){
            $(this).off();
            // $this.pauseVideo();

            //call function set video, to call again this video
            // $this.play_video_interval_step = setInterval(function() {
            //     $this.playVideo();
            // },200);

            $this.playVideo_loop();
        });
    });
};

resultStep.prototype.playVideo = function() {
    var $this = this;
    $("#video")[0].play();
};

resultStep.prototype.playVideo_loop = function() {
    var $this = this;
    // console.log(/*$("#video")[0]*/);

    $("#video")[0].loop = true;
    $("#video")[0].play();
};

resultStep.prototype.pauseVideo = function() {
    var $this = this;
    $("#video")[0].pause();
};