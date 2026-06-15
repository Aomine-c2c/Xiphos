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
Name: "envPath"; Description: "Add Xiphos to system PATH (launch with 'Xiphos' anywhere)"; GroupDescription: "Advanced:"

[Run]
Filename: "{app}\Xiphos.exe"; Description: "Launch Xiphos"; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Tasks: envPath; Check: NeedsAddPath(ExpandConstant('{app}'))

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;
