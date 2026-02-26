## Feuille de route Phase 1 — Mise en prod perso

### Étape 1 — Containerisation de l'application

- Créer un `Dockerfile` pour le backend Spring Boot
- Créer un `Dockerfile` pour le frontend Vue 3 (build Nginx)
- Créer un `docker-compose.yml` qui orchestre les 3 services : frontend, backend, Postgres
- Vérifier que tout tourne en local via Docker avant de toucher au serveur

### Étape 2 — Authentification minimale

- Ajouter Spring Security avec un compte unique en dur dans la config (juste pour toi)
- Protéger toutes les routes API
- Pas besoin de faire plus pour cette phase

### Étape 3 — Préparation du serveur

- Vérifier ton IP (fixe ou dynamique) — connecte toi sur `whatismyip.com` à deux moments différents
- Si IP dynamique : configurer **DuckDNS** ou pointer ton domaine existant via **Cloudflare** avec mise à jour automatique via un script ou un container dédié
- Installer Docker sur OpenMediaVault si ce n'est pas déjà fait (possible via le plugin OMV-Extras)
- Planifier l'allumage permanent de la machine

### Étape 4 — Déploiement

- Pousser ton code sur Git si ce n'est pas encore fait
- Copier ou cloner le projet sur le serveur
- Lancer le `docker-compose` sur le serveur
- Vérifier que l'appli répond en local sur le serveur

### Étape 5 — Exposition HTTPS

- Configurer ton reverse proxy existant (Nginx ou Traefik) pour pointer vers l'appli
- Pointer un sous-domaine de ton domaine existant vers ton IP (ex: `finance.tondomaine.com`)
- Générer un certificat SSL avec **Let's Encrypt** (Certbot si Nginx, intégré si Traefik)
- Vérifier que l'appli est accessible depuis l'extérieur en HTTPS

### Étape 6 — Backups Postgres

- Mettre en place un script `pg_dump` automatique via cron
- Stocker les dumps quelque part de sûr (un autre disque, ou un cloud gratuit comme Backblaze B2)

### Étape 7 — Validation

- Utiliser l'appli au quotidien pendant 2-4 semaines
- Noter les frictions et bugs rencontrés en conditions réelles
- Corriger et stabiliser avant de passer à la Phase 2