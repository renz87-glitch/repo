# Abilita l'uscita immediata in caso di errore
$ErrorActionPreference = "Stop"

Write-Host "Controllo cherry-pick per messaggio di commit..."

try {
    # Verifica se c'è un cherry-pick in corso
    if (Test-Path .git/CHERRY_PICK_HEAD) {
        $originalCommitSha = (Get-Content .git/CHERRY_PICK_HEAD).Trim()
        Write-Host "SHA1 del commit originale da CHERRY_PICK_HEAD: $originalCommitSha"

        # Variabili per verificare l'esistenza dei branch
        $hasOriginMain = git branch -r | Select-String "origin/main"
        $hasLocalMain = git branch | Select-String "main"
        $hasOriginMaster = git branch -r | Select-String "origin/master"
        $hasLocalMaster = git branch | Select-String "master"

        # Verifica se il commit originale proviene da main o master (remoti e locali)
        $isFromMain = $null
        $isFromLocalMain = $null
        $isFromMaster = $null
        $isFromLocalMaster = $null

        if ($hasOriginMain) {
            $isFromMain = git log origin/main --pretty=format:"%H" | Select-String -Pattern $originalCommitSha
        }
        if ($hasLocalMain) {
            $isFromLocalMain = git log main --pretty=format:"%H" | Select-String -Pattern $originalCommitSha
        }
        if ($hasOriginMaster) {
            $isFromMaster = git log origin/master --pretty=format:"%H" | Select-String -Pattern $originalCommitSha
        }
        if ($hasLocalMaster) {
            $isFromLocalMaster = git log master --pretty=format:"%H" | Select-String -Pattern $originalCommitSha
        }

        if ($isFromMain -or $isFromLocalMain -or $isFromMaster -or $isFromLocalMaster) {
            Write-Host "Rilevato cherry-pick da main o master. SHA1: $originalCommitSha"

            # Recupera il messaggio di commit originale
            $commitMsgFile = $args[0]
            $originalCommitMsg = Get-Content $commitMsgFile -Raw

            # Cerca la posizione del ticketid
            $ticketPattern = "(?ms)^(.*?)(\bticketid: \d+)$"
			#$firstPattern = "(?m)^(.*?)(ticketid: \d+)$"
            $modifiedCommitMsg = $originalCommitMsg
			
		    #if($originalCommitMsg -match $firstPattern) {
				#$if1Match0 = $Matches[0]
				#$if1Match1 = $Matches[1]
				#$if1Match2 = $Matches[2]
				#Write-Host "if 1:"
				#Write-Host "Matches[0] $if1Match0"
				#Write-Host "Matches[1] $if1Match1"
				#Write-Host "Matches[2] $if1Match2"
			    #$ticketidLine = $Matches[2]
		    #}

            if ($originalCommitMsg -match $ticketPattern) {
			#	$if2Match0 = $Matches[0]
			#	$if2Match1 = $Matches[1]
			#	$if2Match2 = $Matches[2]
			#	Write-Host "if 2:"
			#	Write-Host "Matches[0] $if2Match0"
			#	Write-Host "Matches[1] $if2Match1"
			#	Write-Host "Matches[2] $if2Match2"
				$preTicketPart = $Matches[1]
				$ticketidLine = $Matches[2]
			}
			
			if(-not [string]::IsNullOrWhiteSpace($preTicketPart) -and -not [string]::IsNullOrWhiteSpace($ticketidLine)){
			    # Ricostruisci il messaggio senza perdere il ticketid
                $modifiedCommitMsg = $preTicketPart + "`r`ncherrypicked $originalCommitSha`r`n" + $ticketidLine
				Write-Host "ticketid presente"
			} else {
                # Se non trova un ticketid, aggiunge il messaggio alla fine
                $modifiedCommitMsg = $originalCommitMsg + "`r`ncherrypicked $originalCommitSha"
            }

            # Scrive il messaggio modificato nel file temporaneo
            Set-Content -Path $commitMsgFile -Value $modifiedCommitMsg
            Write-Host "Messaggio di commit modificato e salvato con successo."
        } else {
            Write-Host "Il commit non proviene da main o master. Nessuna modifica effettuata."
        }
    } else {
        Write-Host "Nessuna operazione di cherry-pick rilevata."
    }
} catch {
    Write-Host "Errore durante l'elaborazione del commit: $_"
    exit 1
}

exit 0
