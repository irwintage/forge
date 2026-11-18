# Tap Tempo | Forge Tools

Conversion du bloc Hostinger en trois fichiers, avec styles et logique préservés.

## Fichiers
- `index.html` : page autonome et dépendance Tone.js 14.8.49 (CDN).
- `style.css` : CSS original (y compris ses surcharges successives).
- `app.js` : logique originale du métronome et du Tap Tempo.

## Utilisation
Ouvrir avec un serveur local (par exemple VS Code Live Server ou `python -m http.server 8000`) puis visiter `http://localhost:8000/Forge%20Tools/tap-tempo/` si le serveur démarre au-dessus du dossier, ou `http://localhost:8000/` s'il démarre dans le dossier de l'outil. Connexion Internet nécessaire pour Tone.js et Google Fonts. Démarrer le son par un clic utilisateur.

## Intégration future Forge
Cette version est **autonome** et n'est **pas encore un module montable/démontable comme Knot**. Le gestionnaire de Forge devra notamment prévoir la libération des ressources Tone.js (Transport, synthés), des handlers clavier/resize et des timers. Ne pas injecter directement `app.js` plusieurs fois dans le même document : il possède des événements globaux. La prochaine étape sera un adaptateur avec `mount()`/`unmount()` après définition du Tool Manager.

Aucun changement intentionnel des algorithmes, paramètres, visuels ou interactions de l'original. Vérification structurelle seulement, pas de test audio navigateur.
