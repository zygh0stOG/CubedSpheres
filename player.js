/*!
 *  Howler.js Audio Player Demo
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

var DEBUG = true;

// Cache references to DOM elements.
var elms = ['title', 'track', 'timer', 'duration', 'controlsOuter', 'controlsInner', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'colorlistBtn', 'playlistBtn', 'rotationBtn', 'volumeBtn', 'progressEmpty', 'progress', 'progressBar', 'progressBtn', 'loading', 'colorlist', 'clist', 'playlist', 'plist', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];
if (DEBUG == true) { elms.push('debug','freeze'); }
elms.forEach(function (elm) {
    window[elm] = document.getElementById(elm);
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function (playlist) {
    this.playlist = playlist;
    this.index = 0;

    // Display the title of the first track.
    track.innerHTML = '1. ' + playlist[0].title;

    // Setup the playlist display.
    playlist.forEach(function (song) {
        var div = document.createElement('div');
        div.className = 'list-song';
        div.innerHTML = (playlist.indexOf(song) + 1) + ". " + song.title;
        div.onclick = function () {
            player.skipTo(playlist.indexOf(song));
        };
        plist.appendChild(div);
    });
};
Player.prototype = {
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    play: async function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];
        dB = data.dB;
        dR = data.dR;
        // If we already loaded this track, use the current one.
        // Otherwise, setup and load a new Howl.
        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                src: ['./audio/' + data.file],
                html5: false, // Force to HTML5 so that the audio can stream in (best for large files).
                onplay: function () {
                    // Display the duration.
                    duration.innerHTML = self.formatTime(Math.round(sound.duration()));

                    // Start upating the progress of the track.
                    requestAnimationFrame(self.step.bind(self));
                    // Start the wave animation if we have already loaded
                    //wave.container.style.display = 'block';
                    //bar.style.display = 'none';
                    pauseBtn.style.display = 'block';
                },
                onload: function () {
                    // Start the wave animation.
                    //wave.container.style.display = 'block';
                    //bar.style.display = 'none';
                    loading.style.display = 'none';
                },
                onend: function () {
                    // Stop the wave animation.
                    //wave.container.style.display = 'none';
                    //bar.style.display = 'block';
                    self.skip('right');
                },
                onpause: function () {
                    // Stop the wave animation.
                    //wave.container.style.display = 'none';
                    //bar.style.display = 'block';
                    //collapseGrid();
                    //rotate = false;
                },
                onstop: function () {
                    // Stop the wave animation.
                    //wave.container.style.display = 'none';
                    //bar.style.display = 'block';
                    //collapseGrid();
                    //rotate = false;
                    //pauseit(500);
                },
                onseek: function () {
                    //self.step();
                    rotate = true;
                    tornado = false;
                }
            });
        }

        // Begin playing the sound.
        //await explodeGridWrapper();//.then(function() {
            //explodeGrid();
            //knotGrow();
            await bigBang();
            if (particleState)
                showObject(centralMass);
            rotate = true;
            tornado = false;
            sound.play();
        //});

        // Update the track display.
        track.innerHTML = (index + 1) + '. ' + data.title;

        // Show the pause button.
        if (sound.state() === 'loaded') {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'block';
        } else {
            loading.style.display = 'block';
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
        }

        // Keep track of the index we are currently playing.
        self.index = index;
        //sound.play();
    },

    /**
     * Pause the currently playing track.
     */
    pause: async function () {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Puase the sound.
        sound.pause();
        rotate = false;
        tornado = false;
        //await collapseGridWrapper();
        //knotShrink();
        //collapseGrid();
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
        await bigCrunch();
        if (particleState)
            hideObject(centralMass);

        // Show the play button.
        playBtn.style.display = 'block';
        //pauseBtn.style.display = 'none';
    },

    /**
     * Skip to the next or previous track.
     * @param  {String} direction 'next' or 'prev'.
     */
    skip: function (direction) {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Get the next track based on the direction of the track.
        var index = 0;
        if (direction === 'prev' && sound.seek() < 2) {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else if (direction === 'prev' && sound.seek() >= 2) {
            self.seek(0);
            return;
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(index);
    },

    /**
     * Skip to a specific track based on its playlist index.
     * @param  {Number} index Index in the playlist.
     */
    skipTo: async function (index) {
        var self = this;

        // Stop the current track.
        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }

        rotate = false;
        tornado = false;
        //await collapseGridWrapper();
        //knotShrink();
        //collapseGrid();
        await bigCrunch();
        if (particleState)
            hideObject(centralMass);

        // Reset progress.
        progressBar.style.width = '0%';
        // Play the new track.
        self.play(index);
    },

    /**
     * Set the volume and update the volume slider display.
     * @param  {Number} val Volume between 0 and 1.
     */
    volume: function (val) {
        var self = this;

        // Update the global volume (affecting all Howls).
        Howler.volume(val);

        // Update the display on the slider.
        var barWidth = (val * 90) / 100;
        barFull.style.width = (barWidth * 100) + '%';
        sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    },

    /**
     * Seek to a new position in the currently playing track.
     * @param  {Number} per Percentage through the song to skip.
     */
    seek: function (per) {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        if (typeof per === 'undefined') {
            return sound.seek();
        }
        // Convert the percent into a seek position.
        //if (sound.playing()) {
            sound.seek(sound.duration() * per);
        //}
        var barWidth = (per * 88) / 100;
        progressBar.style.width = (barWidth * 100) + '%';
        progressBtn.style.left = ((window.innerWidth - progressBar.scrollWidth) - 7.5) + 'px';
        //progressBtn.style.left = (window.innerWidth - progressBar.scrollWidth)-(230+7.5) + 'px';

    },

    /**
     * The step called within requestAnimationFrame to update the playback position.
     */
    step: function () {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Determine our current seek position.
        var seek = sound.seek() || 0;
        timer.innerHTML = self.formatTime(Math.round(seek));
        //var barWidth = (per * 88) / 100;
        var barWidth = (seek / sound.duration());
        //progressBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 7.5) + 'px';
        progressBar.style.width = ((barWidth * 100) || 0) + '%';
        //progressBtn.style.left = ((window.innerWidth - progressBar.scrollWidth) - 7.5) + 'px';
        progressBtn.style.left = window.innerWidth-((window.innerWidth - progressBar.scrollWidth)+(7.5)) + 'px';

        // If the sound is still playing, continue stepping.
        if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
        }
    },

    /**
     * Toggle the playlist display on/off.
     */
    togglePlaylist: function () {
        var self = this;
        var display = (playlist.style.display === 'block') ? 'none' : 'block';

        setTimeout(function () {
            playlist.style.display = display;
        }, (display === 'block') ? 0 : 500);
        playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
    },


    /**
     * Toggle the colorlist display on/off.
     */
    toggleColorlist: function () {
        var self = this;
        var display = (colorlist.style.display === 'block') ? 'none' : 'block';

        setTimeout(function () {
            colorlist.style.display = display;
        }, (display === 'block') ? 0 : 500);
        colorlist.className = (display === 'block') ? 'fadein' : 'fadeout';
    },

    /**
     * Toggle the volume display on/off.
     */
    toggleVolume: function () {
        var self = this;
        var display = (volume.style.display === 'block') ? 'none' : 'block';

        setTimeout(function () {
            volume.style.display = display;
        }, (display === 'block') ? 0 : 500);
        volume.className = (display === 'block') ? 'fadein' : 'fadeout';
    },

    /**
     * Format the time from seconds to M:SS.
     * @param  {Number} secs Seconds to format.
     * @return {String}      Formatted time.
     */
    formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = (secs - minutes * 60) || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
};

