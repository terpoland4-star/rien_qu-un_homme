<?php
// 🔍 TRACKER HAMADINE V2 - SERVEUR CENTRAL
header('Content-Type: image/gif');
header('Content-Length: 43');
header('Cache-Control: no-cache, no-store');

$logDir = __DIR__ . '/data/logs_hamadine/';
$logFile = $logDir . 'track_' . date('Y-m-d_H') . '.jsonl';

if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Double decode
if (isset($_GET['d'])) {
    try {
        $data2 = base64_decode($_GET['d']);
        $data1 = base64_decode($data2);
        $fp = json_decode($data1, true);
        
        if ($fp) {
            $log = [
                'timestamp' => date('c'),
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250),
                'session_id' => $_GET['sid'] ?? '',
                'pays' => $_SERVER['HTTP_CF_IPCOUNTRY'] ?? 'XX',
                'chanson' => $fp['chanson_actuelle'] ?? '',
                'lectures' => $fp['nb_lectures'] ?? 0,
                'temps' => $fp['temps_total'] ?? 0,
                'media_access' => $fp['media_access'] ?? 'none',
                'resolution' => $fp['resolution'] ?? '',
                'fingerprint' => array_slice($fp, 0, 20) // Limite taille
            ];
            
            file_put_contents($logFile, json_encode($log, JSON_UNESCAPED_UNICODE) . "\n", 
                            FILE_APPEND | LOCK_EX);
        }
    } catch(Exception $e) {
        // Silent fail
    }
}

// GIF 1x1 invisible
echo base64_decode('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=');
?>
