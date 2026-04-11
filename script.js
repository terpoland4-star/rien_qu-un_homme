// Configuration de l'album "Rien qu'un homme" - Hamadine
const albumConfig = {
    name: "Rien qu'un homme",
    artist: "Hamadine",
    cover: "cover.jpg",
    year: "2024",
    songs: [
        { 
            id: 1, 
            title: "Debout encore", 
            artist: "Hamadine", 
            file: "Debout encore - Hamadine.mp3", 
            duration: "0:00",
            description: "Un hymne à la résilience"
        },
        { 
            id: 2, 
            title: "Le Chemin d'Hamadine", 
            artist: "Hamadine", 
            file: "Le Chemin d'Hamadine.mp3", 
            duration: "0:00",
            description: "Le parcours d'un homme"
        },
        { 
            id: 3, 
            title: "Rien qu'un homme", 
            artist: "Hamadine", 
            file: "Rien qu'un homme.mp3", 
            duration: "0:00",
            description: "Titre éponyme de l'album"
        }
    ]
};

// Variables globales
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentLyrics = [];
let animationFrameId = null;

// Éléments DOM
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentSongTitle = document.getElementById('currentSongTitle');
const currentSongArtist = document.getElementById('currentSongArtist');
const volumeSlider = document.getElementById('volumeSlider');
const playlistEl = document.getElementById('playlist');
const lyricsContent = document.getElementById('lyricsContent');
const modal = document.getElementById('fullscreenModal');
const modalLyrics = document.getElementById('lyricsContentFull');
const modalSongTitle = document.getElementById('modalSongTitle');
const closeModal = document.getElementById('closeModal');
const toggleLyricsMode = document.getElementById('toggleLyricsMode');
const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalPlayPauseBtn = document.getElementById('modalPlayPauseBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
const albumArt = document.getElementById('albumArt');
const songCountSpan = document.getElementById('songCount');
const playlistCountSpan = document.getElementById('playlistCount');

// Mettre à jour le compteur de chansons
songCountSpan.textContent = `${albumConfig.songs.length} titres`;
playlistCountSpan.textContent = `${albumConfig.songs.length} titres`;

// Utilitaires
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Chargement des paroles
function loadLyrics(songId) {
    if (window.albumLyrics && window.albumLyrics[songId]) {
        currentLyrics = window.albumLyrics[songId];
        displayLyrics(currentLyrics, audio.currentTime);
    } else {
        currentLyrics = [];
        lyricsContent.innerHTML = '<p class="lyrics-placeholder">✨ Paroles en cours d\'écriture... ✨<br><small>Bientôt disponibles</small></p>';
        if (modalLyrics) {
            modalLyrics.innerHTML = '<p class="lyrics-placeholder">✨ Paroles à venir ✨</p>';
        }
    }
}

// Affichage des paroles synchronisées
function displayLyrics(lyrics, currentTime) {
    if (!lyrics || lyrics.length === 0) {
        if (lyricsContent.innerHTML.includes('Paroles en cours')) return;
        lyricsContent.innerHTML = '<p class="lyrics-placeholder">✨ Paroles en cours d\'écriture... ✨<br><small>Bientôt disponibles</small></p>';
        if (modalLyrics && !modalLyrics.innerHTML.includes('Paroles à venir')) {
            modalLyrics.innerHTML = '<p class="lyrics-placeholder">✨ Paroles à venir ✨</p>';
        }
        return;
    }

    let activeIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }

    // Mise à jour des paroles dans l'interface principale
    let lyricsHtml = '';
    lyrics.forEach((line, index) => {
        const activeClass = (index === activeIndex) ? 'active' : '';
        lyricsHtml += `<div class="lyrics-line ${activeClass}" data-time="${line.time}">${line.text}</div>`;
    });
    lyricsContent.innerHTML = lyricsHtml;

    // Mise à jour des paroles dans le modal
    if (modalLyrics) {
        let modalHtml = '';
        lyrics.forEach((line, index) => {
            const activeClass = (index === activeIndex) ? 'active' : '';
            modalHtml += `<div class="lyrics-line-full ${activeClass}" data-time="${line.time}">${line.text}</div>`;
        });
        modalLyrics.innerHTML = modalHtml;
    }

    // Scroll automatique vers la ligne active
    if (activeIndex !== -1) {
        const activeLine = document.querySelector('.lyrics-line.active');
        if (activeLine) {
            activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const activeLineModal = document.querySelector('.lyrics-line-full.active');
        if (activeLineModal && modal.style.display === 'block') {
            activeLineModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Animation de mise à jour des paroles
function startLyricsSync() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    function update() {
        if (audio && !audio.paused) {
            displayLyrics(currentLyrics, audio.currentTime);
        }
        animationFrameId = requestAnimationFrame(update);
    }
    update();
}

// Chargement d'une chanson
function loadSong(index) {
    const song = albumConfig.songs[index];
    if (!song) return;
    
    audio.src = song.file;
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    modalSongTitle.textContent = `${song.title} - Hamadine | Rien qu'un homme`;
    
    // Gestion de la pochette d'album
    albumArt.src = albumConfig.cover;
    albumArt.onerror = function() {
        this.src = 'https://via.placeholder.com/300x300/1a1a2e/a8c0ff?text=Rien+qu\'un+homme';
    };
    
    // Charger les paroles
    loadLyrics(song.id);
    
    // Mettre à jour la playlist active
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Mettre à jour le titre dans le modal
    if (modal.style.display === 'block') {
        modalSongTitle.textContent = `${song.title} - Hamadine`;
    }
    
    if (isPlaying) {
        audio.play();
    }
    
    // Démarrer la synchronisation des paroles
    startLyricsSync();
}

// Contrôles de lecture
function playSong() {
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
    modalPlayPauseBtn.textContent = '⏸ Pause';
    document.querySelector('.album-art-wrapper')?.classList.add('playing');
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = '▶';
    modalPlayPauseBtn.textContent = '▶ Lecture';
    document.querySelector('.album-art-wrapper')?.classList.remove('playing');
}

function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function nextSong() {
    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * albumConfig.songs.length);
        } while (newIndex === currentSongIndex && albumConfig.songs.length > 1);
        currentSongIndex = newIndex;
    } else {
        currentSongIndex = (currentSongIndex + 1) % albumConfig.songs.length;
    }
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function prevSong() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        currentSongIndex = (currentSongIndex - 1 + albumConfig.songs.length) % albumConfig.songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }
}

