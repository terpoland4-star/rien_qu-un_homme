// ============================================
// ALBUM: Les dunes de ma vie - Hamadine
// Lecteur Audio Premium
// Version 2.0 - Produit vendable
// ============================================

// Configuration de l'album
// ⚠️ CHEMINS CORRIGÉS selon vos fichiers GitHub
const ALBUM_CONFIG = {
    name: "Les dunes de ma vie",
    artist: "Hamadine",
    year: "2024",
    cover: "musique/cover.jpg",
    songs: [
        {
            id: 1,
            title: "Debout encore",
            artist: "Hamadine",
            file: "musique/Debout encore – Hamadine.mp3",  // ✅ Nom exact avec tiret et espace
            duration: "0:00",
            durationSeconds: 0,
            description: "Un hymne à la résilience"
        },
        {
            id: 2,
            title: "Le Chemin d'Hamadine",
            artist: "Hamadine",
            file: "musique/Le Chemin d’Hamadine.mp3",  // ✅ Apostrophe courbe
            duration: "0:00",
            durationSeconds: 0,
            description: "Le parcours d'un homme"
        },
        {
            id: 3,
            title: "Rien qu'un homme",
            artist: "Hamadine",
            file: "musique/Rien qu’un homme.mp3",  // ✅ Apostrophe courbe
            duration: "0:00",
            durationSeconds: 0,
            description: "Titre éponyme de l'album"
        }
    ]
};

// État de l'application
let AppState = {
    currentSongIndex: 0,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    currentQueue: [],
    volume: 0.7,
    activeTab: 'lyrics'
};

