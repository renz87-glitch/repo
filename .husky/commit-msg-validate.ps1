# Abilita l'uscita immediata in caso di errore
$ErrorActionPreference = "Stop"

Write-Host "Verifica del messaggio di commit con PowerShell..."

# Ottieni il file del messaggio di commit come argomento
$CommitMsgFile = $args[0]

if (-not $CommitMsgFile) {
    Write-Host "Errore: Nessun file di commit specificato."
    exit 1
}

# Leggi il contenuto del file di commit
try {
    $commitMsg = Get-Content $CommitMsgFile -Raw
} catch {
    Write-Host "Errore nella lettura del file di commit: $_"
    exit 1
}

# Pattern per il messaggio standard
$patternStandard = "^(BUGFIX|FEATURE|MIGLIORIA) - [A-Z0-9]+ - .+`r?`n.+`r?`nticketid: \d+$"
# Pattern per il messaggio con Cherry-Pick
$patternCherryPick = "^(BUGFIX|FEATURE|MIGLIORIA) - [A-Z0-9]+ - .+`r?`n.+`r?`ncherrypicked [a-f0-9]{40}`r?`nticketid: \d+$"

# Verifica il messaggio contro i pattern
if ($commitMsg -match $patternStandard -or $commitMsg -match $patternCherryPick) {
    Write-Host "OK: Messaggio di commit valido!"
    exit 0
} else {
    Write-Host @'
ERR: Il messaggio di commit non rispetta il formato richiesto.

Formato richiesto:
(BUGFIX|FEATURE|MIGLIORIA) - (CLIENTE) - Argomento
Dettaglio intervento


Esempio:
1. Standard:
BUGFIX - CLIENTE - Argomento
Modifica contollo xxxx
ticketid: 12345

2. Con Cherry-Pick da master:
BUGFIX - CLIENTE - Argomento
Modifica controllo xxxxx
cherrypicked from master ad768a7876d7756765a
ticketid: 123456

'@
    exit 1
}