function updateProgress() {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Création de la playlist
function createPlaylist() {
    playlistEl.innerHTML = '';
    albumConfig.songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.innerHTML = `
            <div class="playlist-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="playlist-info">
                <div class="playlist-title">${song.title}</div>
                <div class="playlist-artist">${song.artist}</div>
                <div class="playlist-description">${song.description || ''}</div>
            </div>
            <div class="playlist-duration">${song.duration}</div>
            <div class="playlist-play">▶</div>
        `;
        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
        playlistEl.appendChild(li);
    });
}

// Mise à jour des durées
async function updateDurations() {
    for (let i = 0; i < albumConfig.songs.length; i++) {
        const song = albumConfig.songs[i];
        const tempAudio = new Audio(song.file);
        tempAudio.addEventListener('loadedmetadata', () => {
            song.duration = formatTime(tempAudio.duration);
            const playlistItem = playlistEl.children[i];
            if (playlistItem) {
                const durationSpan = playlistItem.querySelector('.playlist-duration');
                if (durationSpan) durationSpan.textContent = song.duration;
            }
        });
        tempAudio.addEventListener('error', () => {
            song.duration = "00:00";
            const playlistItem = playlistEl.children[i];
            if (playlistItem) {
                const durationSpan = playlistItem.querySelector('.playlist-duration');
                if (durationSpan) durationSpan.textContent = "??:??";
            }
        });
    }
}

// Événements audio
audio.addEventListener('timeupdate', () => {
    updateProgress();
    displayLyrics(currentLyrics, audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playSong();
    } else {
        nextSong();
    }
});

// Gestion des erreurs audio
audio.addEventListener('error', (e) => {
    console.error('Erreur audio:', e);
    const song = albumConfig.songs[currentSongIndex];
    lyricsContent.innerHTML = `<p class="lyrics-placeholder">⚠️ Impossible de charger "${song.title}"<br>Vérifiez que le fichier existe bien</p>`;
});

// Contrôle du volume
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Boutons de contrôle
playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
progressContainer.addEventListener('click', setProgress);

// Mode aléatoire
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.opacity = isShuffle ? '1' : '0.5';
    shuffleBtn.style.transform = isShuffle ? 'scale(1.1)' : 'scale(1)';
});

// Mode répétition
repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.style.opacity = isRepeat ? '1' : '0.5';
    repeatBtn.style.transform = isRepeat ? 'scale(1.1)' : 'scale(1)';
});

// Mode plein écran des paroles
toggleLyricsMode.addEventListener('click', () => {
    modal.style.display = 'block';
    if (currentLyrics.length > 0) {
        displayLyrics(currentLyrics, audio.currentTime);
    }
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Contrôles du modal
modalPrevBtn.addEventListener('click', () => {
    prevSong();
    if (currentLyrics.length > 0) {
        displayLyrics(currentLyrics, audio.currentTime);
    }
});

modalPlayPauseBtn.addEventListener('click', () => {
    togglePlayPause();
});

modalNextBtn.addEventListener('click', () => {
    nextSong();
    if (currentLyrics.length > 0) {
        displayLyrics(currentLyrics, audio.currentTime);
    }
});

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            prevSong();
            break;
        case 'ArrowRight':
            nextSong();
            break;
        case 'Escape':
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            break;
    }
});

// Click en dehors du modal pour fermer
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Initialisation
function init() {
    createPlaylist();
    loadSong(0);
    updateDurations();
    audio.volume = 0.7;
    volumeSlider.value = 0.7;
    
    // Afficher un message si les fichiers MP3 ne sont pas trouvés
    setTimeout(() => {
        if (audio.error) {
            console.warn("Assurez-vous que les fichiers MP3 sont dans le même dossier que index.html");
        }
    }, 1000);
}

init();