// Éléments DOM
const DOM = {
    audio: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    playAllBtn: document.getElementById('playAllBtn'),
    shufflePlayBtn: document.getElementById('shufflePlayBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    progressHandle: document.getElementById('progressHandle'),
    currentTime: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeBtn: document.getElementById('volumeBtn'),
    currentSongTitle: document.getElementById('currentSongTitle'),
    currentSongArtist: document.getElementById('currentSongArtist'),
    lyricsContent: document.getElementById('lyricsContent'),
    playlist: document.getElementById('playlist'),
    queueList: document.getElementById('queueList'),
    modal: document.getElementById('fullscreenModal'),
    modalLyrics: document.getElementById('modalLyricsContent'),
    modalSongTitle: document.getElementById('modalSongTitle'),
    modalPrevBtn: document.getElementById('modalPrevBtn'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalNextBtn: document.getElementById('modalNextBtn'),
    closeModal: document.getElementById('closeFullscreenBtn'),
    fullscreenBtn: document.getElementById('fullscreenLyricsBtn'),
    sortPlaylistBtn: document.getElementById('sortPlaylistBtn'),
    exportPlaylistBtn: document.getElementById('exportPlaylistBtn'),
    clearQueueBtn: document.getElementById('clearQueueBtn'),
    saveQueueBtn: document.getElementById('saveQueueBtn')
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function saveToLocalStorage() {
    const saveData = {
        queue: AppState.currentQueue,
        volume: AppState.volume,
        isShuffle: AppState.isShuffle,
        isRepeat: AppState.isRepeat
    };
    localStorage.setItem('hamadine_player', JSON.stringify(saveData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('hamadine_player');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.queue) AppState.currentQueue = data.queue;
            if (data.volume) {
                AppState.volume = data.volume;
                DOM.audio.volume = data.volume;
                DOM.volumeSlider.value = data.volume;
            }
            AppState.isShuffle = data.isShuffle || false;
            AppState.isRepeat = data.isRepeat || false;
            updateShuffleRepeatUI();
            renderQueue();
        } catch(e) { console.warn('Erreur chargement save'); }
    }
}

function updateShuffleRepeatUI() {
    DOM.shuffleBtn.style.opacity = AppState.isShuffle ? '1' : '0.5';
    DOM.shuffleBtn.style.background = AppState.isShuffle ? 'rgba(232, 201, 160, 0.2)' : 'transparent';
    DOM.repeatBtn.style.opacity = AppState.isRepeat ? '1' : '0.5';
    DOM.repeatBtn.style.background = AppState.isRepeat ? 'rgba(232, 201, 160, 0.2)' : 'transparent';
}

// ============================================
// GESTION DES PAROLES (Version "Bientôt disponible")
// ============================================
function displayLyricsComingSoon() {
    const comingSoonHtml = `
        <div class="lyrics-loading" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📜</div>
            <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Paroles bientôt disponibles</h3>
            <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
                Les paroles synchronisées de "${ALBUM_CONFIG.songs[AppState.currentSongIndex]?.title}" 
                seront ajoutées prochainement.
            </p>
            <div style="margin-top: 24px;">
                <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">En préparation...</p>
            </div>
        </div>
    `;
    
    DOM.lyricsContent.innerHTML = comingSoonHtml;
    
    if (DOM.modalLyrics) {
        DOM.modalLyrics.innerHTML = comingSoonHtml;
    }
}

// ============================================
// GESTION DE LA LECTURE
// ============================================
function loadSong(index) {
    const song = ALBUM_CONFIG.songs[index];
    if (!song) return;
    
    DOM.audio.src = song.file;
    DOM.currentSongTitle.textContent = song.title;
    DOM.currentSongArtist.textContent = song.artist;
    DOM.modalSongTitle.textContent = `${song.title} - ${ALBUM_CONFIG.artist}`;
    
    // Gestion de la pochette d'album
    const albumArtImg = document.getElementById('albumArt');
    if (albumArtImg) {
        albumArtImg.src = ALBUM_CONFIG.cover;
        albumArtImg.onerror = function() {
            this.src = 'https://placehold.co/400x400/1a1a2e/e8c9a0?text=Hamadine';
        };
    }
    
    // Afficher "bientôt disponible" pour les paroles
    displayLyricsComingSoon();
    
    // Mise à jour playlist active
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Initialiser la queue si vide
    if (AppState.currentQueue.length === 0) {
        AppState.currentQueue = ALBUM_CONFIG.songs.map(s => s.id);
        renderQueue();
    }
    
    if (AppState.isPlaying) {
        DOM.audio.play().catch(e => console.log('Auto-play bloqué'));
    }
}

function playSong() {
    DOM.audio.play();
    AppState.isPlaying = true;
    DOM.playPauseBtn.textContent = '⏸';
    if (DOM.modalPlayBtn) DOM.modalPlayBtn.textContent = '⏸ Pause';
    animateWaveform(true);
}

function pauseSong() {
    DOM.audio.pause();
    AppState.isPlaying = false;
    DOM.playPauseBtn.textContent = '▶';
    if (DOM.modalPlayBtn) DOM.modalPlayBtn.textContent = '▶ Lecture';
    animateWaveform(false);
}

function togglePlayPause() {
    AppState.isPlaying ? pauseSong() : playSong();
}

function nextSong() {
    let nextIndex;
    if (AppState.isShuffle) {
        do {
            nextIndex = Math.floor(Math.random() * ALBUM_CONFIG.songs.length);
        } while (nextIndex === AppState.currentSongIndex && ALBUM_CONFIG.songs.length > 1);
    } else {
        nextIndex = (AppState.currentSongIndex + 1) % ALBUM_CONFIG.songs.length;
    }
    AppState.currentSongIndex = nextIndex;
    loadSong(AppState.currentSongIndex);
    if (AppState.isPlaying) playSong();
}

function prevSong() {
    if (DOM.audio.currentTime > 3) {
        DOM.audio.currentTime = 0;
    } else {
        AppState.currentSongIndex = (AppState.currentSongIndex - 1 + ALBUM_CONFIG.songs.length) % ALBUM_CONFIG.songs.length;
        loadSong(AppState.currentSongIndex);
        if (AppState.isPlaying) playSong();
    }
}

function updateProgress() {
    const percent = (DOM.audio.currentTime / DOM.audio.duration) * 100;
    DOM.progressBar.style.width = `${percent}%`;
    DOM.currentTime.textContent = formatTime(DOM.audio.currentTime);
}

function setProgress(e) {
    const rect = DOM.progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    DOM.audio.currentTime = percent * DOM.audio.duration;
}

// ============================================
// ANIMATION WAVEFORM
// ============================================
function animateWaveform(active) {
    const bars = document.querySelectorAll('.wave-bar');
    if (active) {
        bars.forEach((bar, i) => {
            bar.style.animation = `wave 1s ease-in-out infinite`;
            bar.style.animationDelay = `${i * 0.1}s`;
        });
    } else {
        bars.forEach(bar => {
            bar.style.animation = 'none';
            bar.style.height = '20px';
        });
    }
}

// ============================================
// PLAYLIST
// ============================================
function renderPlaylist() {
    DOM.playlist.innerHTML = '';
    ALBUM_CONFIG.songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = `playlist-item ${index === AppState.currentSongIndex ? 'active' : ''}`;
        li.innerHTML = `
            <div class="playlist-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="playlist-info">
                <div class="playlist-title">${escapeHtml(song.title)}</div>
                <div class="playlist-artist">${escapeHtml(song.artist)}</div>
                <div class="playlist-description">${escapeHtml(song.description)}</div>
            </div>
            <div class="playlist-duration">${song.duration}</div>
            <div class="playlist-play">▶</div>
        `;
        li.addEventListener('click', () => {
            AppState.currentSongIndex = index;
            loadSong(AppState.currentSongIndex);
            playSong();
        });
        DOM.playlist.appendChild(li);
    });
}

