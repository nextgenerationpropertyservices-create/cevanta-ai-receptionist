$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$resourceFolder = Join-Path $projectRoot 'desktop-resources'
$desktopFolder = [Environment]::GetFolderPath('Desktop')
if (-not $desktopFolder -or -not (Test-Path -LiteralPath $desktopFolder)) { throw 'Windows Desktop folder is unavailable.' }
$skillRoot = 'C:\Users\herri\.codex\skills'
$pluginRoot = 'C:\Users\herri\.codex\plugins\cache'
$targets = [ordered]@{
  'Project documents' = Join-Path $projectRoot 'docs'
  'Project README' = Join-Path $projectRoot 'README.md'
  'Project rules' = Join-Path $projectRoot 'AGENTS.md'
  'Original build prompt' = Join-Path $projectRoot 'Cevanta_Software_Agent_Team_Codex_Prompt.md'
  'Agent definitions' = Join-Path $projectRoot '.codex\agents'
  'Installed skills' = $skillRoot
  'Plugin skills' = $pluginRoot
}
$shell = New-Object -ComObject WScript.Shell
foreach ($entry in $targets.GetEnumerator()) {
  if (-not (Test-Path -LiteralPath $entry.Value)) { throw ('Missing target: ' + $entry.Key) }
  $linkPath = Join-Path $resourceFolder ($entry.Key + '.lnk')
  if (Test-Path -LiteralPath $linkPath) { throw ('Shortcut already exists: ' + $entry.Key) }
  $link = $shell.CreateShortcut($linkPath)
  $link.TargetPath = $entry.Value
  $link.WorkingDirectory = $projectRoot
  $link.Description = 'Open original Cevanta resource: ' + $entry.Key
  $link.Save()
  $verified = $shell.CreateShortcut($linkPath)
  if ($verified.TargetPath -ne $entry.Value) { throw ('Shortcut verification failed: ' + $entry.Key) }
  Write-Output ('PASS ' + $entry.Key)
}
$desktopLinkPath = Join-Path $desktopFolder 'Cevanta Markdown and Skills.lnk'
if (Test-Path -LiteralPath $desktopLinkPath) { throw 'Desktop shortcut already exists; no existing file was overwritten.' }
$desktopLink = $shell.CreateShortcut($desktopLinkPath)
$desktopLink.TargetPath = $resourceFolder
$desktopLink.WorkingDirectory = $resourceFolder
$desktopLink.Description = 'Cevanta Markdown documents, agent instructions and installed skills'
$desktopLink.Save()
if ($shell.CreateShortcut($desktopLinkPath).TargetPath -ne $resourceFolder) { throw 'Desktop shortcut verification failed.' }
Write-Output ('PASS Desktop shortcut: ' + $desktopLinkPath)
