# Quickstart: Wrapparr

## Prérequis

- Docker et Docker Compose installés
- (Optionnel) Clé API TMDB pour les affiches de films/séries

## Démarrage rapide

1. Cloner le dépôt et copier la configuration :

```bash
git clone <repo-url> wrapparr
cd wrapparr
cp .env.example .env
```

2. Éditer `.env` avec les valeurs minimales :

```env
DATABASE_URL=postgresql+asyncpg://wrapparr:secret@postgres:5432/wrapparr
REDIS_URL=redis://redis:6379/0
SECRET_KEY=<générer avec: python -c "import secrets; print(secrets.token_urlsafe(64))">
ENCRYPTION_KEY=<générer avec: python -c "import secrets; print(secrets.token_urlsafe(32))">
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_PASSWORD=<mot de passe admin>
TMDB_API_KEY=<optionnel>
```

3. Lancer l'application :

```bash
docker compose up -d
```

4. Vérifier que les services sont opérationnels :

```bash
docker compose ps
# Les 5 services doivent être "Up (healthy)"
```

5. Accéder à l'application :
   - Frontend : http://localhost
   - API docs : http://localhost:8000/docs

## Premier usage

1. Se connecter avec le compte admin créé au démarrage
2. Aller dans Admin → Services pour configurer les connecteurs
   (Tautulli, Jellyfin, ROMM, etc.)
3. Tester chaque connexion avec le bouton "Tester"
4. Déclencher manuellement un premier recap depuis le profil
5. Attendre la fin de la génération (progression affichée en
   temps réel)
6. Consulter le récapitulatif animé

## Vérification

- [ ] `docker compose ps` : 5 services healthy
- [ ] Page de login accessible sur http://localhost
- [ ] Connexion admin fonctionnelle
- [ ] Au moins un connecteur configuré et testé avec succès
- [ ] Premier recap généré et affiché
