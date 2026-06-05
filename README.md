# P2P Chat for GitHub Pages

A static browser-to-browser chat app built with WebRTC data channels. You can deploy this to GitHub Pages because it requires only HTML/CSS/JS and uses manual offer/answer exchange for signaling.

## How to use

1. Open `index.html` on GitHub Pages or in two browser windows.
2. Pick a username and click **Save**.
3. In one window, click **Create Offer**.
4. Copy the offer text and paste it into the other window's remote code box.
5. In the remote window, click **Set Remote Offer**.
6. Copy the generated answer from the remote window's local code box and paste it back into the first window.
7. In the first window, click **Set Remote Answer**.
8. Once connected, type messages and send.

## Notes

- This app works best over HTTPS (GitHub Pages supports it).
- If you open it in two tabs on the same machine, it still works.
- Username is shared automatically through the data channel once connected.

## Publish to GitHub Pages

1. Create a new GitHub repository.
2. Push this folder to the repo, e.g.:
   - `git init`
   - `git add .`
   - `git commit -m "Add P2P chat app"
   - `git branch -M main`
   - `git remote add origin https://github.com/<your-username>/<your-repo>.git`
   - `git push -u origin main`
3. On GitHub, go to Settings > Pages and select the `main` branch / root folder.
4. Wait a minute for GitHub Pages to publish.
5. Open the published site URL and share it with another browser tab or device.

> The included workflow in `.github/workflows/pages.yml` can also deploy the site automatically when you push to `main`.
