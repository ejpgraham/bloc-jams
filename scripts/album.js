

var createSongRow = function(songNumber, songName, songLength){
  var template =
     '<tr class="album-view-song-item">'
   + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
   + '  <td class="song-item-title">' + songName + '</td>'
   + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
   + '</tr>'
   ;

   var $row = $(template);

   var clickHandler = function() {
     var clickedSongNumber = parseInt($(this).attr('data-song-number'));

     if (currentlyPlayingSongNumber !== null) {
      var previouslyPlayingSong = getSongNumberCell(currentlyPlayingSongNumber);
      previouslyPlayingSong.html(currentlyPlayingSongNumber);
     }

     if (clickedSongNumber !== currentlyPlayingSongNumber) {
       setSong(clickedSongNumber);
       $(this).html(pauseButtonTemplate);
       updatePlayerBarSong();
       currentSoundFile.play();

       var $volumeFill = $('.volume .fill');
       var $volumeThumb = $('.volume .thumb');
       $volumeFill.width(currentVolume + '%');
       $volumeThumb.css({left: currentVolume + '%'});

       updateSeekBarWhileSongPlays();

     } else if (currentlyPlayingSongNumber === clickedSongNumber) {
       if ( currentSoundFile.isPaused() ){
         $(this).html(pauseButtonTemplate);
         $('.main-controls .play-pause').html(playerBarPauseButton);
         currentSoundFile.play();
         updateSeekBarWhileSongPlays();
     } else {
       $(this).html(playButtonTemplate);
       $('.main-controls .play-pause').html(playerBarPlayButton);
       currentSoundFile.pause();
     }
     }
   };

   var onHover = function(event){
     var songItemNumber = $(this).find('.song-item-number');
     var songData = parseInt(songItemNumber.attr('data-song-number'));
     if (songData !== currentlyPlayingSongNumber) {
       songItemNumber.html(playButtonTemplate);

      }
   };

   var offHover = function(event){
     var songItemNumber = $(this).find('.song-item-number');
     var songData = parseInt(songItemNumber.attr('data-song-number'));
     if (songData !== currentlyPlayingSongNumber){
       songItemNumber.html(songData);
   }
   };

   $row.find('.song-item-number').click(clickHandler);
   $row.hover(onHover, offHover);
   return $row;
};

var updatePlayerBarSong = function() {
  $('.song-name').text(currentSongFromAlbum.title);
  $('.artist-name').text(currentAlbum.artist);
  $('.artist-song-mobile').html(currentAlbum.songs[currentlyPlayingSongNumber - 1].title + " - " + currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
  setTotalTimeInPlayerBar(currentAlbum.songs[currentlyPlayingSongNumber - 1].duration);
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $songRow = createSongRow( i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($songRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event){
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      setCurrentTimeInPlayerBar(this.getTime());
      updateSeekPercentage($seekBar, seekBarFillRatio);
      if (seekBarFillRatio === 1 && currentlyPlayingSongNumber < currentAlbum.songs.length){
        nextSong();
      } else if (seekBarFillRatio === 1 && currentlyPlayingSongNumber === currentAlbum.songs.length){
        getSongNumberCell(currentlyPlayingSongNumber).html(currentlyPlayingSongNumber);
        clearPlayerBar();
        currentSoundFile = null;
      }
    });
  }
};

var clearPlayerBar = function() {
  updateSeekPercentage($('.seek-control .seek-bar'), 0);
  $('.song-name').text("");
  $('.artist-name').text("");
  $('div .current-time').text("");
  $('div .total-time').text("");
  $playerBarPlayPauseButton.html(playerBarPlayButton);
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');
  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($(this).parent().attr('class') == 'seek-control' ){
      seek(seekBarFillRatio * currentSoundFile.getDuration())
    } else {
      setVolume(seekBarFillRatio * 100);
    }

    updateSeekPercentage($(this), seekBarFillRatio )
  });

  $seekBars.find('.thumb').mousedown(function(event){
    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(event){
        var offsetX = event.pageX - $seekBar.offset().left;
        var barWidth = $seekBar.width();
        var seekBarFillRatio = offsetX / barWidth;

        if ( $(this).parent().attr('class') == 'seek-control' ) {
          seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
          setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($seekBar, seekBarFillRatio);
    });
    $(document).bind('mouseup.thumb', function() {
        $(document).unbind('mousemove.thumb');
        $(document).unbind('mouseup.thumb');
    });
  });
};

var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
  var time = Math.floor(parseFloat(timeInSeconds));
  if (time >= 60) {
    var minutes = Math.floor(time/60);
    var seconds = (time%60);
  } else {
    var minutes = 0;
    var seconds = time;
  }

  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return minutes + ':' + seconds
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex += 1;

  if (currentSongIndex >= currentAlbum.songs.length){
    currentSongIndex = 0;
  }

  var lastSongNumber = currentlyPlayingSongNumber;
  setSong((currentSongIndex+1));
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  var previousCell = getSongNumberCell(lastSongNumber);
  var currentCell = getSongNumberCell(currentlyPlayingSongNumber);

  previousCell.html(lastSongNumber);
  currentCell.html(pauseButtonTemplate);
};

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex -= 1;

  if (currentSongIndex <= -1){
    currentSongIndex = currentAlbum.songs.length - 1;
  }

  var lastSongNumber = currentlyPlayingSongNumber;
  setSong((currentSongIndex + 1));
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  var previousCell = getSongNumberCell(lastSongNumber);
  var currentCell = getSongNumberCell(currentlyPlayingSongNumber);

  previousCell.html(lastSongNumber);
  currentCell.html(pauseButtonTemplate);
};

var setSong = function(songNumber) {
  if (currentSoundFile){
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = songNumber;
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true,
  });
  setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile){
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(songNumber){
  return $('.song-item-number[data-song-number="' + songNumber + '"]');
};

var togglePlayFromPlayerBar = function(){
  var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
  if (currentSoundFile === null){
    $(this).html(playerBarPauseButton);
    setSong(1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
  } else if (currentSoundFile.isPaused()){
    $currentlyPlayingCell.html(pauseButtonTemplate);
    $(this).html(playerBarPauseButton);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
  } else if (currentSoundFile) {
    $currentlyPlayingCell.html(playButtonTemplate);
    $(this).html(playerBarPlayButton);
    currentSoundFile.pause();
  }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playerBarPlayPauseButton = $('.main-controls .play-pause');

$(document).ready (function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playerBarPlayPauseButton.click(togglePlayFromPlayerBar);
});
