var Audio = function(){
	this.audioButton = document.createElement('audio');
    this.audioButton.setAttribute('src', 'assets/audio/sound_button.wav');

	this.audioButtonPopup = document.createElement('audio');
    this.audioButtonPopup.setAttribute('src', 'assets/audio/sound_button_popup.wav');

	this.audioTutor = document.createElement('audio');
    this.audioTutor.setAttribute('src', 'assets/audio/sound_button_popup.wav');

	this.audioButtonHiddenObject = document.createElement('audio');
    this.audioButtonHiddenObject.setAttribute('src', 'assets/audio/sound_button_popup.wav');

	this.audioButtonImage = document.createElement('audio');
    this.audioButtonImage.setAttribute('src', 'assets/audio/sound_button_image.wav');

	this.audioBenar = document.createElement('audio');
	this.audioBenar.setAttribute('src', 'assets/audio/correct.mp3');

	this.audioButtonMissing = document.createElement('audio');
    this.audioButtonMissing.setAttribute('src', 'assets/audio/sound_button.wav');

	this.audioSalah = document.createElement('audio');
	this.audioSalah.setAttribute('src', 'assets/audio/incorrect.mp3');

	this.audioKalah = document.createElement('audio');
	this.audioKalah.setAttribute('src', 'assets/audio/tryAgain.mp3');

	this.audioMenang = document.createElement('audio');
	this.audioMenang.setAttribute('src', 'assets/audio/YouDidIT_Congratz_mixdown.mp3');

	this.audioBackground = document.createElement('audio');
	this.audioBackground.setAttribute('src', 'assets/audio/sound_button.mp3');
	
	this.audioGesture = document.createElement('audio');
    this.audioGesture.setAttribute('src', 'assets/audio/Points1.wav');

    this.audioBackgroundSlider = document.createElement('audio');
    this.audioBackgroundSlider.setAttribute('src', 'assets/audio/sound_button.wav');

	this.audioError = document.createElement('audio');
	this.audioError.setAttribute('src', 'assets/audio/error.mp3');

   	this.audio_dynamic = function(src){
		this.audioDynamic = document.createElement('audio');
		this.audioDynamic.setAttribute('src', src);
		return this.audioDynamic;
	}
}