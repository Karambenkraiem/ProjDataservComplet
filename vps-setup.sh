#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Script de setup VPS — à exécuter UNE SEULE FOIS en root
# Usage : bash vps-setup.sh
# ─────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/Karambenkraiem/ProjDataservComplet.git"
APP_DIR="/opt/dataserv/ProjDataservComplet"

echo "=== [1/5] Mise à jour système ==="
apt-get update -y && apt-get upgrade -y

echo "=== [2/5] Installation Docker ==="
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installé : $(docker --version)"
else
  echo "Docker déjà présent : $(docker --version)"
fi

echo "=== [3/5] Clone du dépôt ==="
mkdir -p /opt/dataserv
if [ -d "$APP_DIR/.git" ]; then
  echo "Dépôt déjà cloné — git pull..."
  git -C "$APP_DIR" pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "=== [4/5] Création du fichier .env ==="
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" << 'ENV'
# ── Base de données ───────────────────────────────────────────
POSTGRES_DB=dataserv
POSTGRES_USER=dataserv
POSTGRES_PASSWORD=CHANGE_ME_strong_password_here

# ── JWT ───────────────────────────────────────────────────────
JWT_SECRET=CHANGE_ME_minimum_32_chars_completely_random
JWT_EXPIRES_IN=24h

# ── App ───────────────────────────────────────────────────────
FRONTEND_URL=http://152.228.136.140

# ── SMTP (optionnel) ──────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ENV
  echo ""
  echo "!!! IMPORTANT : Éditez le fichier .env avant de démarrer !!!"
  echo "    nano $APP_DIR/.env"
else
  echo ".env déjà existant — non modifié."
fi

echo "=== [5/5] Setup SSH pour déploiement automatique ==="
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Setup VPS terminé !                                        ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Étapes suivantes :                                         ║"
echo "║  1. Éditez le .env :                                        ║"
echo "║     nano $APP_DIR/.env"
echo "║  2. Ajoutez la clé SSH publique dans :                      ║"
echo "║     ~/.ssh/authorized_keys                                   ║"
echo "║  3. Premier démarrage manuel :                              ║"
echo "║     cd $APP_DIR && docker compose up -d --build             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