// Échapper les caractères HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// QUEUE (File d'attente)
// ============================================
function renderQueue() {
    if (!DOM.queueList) return;
    
    if (AppState.currentQueue.length === 0) {
        DOM.queueList.innerHTML = '<li class="queue-empty">Aucune chanson en file</li>';
        return;
    }
    
    DOM.queueList.innerHTML = '';
    AppState.currentQueue.forEach((songId, idx) => {
        const song = ALBUM_CONFIG.songs.find(s => s.id === songId);
        if (!song) return;
        const li = document.createElement('li');
        li.className = 'queue-item';
        li.innerHTML = `
            <span class="queue-number">${idx + 1}</span>
            <div class="queue-info">
                <div class="queue-title">${escapeHtml(song.title)}</div>
                <div class="queue-artist">${escapeHtml(song.artist)}</div>
            </div>
            <button class="queue-item-remove" data-id="${songId}">✕</button>
        `;
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('queue-item-remove')) return;
            const newIndex = ALBUM_CONFIG.songs.findIndex(s => s.id === songId);
            if (newIndex !== -1) {
                AppState.currentSongIndex = newIndex;
                loadSong(AppState.currentSongIndex);
                playSong();
            }
        });
        const removeBtn = li.querySelector('.queue-item-remove');
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            AppState.currentQueue = AppState.currentQueue.filter(id => id !== songId);
            renderQueue();
            saveToLocalStorage();
        });
        DOM.queueList.appendChild(li);
    });
}

// ============================================
// MISE À JOUR DES DURÉES (IMPORTANT)
// ============================================
function updateDurations() {
    ALBUM_CONFIG.songs.forEach((song, index) => {
        const tempAudio = new Audio(song.file);
        tempAudio.addEventListener('loadedmetadata', () => {
            song.durationSeconds = tempAudio.duration;
            song.duration = formatTime(tempAudio.duration);
            const playlistItem = DOM.playlist?.children[index];
            if (playlistItem) {
                const durationSpan = playlistItem.querySelector('.playlist-duration');
                if (durationSpan) durationSpan.textContent = song.duration;
            }
            console.log(`✅ Durée chargée: ${song.title} - ${song.duration}`);
        });
        tempAudio.addEventListener('error', (e) => {
            console.warn(`⚠️ Fichier non trouvé: ${song.file}`);
            song.duration = "00:00";
        });
    });
}

// ============================================
// VÉRIFICATION DES FICHIERS
// ============================================
function verifyAudioFiles() {
    console.log("🔍 Vérification des fichiers audio...");
    ALBUM_CONFIG.songs.forEach(song => {
        fetch(song.file, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    console.log(`✅ ${song.title} - OK`);
                } else {
                    console.warn(`❌ ${song.title} - NON TROUVÉ (${song.file})`);
                }
            })
            .catch(() => console.warn(`❌ ${song.title} - ERREUR CHARGEMENT`));
    });
}

