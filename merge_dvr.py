import os

with open('local-dvr-old.js', 'r', encoding='utf-16') as f:
    dvr_content = f.read()

# Extract just the functions and endpoints
lines = dvr_content.split('\n')
extract_lines = []
capturing = False
for line in lines:
    if line.startswith('async function getCameraId'):
        capturing = True
    if line.startswith('const PORT = 4000;'):
        capturing = False
    if capturing:
        extract_lines.append(line)

dvr_endpoints = '\n'.join(extract_lines)

# Replace the hardcoded `http://localhost:4000/clips` with just `/clips`
dvr_endpoints = dvr_endpoints.replace('http://localhost:4000/clips', '/clips')

with open('local-agent.js', 'a', encoding='utf-8') as f:
    f.write('\n// ================== DVR ENDPOINTS (MIGRATED) ==================\n')
    f.write(dvr_endpoints)
    f.write('\n// ==============================================================\n')

print("Successfully merged DVR endpoints into local-agent.js")
