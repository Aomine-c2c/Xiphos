[Setup]
AppName=Xiphos Trading Framework
AppVersion=1.0.0
AppPublisher=Aomine-c2c
DefaultDirName={localappdata}\Programs\Xiphos
DefaultGroupName=Xiphos
OutputDir=Output
OutputBaseFilename=Xiphos_Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
SetupIconFile=compiler:SetupClassicIcon.ico
UninstallDisplayIcon={app}\Xiphos.exe

[Files]
Source: "dist\Xiphos.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Xiphos"; Filename: "{app}\Xiphos.exe"
Name: "{group}\Uninstall Xiphos"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Xiphos"; Filename: "{app}\Xiphos.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"

[Run]
Filename: "{app}\Xiphos.exe"; Description: "Launch Xiphos"; Flags: nowait postinstall skipifsilent