// ============================================
// EXPORT PLAYLIST
// ============================================
function exportPlaylist() {
    const playlistData = ALBUM_CONFIG.songs.map((song, i) => ({
        position: i + 1,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        description: song.description
    }));
    const blob = new Blob([JSON.stringify(playlistData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hamadine_playlist.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// TABS NAVIGATION
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Tab`).classList.add('active');
            AppState.activeTab = tabId;
        });
    });
}

// ============================================
// INITIALISATION
// ============================================
function initEventListeners() {
    DOM.playPauseBtn.addEventListener('click', togglePlayPause);
    DOM.prevBtn.addEventListener('click', prevSong);
    DOM.nextBtn.addEventListener('click', nextSong);
    DOM.progressContainer.addEventListener('click', setProgress);
    DOM.volumeSlider.addEventListener('input', (e) => {
        AppState.volume = parseFloat(e.target.value);
        DOM.audio.volume = AppState.volume;
        saveToLocalStorage();
    });
    DOM.volumeBtn?.addEventListener('click', () => {
        if (DOM.audio.volume > 0) {
            DOM.audio.volume = 0;
            DOM.volumeSlider.value = 0;
        } else {
            DOM.audio.volume = AppState.volume || 0.7;
            DOM.volumeSlider.value = AppState.volume || 0.7;
        }
    });
    DOM.shuffleBtn.addEventListener('click', () => {
        AppState.isShuffle = !AppState.isShuffle;
        updateShuffleRepeatUI();
        saveToLocalStorage();
    });
    DOM.repeatBtn.addEventListener('click', () => {
        AppState.isRepeat = !AppState.isRepeat;
        updateShuffleRepeatUI();
        saveToLocalStorage();
    });
    DOM.playAllBtn?.addEventListener('click', () => {
        AppState.currentSongIndex = 0;
        loadSong(0);
        playSong();
    });
    DOM.shufflePlayBtn?.addEventListener('click', () => {
        AppState.isShuffle = true;
        updateShuffleRepeatUI();
        nextSong();
        playSong();
    });
    DOM.fullscreenBtn?.addEventListener('click', () => {
        DOM.modal.style.display = 'block';
    });
    DOM.closeModal?.addEventListener('click', () => {
        DOM.modal.style.display = 'none';
    });
    DOM.modalPrevBtn?.addEventListener('click', prevSong);
    DOM.modalPlayBtn?.addEventListener('click', togglePlayPause);
    DOM.modalNextBtn?.addEventListener('click', nextSong);
    DOM.sortPlaylistBtn?.addEventListener('click', () => {
        ALBUM_CONFIG.songs.sort((a, b) => a.title.localeCompare(b.title));
        renderPlaylist();
    });
    DOM.exportPlaylistBtn?.addEventListener('click', exportPlaylist);
    DOM.clearQueueBtn?.addEventListener('click', () => {
        AppState.currentQueue = [];
        renderQueue();
        saveToLocalStorage();
    });
    DOM.saveQueueBtn?.addEventListener('click', saveToLocalStorage);
    
    // Événements audio
    DOM.audio.addEventListener('timeupdate', updateProgress);
    DOM.audio.addEventListener('loadedmetadata', () => {
        DOM.duration.textContent = formatTime(DOM.audio.duration);
    });
    DOM.audio.addEventListener('ended', () => {
        if (AppState.isRepeat) {
            DOM.audio.currentTime = 0;
            playSong();
        } else {
            nextSong();
        }
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlayPause();
        }
        if (e.code === 'ArrowLeft') prevSong();
        if (e.code === 'ArrowRight') nextSong();
        if (e.code === 'Escape' && DOM.modal.style.display === 'block') {
            DOM.modal.style.display = 'none';
        }
    });
    
    // Fermer modal au clic externe
    DOM.modal?.addEventListener('click', (e) => {
        if (e.target === DOM.modal) DOM.modal.style.display = 'none';
    });
}

async function init() {
    renderPlaylist();
    renderQueue();
    loadSong(0);
    updateDurations();  // ✅ Ici que les durées sont calculées
    initEventListeners();
    initTabs();
    loadFromLocalStorage();
    DOM.audio.volume = AppState.volume;
    DOM.volumeSlider.value = AppState.volume;
    updateShuffleRepeatUI();
    
    // Vérification des fichiers (utile pour debug)
    setTimeout(() => {
        verifyAudioFiles();
        if (DOM.audio.error) {
            console.warn("⚠️ Vérifiez que les fichiers MP3 sont dans le dossier 'musique/'");
        }
    }, 1000);
    
    console.log("🎵 Lecteur Hamadine - Les dunes de ma vie - Prêt !");
}

// Démarrer l'application
init();