// Setup our new audio player class and pass it the playlist.
var player = new Player([
    {
        title: 'Descent',
        file: '01-Descent.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Phantasmagoria',
        file: '02-Phantasmagoria.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Remorseless',
        file: '03-Remorseless.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Ultima scaena',
        file: '04-Ultima_scaena.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Caelestis',
        file: '05-Caelestis.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Lucent Transmissions',
        file: '06-Lucent_Transmissions.mp3',
        howl: null,
        dB: 1.0,
        dR: 0.75
    },
    {
        title: 'Buried',
        file: '07-Buried.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'From Dub Till Dawn',
        file: '08-From_Dub_Till_Dawn.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Hammerhead',
        file: '09-Hammerhead.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Hell Of A Trap',
        file: '10-Hell_Of_A_Trap.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Hong Kong Phooey',
        file: '11-Hong_Kong_Phooey.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Legion of Boom',
        file: '12-Legion_of_Boom.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Loaded',
        file: '13-Loaded.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Neon Dawn',
        file: '14-Neon_Dawn.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Rearranged Cortex',
        file: '15-Rearranged_Cortex.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Rewrapped Tones',
        file: '16-Rewrapped_Tones.mp3',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Exoplanet',
        file: '17-Exoplanet.ogg',
        howl: null,
        dB: 2.0,
        dR: 1.0
    },
    {
        title: 'Scarabaeus',
        file: '18-Scarabaeus.ogg',
        howl: null,
        dB: 1.0,
        dR: 2.0
    },
    {
        title: 'Future Bass',
        file: '19-Future_Bass.ogg',
        howl: null,
        dB: 1.0,
        dR: 2.0
    }
]);

