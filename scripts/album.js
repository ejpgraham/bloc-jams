

var createSongRow = function(songNumber, songName, songLength){
  var template =
     '<tr class="album-view-song-item">'
   + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
   + '  <td class="song-item-title">' + songName + '</td>'
   + '  <td class="song-item-duration">' + songLength + '</td>'
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
     } else if (currentlyPlayingSongNumber === clickedSongNumber) {
       if ( currentSoundFile.isPaused() ){
         $(this).html(pauseButtonTemplate);
         $('.main-controls .play-pause').html(playerBarPauseButton);
         currentSoundFile.play();
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

var setVolume = function(volume) {
  if (currentSoundFile){
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(songNumber){
  return $('.song-item-number[data-song-number="' + songNumber + '"]');
};

var togglePlayFromPlayerBar = function(){

  if (currentSoundFile.isPaused()){
    $(this).html(playerBarPauseButton);
    currentSoundFile.play();
  } else {
    $(this).html(playerBarPlayButton);
    currentSoundFile.pause();
  }

  // setSong(clickedSongNumber);
  // $(this).html(pauseButtonTemplate);
  // currentSoundFile.play();

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
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playerBarPlayPauseButton.click(togglePlayFromPlayerBar);
});
