// Configuration de l'album
const albumConfig = {
    name: "Rien qu'un homme",
    artist: "Votre Artiste", // À remplacer par votre nom
    cover: "cover.jpg",
    songs: [
        { id: 1, title: "Titre 1", artist: "Votre Artiste", file: "musiques/titre1.mp3", duration: "0:00" },
        { id: 2, title: "Titre 2", artist: "Votre Artiste", file: "musiques/titre2.mp3", duration: "0:00" },
        { id: 3, title: "Titre 3", artist: "Votre Artiste", file: "musiques/titre3.mp3", duration: "0:00" },
        { id: 4, title: "Titre 4", artist: "Votre Artiste", file: "musiques/titre4.mp3", duration: "0:00" },
        { id: 5, title: "Titre 5", artist: "Votre Artiste", file: "musiques/titre5.mp3", duration: "0:00" },
        { id: 6, title: "Titre 6", artist: "Votre Artiste", file: "musiques/titre6.mp3", duration: "0:00" },
        { id: 7, title: "Titre 7", artist: "Votre Artiste", file: "musiques/titre7.mp3", duration: "0:00" },
        { id: 8, title: "Titre 8", artist: "Votre Artiste", file: "musiques/titre8.mp3", duration: "0:00" },
        { id: 9, title: "Titre 9", artist: "Votre Artiste", file: "musiques/titre9.mp3", duration: "0:00" },
        { id: 10, title: "Titre 10", artist: "Votre Artiste", file: "musiques/titre10.mp3", duration: "0:00" },
        { id: 11, title: "Titre 11", artist: "Votre Artiste", file: "musiques/titre11.mp3", duration: "0:00" },
        { id: 12, title: "Titre 12", artist: "Votre Artiste", file: "musiques/titre12.mp3", duration: "0:00" },
        { id: 13, title: "Titre 13", artist: "Votre Artiste", file: "musiques/titre13.mp3", duration: "0:00" },
        { id: 14, title: "Titre 14", artist: "Votre Artiste", file: "musiques/titre14.mp3", duration: "0:00" }
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
        lyricsContent.innerHTML = '<p class="lyrics-placeholder">Paroles non disponibles pour ce titre</p>';
        if (modalLyrics) {
            modalLyrics.innerHTML = '<p class="lyrics-placeholder">Paroles non disponibles</p>';
        }
    }
}

// Affichage des paroles synchronisées
function displayLyrics(lyrics, currentTime) {
    if (!lyrics || lyrics.length === 0) {
        if (lyricsContent.innerHTML.includes('Paroles non disponibles')) return;
        lyricsContent.innerHTML = '<p class="lyrics-placeholder">Paroles non disponibles pour ce titre</p>';
        if (modalLyrics && !modalLyrics.innerHTML.includes('Paroles non disponibles')) {
            modalLyrics.innerHTML = '<p class="lyrics-placeholder">Paroles non disponibles</p>';
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
            modalHtml += `<div class="lyrics-line-full ${activeClass}" data-time="${line.time}">${line.text}</div>';
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
    modalSongTitle.textContent = `${song.title} - ${albumConfig.name}`;
    albumArt.src = albumConfig.cover;
    
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
            </div>
            <div class="playlist-duration">${song.duration}</div>
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

// Fermeture du modal avec Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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
}

init();
