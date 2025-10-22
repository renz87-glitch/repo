Param(
  [int[]]$Ports = @(3000, 5051, 5071),
  [string]$Profile = "Private"
)

foreach ($p in $Ports) {
  $name = "Dev inbound TCP port $p"
  if (-not (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Protocol TCP -LocalPort $p -Action Allow -Profile $Profile | Out-Null
    Write-Host "Aperta porta $p ($Profile)"
  } else {
    Write-Host "Regola già presente per la porta $p"
  }
}