// Bind our player controls.
playBtn.addEventListener('click', function () {
    player.play();
});
pauseBtn.addEventListener('click', function () {
    player.pause();
});
prevBtn.addEventListener('click', function () {
    player.skip('prev');
});
nextBtn.addEventListener('click', function () {
    player.skip('next');
});
/*
waveform.addEventListener('click', function(event) {
  player.seek(event.clientX / window.innerWidth);
});
*/
progressEmpty.addEventListener('click', function (event) {
    var per = event.layerX / parseFloat(progressEmpty.scrollWidth);
    player.seek(per);
});

progressBtn.addEventListener('mousedown', function () {
    window.progressSliderDown = true;
});
progressBtn.addEventListener('touchstart', function () {
    window.progressSliderDown = true;
});
progress.addEventListener('mouseup', function () {
    window.progressSliderDown = false;
});
progress.addEventListener('touchend', function () {
    window.progressSliderDown = false;
});
colorlistBtn.addEventListener('click', function () {
    player.toggleColorlist();
});
colorlist.addEventListener('click', function () {
    player.toggleColorlist();
});
colorlist.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        player.toggleColorlist();
    }
});
playlistBtn.addEventListener('click', function () {
    player.togglePlaylist();
});
playlist.addEventListener('click', function () {
    player.togglePlaylist();
});
playlist.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        player.togglePlaylist();
    }
});
rotationBtn.addEventListener('click', function () {
    rotateOR = (rotateOR) ? false : true;
    rotationBtn.className = (rotateOR) ? 'btn grey' : 'btn red';
});
volumeBtn.addEventListener('click', function () {
    player.toggleVolume();
});
volume.addEventListener('click', function () {
    player.toggleVolume();
});
title.addEventListener('mouseover', function () {
    timer.className = 'item fadein';
    duration.className = 'item fadein';
    progress.className = 'fadein';
});
title.addEventListener('mouseout', function () {
    timer.className = 'item fadeout';
    duration.className = 'item fadeout';
    progress.className = 'fadeout';
});
controlsOuter.addEventListener('mouseover', function () {
    controlsOuter.className = 'fadein';
});
controlsOuter.addEventListener('mouseout', function () {
    controlsOuter.className = 'fadeout';
});
controlsOuter.addEventListener('touchstart', function () {
    controlsOuter.className = 'fadein';
});
controlsOuter.addEventListener('touchend', function () {
    controlsOuter.className = 'fadeout';
});

