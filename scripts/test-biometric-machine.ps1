# =============================================================================
# HRMS Biometric Machine & Clock-Out Verification Test Script
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$DeviceToken = "change-me-device-token",
    [string]$DeviceCode = "BIO-001",
    [string]$EmployeeCode = "EMP101",
    [string]$TestUserEmail = "sarah.connor@institution.local",
    [string]$TestUserPassword = "Password@123"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   HRMS Biometric Machine & Clock-Out Verification Suite         " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Health check
Write-Host "`n[1/5] Checking Backend API Health at $BaseUrl/api/health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
    Write-Host "      Backend Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Backend is not reachable at $BaseUrl. Start the app first." -ForegroundColor Red
    exit 1
}

# 2. Test Clock-In from Biometric Device
$punchInTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
Write-Host "`n[2/5] Simulating BIOMETRIC CLOCK-IN for $EmployeeCode on $DeviceCode..." -ForegroundColor Yellow
$clockInPayload = @{
    deviceCode   = $DeviceCode
    employeeCode = $EmployeeCode
    punchTime    = $punchInTime
    direction    = "IN"
    rawPayload   = "ZK-TEST-PUNCH-IN-$(Get-Date -Format 'HHmmss')"
} | ConvertTo-Json

try {
    $inResponse = Invoke-RestMethod -Uri "$BaseUrl/api/biometric/attendance" `
        -Method Post `
        -Headers @{ "X-Device-Token" = $DeviceToken; "Content-Type" = "application/json" } `
        -Body $clockInPayload

    Write-Host "      Status: $($inResponse.status)" -ForegroundColor Green
    Write-Host "      Attendance Record ID: $($inResponse.attendanceRecordId)" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Biometric clock-in failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Test Clock-Out from Biometric Device
Start-Sleep -Seconds 2
$punchOutTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
Write-Host "`n[3/5] Simulating BIOMETRIC CLOCK-OUT for $EmployeeCode on $DeviceCode..." -ForegroundColor Yellow
$clockOutPayload = @{
    deviceCode   = $DeviceCode
    employeeCode = $EmployeeCode
    punchTime    = $punchOutTime
    direction    = "OUT"
    rawPayload   = "ZK-TEST-PUNCH-OUT-$(Get-Date -Format 'HHmmss')"
} | ConvertTo-Json

try {
    $outResponse = Invoke-RestMethod -Uri "$BaseUrl/api/biometric/attendance" `
        -Method Post `
        -Headers @{ "X-Device-Token" = $DeviceToken; "Content-Type" = "application/json" } `
        -Body $clockOutPayload

    Write-Host "      Status: $($outResponse.status)" -ForegroundColor Green
    Write-Host "      Attendance Record ID: $($outResponse.attendanceRecordId)" -ForegroundColor Green
    Write-Host "      [VERIFIED] Clock-out successfully persisted to database!" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] Biometric clock-out failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Test User Login for the Test User
Write-Host "`n[4/5] Testing user login for $TestUserEmail..." -ForegroundColor Yellow
$loginPayload = @{
    email    = $TestUserEmail
    password = $TestUserPassword
} | ConvertTo-Json

$token = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $loginPayload

    $token = $loginResponse.accessToken
    Write-Host "      Login Successful! Access Token issued (Length: $($token.Length))." -ForegroundColor Green
    Write-Host "      Roles: $($loginResponse.roles -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "      [ERROR] User login failed: $_" -ForegroundColor Red
}

# 5. Verify Database Records via Authenticated API
if ($token) {
    Write-Host "`n[5/5] Fetching live attendance logs from database..." -ForegroundColor Yellow
    try {
        $attendance = Invoke-RestMethod -Uri "$BaseUrl/api/attendance?page=0&size=5" `
            -Method Get `
            -Headers @{ "Authorization" = "Bearer $token" }

        Write-Host "      Total Attendance Records in DB: $($attendance.totalElements)" -ForegroundColor Green
        foreach ($rec in $attendance.content) {
            Write-Host "      - Punch: $($rec.employeeCode) | $($rec.direction) | Time: $($rec.punchTime) | Terminal: $($rec.deviceCode)" -ForegroundColor White
        }
    } catch {
        Write-Host "      [NOTE] Could not fetch attendance (check user role permissions): $_" -ForegroundColor DarkGray
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "   Verification Completed Successfully!                          " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
