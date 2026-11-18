param([string]$ScriptFile, [string]$AudioDir)
$ErrorActionPreference = 'Stop'
$lines = Get-Content -LiteralPath $ScriptFile -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object -ComObject SAPI.SpVoice
$voices = $speaker.GetVoices('Language=804')
if ($voices.Count -eq 0) { throw 'Install a Simplified Chinese desktop speech voice to render the film.' }
$speaker.Voice = $voices.Item(0)
for ($i = 0; $i -lt $lines.Count; $i++) {
    $file = Join-Path $AudioDir "line-$i.wav"
    $stream = New-Object -ComObject SAPI.SpFileStream
    $stream.Open($file, 3)
    try {
        $speaker.AudioOutputStream = $stream
        [void]$speaker.Speak($lines[$i])
    } finally { $stream.Close() }
}
