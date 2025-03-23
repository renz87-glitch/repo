# Abilita l'uscita immediata in caso di errore
$ErrorActionPreference = "Stop"

Write-Host "Controllo cherry-pick per messaggio di commit..."

if (-not $args[0]) {
    Write-Host "Errore: Nessun file di commit specificato."
    exit 1
}

$CommitMsgFile = $args[0]

try {
    $commitMsg = Get-Content $CommitMsgFile -Raw
} catch {
    Write-Host "Errore nella lettura del file di commit: $_"
    exit 1
}

# Pattern per rilevare ticketid e cherry-pick
$patternTicketId = "ticketid: \d+$"
$patternCherryPick = "cherrypicked [a-f0-9]{40}"

# Verifica se si è in stato di detached HEAD (probabile cherry-pick)
$gitHeadOutput = git rev-parse --abbrev-ref HEAD 2>&1

if ($gitHeadOutput -eq "HEAD") {
    try {
        $cherryPickSha = git rev-parse HEAD 2>&1
        $branchSource = git name-rev --name-only $cherryPickSha 2>&1

        if ($branchSource -like "*master*" -or $branchSource -like "*main*") {
			$logCherryPick = "Rilevato cherry-pick da $branchSource. SHA1: $cherryPickSha"
            Write-Host $logCherryPick

            if ($commitMsg -notmatch $patternCherryPick) {
                $cherryPickInfo = "cherrypicked $cherryPickSha"

                if ($commitMsg -match $patternTicketId) {
                    $commitMsg = $commitMsg -replace "($patternTicketId)", "$cherryPickInfo`r`n$1"
                } else {
                    $commitMsg += "`r`n$cherryPickInfo`r`n" + "ticketid: 123"
                }

                # Aggiungi tipo Windows Forms
                Add-Type -AssemblyName PresentationCore, PresentationFramework

                # Crea la finestra di dialogo
                $window = New-Object System.Windows.Window
                $window.Title = "Modifica del Messaggio di Commit"
                $window.Width = 600
                $window.Height = 400
                $window.ResizeMode = "CanResize"

                # Crea un TextBox per l'input
                $textBox = New-Object System.Windows.Controls.TextBox
                $textBox.Text = $commitMsg
                $textBox.AcceptsReturn = $true
                $textBox.VerticalScrollBarVisibility = "Auto"
                $textBox.HorizontalScrollBarVisibility = "Auto"
                $window.Content = $textBox

                # Mostra la finestra di dialogo e attende l'interazione dell'utente
                $null = $window.ShowDialog()

                # Ottieni il testo modificato dall'utente
                $commitMsg = $textBox.Text

                # Salva il messaggio modificato nel file
                try {
                    Set-Content -Path $CommitMsgFile -Value $commitMsg
                    Write-Host "Messaggio di commit modificato e salvato correttamente."
                } catch {
                    Write-Host "Errore nella scrittura del file di commit: $_"
                    exit 1
                }
            }
        } else {
            Write-Host "OK: Non è stato rilevato un cherry-pick da master."
        }
    } catch {
        Write-Host "Errore durante l'identificazione del cherry-pick: $_"
        exit 1
    }
} else {
    Write-Host "OK: Commit normale, nessuna modifica necessaria."
}

exit 0
