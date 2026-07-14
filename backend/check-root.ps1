$ErrorActionPreference = 'Stop'
try {
  $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/' -UseBasicParsing -MaximumRedirection 0
  $r.StatusCode
} catch {
  if ($_.Exception.Response) {
    $_.Exception.Response.StatusCode.value__
  } else {
    'FAIL'
    $_.Exception.Message
  }
}