// Setup the event listeners to enable dragging of volume slider.
barEmpty.addEventListener('click', function (event) {
    var per = event.layerX / parseFloat(barEmpty.scrollWidth);
    player.volume(per);
});
sliderBtn.addEventListener('mousedown', function () {
    window.volumeSliderDown = true;
});
sliderBtn.addEventListener('touchstart', function () {
    window.volumeSliderDown = true;
});
volume.addEventListener('mouseup', function () {
    window.volumeSliderDown = false;
});
volume.addEventListener('touchend', function () {
    window.volumeSliderDown = false;
});

if (DEBUG) {
	//debug.style.display = 'block';
    freeze.addEventListener('click', function () {
        var sound = player.playlist[player.index].howl;
        var playing = sound.playing();
        if (sound && playing) {
            freeze.innerText = 'thaw';
            Howler.ctx.suspend(0);
            sound.pause();
            tornado = false;
            rotate = false;
        } else if (sound && !playing) {
            freeze.innerText = 'freeze';
            Howler.ctx.resume(0);
            sound.play();
            tornado = true;
            rotate = true;
        }
    });
	debug.addEventListener('mouseover', function() {
		debug.className = 'fadein';
	});
	debug.addEventListener('mouseout', function() {
		debug.className = 'fadeout';
	});
}

var moveVolumeSlider = function (event) {
    if (window.volumeSliderDown) {
        event.stopPropagation();
        var x = event.clientX || event.touches[0].clientX;
        var startX = window.innerWidth * 0.05;
        var layerX = x - startX;
        var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
        player.volume(per);
    }
};

var moveProgressSlider = function (event) {
    if (window.progressSliderDown) {
        event.stopPropagation();
        //console.log(event.layerX);
        var x = event.clientX || event.touches[0].clientX;
        var startX = window.innerWidth * 0.05;
        var layerX = x - startX;
        var per = Math.min(1, Math.max(0, layerX / parseFloat(progressEmpty.scrollWidth)));
        player.seek(per);
        //player.seek(event.layerX / progressEmpty.scrollWidth);
    }
};

volume.addEventListener('mousemove', moveVolumeSlider);
volume.addEventListener('touchmove', moveVolumeSlider);


progress.addEventListener('mousemove', moveProgressSlider);
progress.addEventListener('touchmove', moveProgressSlider);


// Setup the "waveform" animation.
/*
var wave = new SiriWave({
  container: waveform,
  width: window.innerWidth,
  height: window.innerHeight * 0.3,
  cover: true,
  speed: 0.03,
  amplitude: 0.7,
  frequency: 2
});
wave.start();
*/
// Update the height of the wave animation.
// These are basically some hacks to get SiriWave.js to do what we want.
var resize = function () {
    var height = window.innerHeight * 0.3;
    var width = window.innerWidth;
    /*
    wave.height = height;
    wave.height_2 = height / 2;
    wave.MAX = wave.height_2 - 4;
    wave.width = width;
    wave.width_2 = width / 2;
    wave.width_4 = width / 4;
    wave.canvas.height = height;
    wave.canvas.width = width;
    wave.container.style.margin = -(height / 2) + 'px auto';
    */
    // Update the position of the slider.
    var sound = player.playlist[player.index].howl;
    if (sound) {
        var vol = sound.volume();
        var barWidth = (vol * 0.9);
        sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    }
};
window.addEventListener('resize', resize);
resize();


function alternate(colorpair, elem) {
    if (colorpair.indexOf('|') == -1) return;
    var el = document.getElementById(elem);
    colorpair = colorpair.split('|');
    var letters = el.innerHTML.replace(/^\s*|\s*$/g, ''). /*strip leading/trailing spaces*/
    replace(/<[^>]*>/g, ''). /*strip existing html tags */
    replace(/&amp;/g, '&').
    split(''),
        output = '';
    var l = 0;
    for (var w = 0; w < letters.length; w++) {
        if (!letters[w].match(/\s/g)) {
            output += '<span style="color:' + ((l % 2) ? colorpair[0] : colorpair[1]) + ';">' + letters[w] + '</span>';
            l++;
        } else {
            output += letters[w];
        }
    }
    el.innerHTML = output;
}
