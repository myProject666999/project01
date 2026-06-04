$ErrorActionPreference = "Stop"

$mysqlPath = "mysql"
$dbHost = "127.0.0.1"
$dbPort = "3306"
$dbUser = "root"
$dbPassword = "123456"
$sqlFile = (Resolve-Path "database\schema.sql").Path

Write-Host "正在导入数据库脚本: $sqlFile" -ForegroundColor Green

$sqlContent = [System.IO.File]::ReadAllText($sqlFile, [System.Text.Encoding]::UTF8)

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $mysqlPath
$psi.Arguments = "-h $dbHost -P $dbPort -u $dbUser -p$dbPassword --default-character-set=utf8mb4"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true

$process = [System.Diagnostics.Process]::Start($psi)

$writer = New-Object System.IO.StreamWriter($process.StandardInput.BaseStream, [System.Text.Encoding]::UTF8)
$writer.Write($sqlContent)
$writer.Close()

$stdOutput = $process.StandardOutput.ReadToEnd()
$stdError = $process.StandardError.ReadToEnd()

$process.WaitForExit()

if ($process.ExitCode -eq 0) {
    Write-Host "数据库导入成功！" -ForegroundColor Green
    if ($stdOutput) {
        Write-Host $stdOutput
    }
} else {
    Write-Host "数据库导入失败！" -ForegroundColor Red
    Write-Host "错误信息:" -ForegroundColor Red
    Write-Host $stdError -ForegroundColor Red
    exit 1
}
