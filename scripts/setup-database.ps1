# =============================================================================
# Automated Native PostgreSQL Setup & Schema Provisioning for Windows
# HRMS (Human Resource Management System)
# =============================================================================

[CmdletBinding()]
param(
    [string]$DbName = "hrms",
    [string]$DbUser = "hrms",
    [string]$DbPassword = "local-only-change-me",
    [string]$SuperUser = "postgres",
    [string]$SuperPassword = "postgres",
    [int]$DbPort = 5432,
    [switch]$SkipMigration = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[HRMS-DB-SETUP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-WarnMsg {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "  HRMS Native Windows PostgreSQL Auto-Installer & Schema Setup  " -ForegroundColor Magenta
Write-Host "=================================================================" -ForegroundColor Magenta

# -----------------------------------------------------------------------------
# STEP 1: DETECT NATIVE POSTGRESQL INSTALLATION
# -----------------------------------------------------------------------------
Write-Step "Checking for native PostgreSQL installation..."

$psqlPath = $null
$psqlCmd = Get-Command "psql.exe" -ErrorAction SilentlyContinue

if ($psqlCmd) {
    $psqlPath = $psqlCmd.Source
    Write-Success "Found psql in PATH: $psqlPath"
} else {
    # Check standard 64-bit and 32-bit Program Files paths
    $candidateDirs = @(
        "${env:ProgramFiles}\PostgreSQL",
        "${env:ProgramFiles(x86)}\PostgreSQL",
        "${env:LOCALAPPDATA}\Programs\PostgreSQL"
    )

    foreach ($dir in $candidateDirs) {
        if (Test-Path $dir) {
            $bins = Get-ChildItem -Path $dir -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue |
                    Sort-Object { [version]($_.Directory.Parent.Name -replace '[^\d\.]', '') } -Descending
            if ($bins.Count -gt 0) {
                $psqlPath = $bins[0].FullName
                $binDir = $bins[0].DirectoryName
                $env:PATH = "$binDir;$env:PATH"
                [Environment]::SetEnvironmentVariable("PATH", "$binDir;" + [Environment]::GetEnvironmentVariable("PATH", "User"), "User")
                Write-Success "Located native PostgreSQL at: $psqlPath (added to PATH)"
                break
            }
        }
    }
}

# -----------------------------------------------------------------------------
# STEP 2: INSTALL NATIVE POSTGRESQL IF NOT FOUND
# -----------------------------------------------------------------------------
if (-not $psqlPath) {
    Write-WarnMsg "Native PostgreSQL was not detected on this system."
    Write-Step "Attempting automated installation of PostgreSQL 16..."

    $wingetCmd = Get-Command "winget.exe" -ErrorAction SilentlyContinue

    if ($wingetCmd) {
        Write-Host "Invoking Windows Package Manager (winget) silent install..." -ForegroundColor Gray
        try {
            $installProcess = Start-Process -FilePath "winget" -ArgumentList "install --id PostgreSQL.PostgreSQL.16 --silent --accept-package-agreements --accept-source-agreements --exact" -Wait -PassThru -NoNewWindow
            if ($installProcess.ExitCode -eq 0) {
                Write-Success "PostgreSQL 16 installed successfully via winget!"
            } else {
                Write-WarnMsg "winget exited with code $($installProcess.ExitCode), falling back to unattended direct installer..."
            }
        } catch {
            Write-WarnMsg "winget installation failed: $_"
        }
    }

    # Verify if installed after winget
    $foundAfterWinget = Get-ChildItem -Path "${env:ProgramFiles}\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($foundAfterWinget) {
        $psqlPath = $foundAfterWinget.FullName
        $binDir = $foundAfterWinget.DirectoryName
        $env:PATH = "$binDir;$env:PATH"
    } else {
        # Fallback to direct official unattended installer
        Write-Step "Downloading official PostgreSQL 16 Windows 64-bit installer..."
        $tempInstaller = Join-Path $env:TEMP "postgresql-16-installer.exe"
        $downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64.exe"

        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $tempInstaller -UseBasicParsing
            Write-Success "Installer downloaded. Launching unattended background installation..."

            $args = "--unattendedmodeui none --mode unattended --superpassword `"$SuperPassword`" --servicepassword `"$SuperPassword`" --serverport $DbPort"
            $proc = Start-Process -FilePath $tempInstaller -ArgumentList $args -Wait -PassThru
            if ($proc.ExitCode -eq 0) {
                Write-Success "PostgreSQL installed via unattended installer."
            } else {
                Write-WarnMsg "Unattended installer exited with code $($proc.ExitCode)."
            }
        } catch {
            Write-Fail "Direct download failed: $_"
            Write-Host "Please download and run the installer from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
            exit 1
        } finally {
            if (Test-Path $tempInstaller) { Remove-Item -Force $tempInstaller }
        }
    }

    # Locate psql once more
    $finalCheck = Get-ChildItem -Path "${env:ProgramFiles}\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($finalCheck) {
        $psqlPath = $finalCheck.FullName
        $binDir = $finalCheck.DirectoryName
        $env:PATH = "$binDir;$env:PATH"
        Write-Success "PostgreSQL binary confirmed at: $psqlPath"
    } else {
        Write-Fail "Unable to locate psql.exe after installation. Please verify PostgreSQL is installed."
        exit 1
    }
}

