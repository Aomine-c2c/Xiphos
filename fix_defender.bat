@echo off
echo Adding Xiphos build folder to Windows Defender exclusions...
PowerShell -Command "Add-MpPreference -ExclusionPath '%~dp0xiphos-tui\target'"
if %ERRORLEVEL% == 0 (
    echo [OK] Exclusion added successfully!
    echo You can now run 'Xiphos' to compile and launch.
) else (
    echo [FAIL] Could not add exclusion. Try right-clicking this file and selecting 'Run as administrator'.
)
pause
