<#
.SYNOPSIS
    Blog Engine — Migration helper for Windows PowerShell / CMD.
    Equivalent of the Makefile for environments without GNU Make.

.DESCRIPTION
    Run from the backend/ directory.

.EXAMPLES
    .\scripts\migrate.ps1 up
    .\scripts\migrate.ps1 down
    .\scripts\migrate.ps1 down-all
    .\scripts\migrate.ps1 status
    .\scripts\migrate.ps1 force 3
    .\scripts\migrate.ps1 create add_tags_table
    .\scripts\migrate.ps1 build
    .\scripts\migrate.ps1 run
#>

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet('up', 'down', 'down-all', 'status', 'force', 'create', 'seed', 'build', 'run', 'help')]
    [string]$Action,

    [Parameter(Position = 1)]
    [string]$Arg = ""
)

$MigrateCmd  = "go run ./cmd/migrate"
$MigrationsDir = ".\migrations"

function Write-Header {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║            Blog Engine — Migration Script             ║" -ForegroundColor Cyan
    Write-Host "  ╠═══════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "  ║  .\scripts\migrate.ps1 up                             ║"
    Write-Host "  ║  .\scripts\migrate.ps1 down                           ║"
    Write-Host "  ║  .\scripts\migrate.ps1 down-all                       ║"
    Write-Host "  ║  .\scripts\migrate.ps1 status                         ║"
    Write-Host "  ║  .\scripts\migrate.ps1 force <version>                ║"
    Write-Host "  ║  .\scripts\migrate.ps1 create <migration_name>        ║"
    Write-Host "  ║  .\scripts\migrate.ps1 seed                           ║"
    Write-Host "  ║  .\scripts\migrate.ps1 build                          ║"
    Write-Host "  ║  .\scripts\migrate.ps1 run                            ║"
    Write-Host "  ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

switch ($Action) {

    'up' {
        Write-Host "▶  Applying all pending migrations..." -ForegroundColor Yellow
        Invoke-Expression "$MigrateCmd -action=up"
    }

    'down' {
        $steps = if ($Arg -ne "") { $Arg } else { "1" }
        Write-Host "▶  Rolling back $steps step(s)..." -ForegroundColor Yellow
        Invoke-Expression "$MigrateCmd -action=down -steps=$steps"
    }

    'down-all' {
        Write-Host "⚠️  WARNING: This will roll back ALL migrations and drop all data!" -ForegroundColor Red
        $confirm = Read-Host "    Type 'yes' to confirm"
        if ($confirm -ne "yes") {
            Write-Host "Aborted." -ForegroundColor Gray
            exit 0
        }
        Invoke-Expression "$MigrateCmd -action=down-all"
    }

    'status' {
        Invoke-Expression "$MigrateCmd -action=status"
    }

    'force' {
        if ($Arg -eq "") {
            Write-Host "❌  Usage: .\scripts\migrate.ps1 force <version>" -ForegroundColor Red
            exit 1
        }
        Write-Host "▶  Forcing version to $Arg..." -ForegroundColor Yellow
        Invoke-Expression "$MigrateCmd -action=force -version=$Arg"
    }

    'create' {
        if ($Arg -eq "") {
            Write-Host "❌  Usage: .\scripts\migrate.ps1 create <snake_case_name>" -ForegroundColor Red
            exit 1
        }

        # Count existing .up.sql files to determine next number
        $existing = (Get-ChildItem -Path $MigrationsDir -Filter "*.up.sql" -ErrorAction SilentlyContinue).Count
        $next     = $existing + 1
        $num      = $next.ToString("000000")
        $upFile   = "$MigrationsDir\${num}_${Arg}.up.sql"
        $downFile = "$MigrationsDir\${num}_${Arg}.down.sql"

        New-Item -ItemType File -Path $upFile   -Force | Out-Null
        New-Item -ItemType File -Path $downFile -Force | Out-Null

        Write-Host "✅  Created migration files:" -ForegroundColor Green
        Write-Host "    $upFile"   -ForegroundColor White
        Write-Host "    $downFile" -ForegroundColor White
    }

    'seed' {
        Write-Host "▶  Seeding database with default data..." -ForegroundColor Yellow
        Invoke-Expression "go run ./cmd/seed"
    }

    'build' {
        Write-Host "▶  Building cms.exe..." -ForegroundColor Yellow
        go build -o cms.exe ./cmd/api/main.go
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅  Built: cms.exe" -ForegroundColor Green
        }
    }

    'run' {
        Write-Host "▶  Starting dev server..." -ForegroundColor Yellow
        go run ./cmd/api/main.go
    }

    'help' {
        Write-Header
    }
}