# -----------------------------------------------------------------------------
# STEP 3: ENSURE POSTGRESQL WINDOWS SERVICE IS RUNNING
# -----------------------------------------------------------------------------
Write-Step "Checking PostgreSQL Windows Service status..."

$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgServices) {
    foreach ($svc in $pgServices) {
        if ($svc.Status -ne "Running") {
            Write-Host "Starting service $($svc.Name)..." -ForegroundColor Gray
            Start-Service -Name $svc.Name
            $svc.WaitForStatus("Running", [TimeSpan]::FromSeconds(30))
        }
        Write-Success "Service '$($svc.Name)' is $($svc.Status)."
    }
} else {
    Write-WarnMsg "No registered Windows service starting with 'postgresql' found. Checking direct port connection..."
}

# Verify port connectivity
$portOpen = $false
for ($i = 1; $i -le 10; $i++) {
    $tcp = Test-NetConnection -ComputerName "127.0.0.1" -Port $DbPort -WarningAction SilentlyContinue
    if ($tcp.TcpTestSucceeded) {
        $portOpen = $true
        Write-Success "PostgreSQL is accepting connections on 127.0.0.1:$DbPort."
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $portOpen) {
    Write-Fail "Could not reach PostgreSQL on port $DbPort. Ensure the service is active."
    exit 1
}

# -----------------------------------------------------------------------------
# STEP 4: PROVISION HRMS DATABASE & APPLICATION USER
# -----------------------------------------------------------------------------
Write-Step "Provisioning database '$DbName' and role '$DbUser'..."

$env:PGPASSWORD = $SuperPassword

$roleCheckSql = "DO `$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DbUser') THEN CREATE ROLE $DbUser WITH LOGIN PASSWORD '$DbPassword' CREATEDB; ELSE ALTER ROLE $DbUser WITH PASSWORD '$DbPassword'; END IF; END `$\$;"

& $psqlPath -h localhost -p $DbPort -U $SuperUser -d postgres -c $roleCheckSql
if ($LASTEXITCODE -ne 0) {
    Write-WarnMsg "Superuser login with default password failed. If password differs, prompt or set PGPASSWORD environment variable."
} else {
    Write-Success "Role '$DbUser' verified/configured."
}

# Check if database exists
$dbExists = & $psqlPath -h localhost -p $DbPort -U $SuperUser -d postgres -t -A -c "SELECT 1 FROM pg_database WHERE datname='$DbName';"
if ($dbExists -ne "1") {
    Write-Host "Database '$DbName' does not exist. Creating..." -ForegroundColor Gray
    & $psqlPath -h localhost -p $DbPort -U $SuperUser -d postgres -c "CREATE DATABASE $DbName OWNER $DbUser;"
    Write-Success "Database '$DbName' created."
} else {
    Write-Success "Database '$DbName' already exists."
}

# Grant privileges
& $psqlPath -h localhost -p $DbPort -U $SuperUser -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser; ALTER DATABASE $DbName OWNER TO $DbUser;" | Out-Null
Write-Success "Privileges granted to '$DbUser' on '$DbName'."

# -----------------------------------------------------------------------------
# STEP 5: RUN FLYWAY SCHEMA MIGRATIONS (V1 THROUGH V5)
# -----------------------------------------------------------------------------
if (-not $SkipMigration) {
    Write-Step "Applying database schema migrations (V1 to V5)..."

    $migrationDir = Join-Path $PSScriptRoot "..\backend\src\main\resources\db\migration"
    if (Test-Path $migrationDir) {
        $env:PGPASSWORD = $DbPassword
        $migrationFiles = Get-ChildItem -Path $migrationDir -Filter "*.sql" | Sort-Object Name

        foreach ($file in $migrationFiles) {
            Write-Host "  Executing: $($file.Name)..." -ForegroundColor Gray
            & $psqlPath -h localhost -p $DbPort -U $DbUser -d $DbName -f $file.FullName > $null 2>&1
        }
        Write-Success "All SQL migration scripts executed successfully!"
    } else {
        Write-WarnMsg "Migration directory not found at: $migrationDir"
    }
}

# -----------------------------------------------------------------------------
# STEP 6: VERIFY ALL CREATED TABLES FOR EVERY SCENARIO
# -----------------------------------------------------------------------------
Write-Step "Verifying all HRMS institutional tables in PostgreSQL '$DbName'..."

$env:PGPASSWORD = $DbPassword
$tableList = & $psqlPath -h localhost -p $DbPort -U $DbUser -d $DbName -t -A -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

$tables = ($tableList -split "`r?`n") | Where-Object { $_ -ne "" }

Write-Host "`nDiscovered $($tables.Count) Tables in PostgreSQL Database '$DbName':" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
$colCount = 0
$line = ""
foreach ($tbl in $tables) {
    $line += "{0,-32}" -f $tbl
    $colCount++
    if ($colCount % 2 -eq 0) {
        Write-Host "  $line" -ForegroundColor White
        $line = ""
    }
}
if ($line -ne "") {
    Write-Host "  $line" -ForegroundColor White
}
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

Write-Host "`n[HRMS-DB-SETUP] Setup complete! You can now start the application with:" -ForegroundColor Green
Write-Host "  Backend:  cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=postgres" -ForegroundColor White
Write-Host "  Combined: node scripts/dev.mjs" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Magenta

