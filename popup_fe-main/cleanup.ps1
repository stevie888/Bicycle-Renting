# Wait for server to start
Start-Sleep -Seconds 5

Write-Host "🔍 Checking current umbrellas..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/debug/cleanup-umbrellas" -Method GET
Write-Host "Current umbrellas: $($response.count)" -ForegroundColor Cyan
$response.umbrellas | ForEach-Object { Write-Host "  - $($_.description) ($($_.location))" -ForegroundColor Gray }

Write-Host "`n🗑️ Cleaning up extra umbrellas..." -ForegroundColor Yellow
$cleanupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/debug/cleanup-umbrellas" -Method POST
Write-Host "✅ $($cleanupResponse.message)" -ForegroundColor Green
Write-Host "Deleted: $($cleanupResponse.deletedCount) umbrellas" -ForegroundColor Red
Write-Host "Remaining: $($cleanupResponse.remainingCount) umbrellas" -ForegroundColor Green

Write-Host "`n🎉 Final umbrellas:" -ForegroundColor Yellow
$cleanupResponse.remainingUmbrellas | ForEach-Object { 
    Write-Host "  - $($_.description) ($($_.location)) - $($_.status)" -ForegroundColor Green 
}

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green 