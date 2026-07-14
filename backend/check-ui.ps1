$ErrorActionPreference = 'Stop'
$r = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/app/' -UseBasicParsing
'status=' + $r.StatusCode
'body=' + $r.Content.Substring(0, [Math]::Min(120, $r.Content.Length))
try {
  $r2 = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/' -UseBasicParsing -MaximumRedirection 0
  'root_status=' + $r2.StatusCode
  'root_loc=' + $r2.Headers.Location
} catch {
  if ($_.Exception.Response) { 'root_status=' + $_.Exception.Response.StatusCode.value__ } else { 'root=fail' }
}
