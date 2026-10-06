$ErrorActionPreference = "Stop"

$dataDir = Join-Path (Split-Path -Parent $PSScriptRoot) ".local-postgres-test"
$postgres = "C:\Program Files\PostgreSQL\17\bin\postgres.exe"
$pgIsReady = "C:\Program Files\PostgreSQL\17\bin\pg_isready.exe"

if (-not (Test-Path -LiteralPath (Join-Path $dataDir "PG_VERSION"))) {
  throw "Local PostgreSQL data directory is missing: $dataDir"
}

& $pgIsReady -h 127.0.0.1 -p 55434 *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Output "Local PostgreSQL is already running on port 55434."
  exit 0
}

$arguments = @("-D", ('"{0}"' -f $dataDir), "-h", "127.0.0.1", "-p", "55434")
Start-Process -FilePath $postgres -ArgumentList $arguments -WindowStyle Hidden -RedirectStandardOutput (Join-Path $dataDir "server.log") -RedirectStandardError (Join-Path $dataDir "server-error.log") | Out-Null

for ($attempt = 0; $attempt -lt 20; $attempt++) {
  Start-Sleep -Seconds 1
  & $pgIsReady -h 127.0.0.1 -p 55434 *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Output "Local PostgreSQL is ready on port 55434."
    exit 0
  }
}

throw "Local PostgreSQL did not start. Check .local-postgres-test/server-error.log."
