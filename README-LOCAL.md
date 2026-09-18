filebump:

cloudflared tunnel run --url http://localhost:7001 --token eyJhIjoiMjUyOTg2NTNhYTc2NzQ4MzVjZTA4NThkOTUzNjJlYjgiLCJ0IjoiMTNjM2I5YWQtYTg2MC00NzU0LTk5MWYtMjA0NDBiZmQ4NjJlIiwicyI6Ik5qWXhNVGRtTW1RdE1UY3dPUzAwWWprNExXSTFPR1V0TVdJNU9EUTNNbVpqWldaayJ9



sharefolder:

# Tunnel only needs sharefolder-web (port 3010). Signaling lives in Next API routes.
cloudflared tunnel run --url http://localhost:3010 --token eyJhIjoiMjUyOTg2NTNhYTc2NzQ4MzVjZTA4NThkOTUzNjJlYjgiLCJ0IjoiMGNmNTYwZDYtNzc1NS00ZGQ0LWFhYjgtMDhhOGQwNTEwMWU0IiwicyI6Ik9UTXpOVFppT1RZdFl6TmpaUzAwTXpnekxXSXdOV1F0WkRBd01tWm1NR0ZqWXpjNSJ9

# Local stack:
#   npx nx serve sharefolder-web   # :3010 (UI + signaling API)
#   npx nx serve sharefolder-app   # Electron → http://localhost:3010
