param(
  [Parameter(Mandatory = $true)]
  [int]$Port
)

$ErrorActionPreference = 'Stop'

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if (-not $listeners) {
  Write-Output "Port $Port is already free"
  exit 0
}

Write-Output ('Cleaning up processes on :' + $Port + ' => ' + ($listeners -join ','))
foreach ($processId in $listeners) {
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

exit 0