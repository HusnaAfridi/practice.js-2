# ✨ Interactive 3D Beating Red Heart ✨

A romantic, interactive visual experience crafted in pure **Vanilla JavaScript**, **HTML5 Canvas**, and modern **Glassmorphism CSS**.

---

## 🌟 Highlights & Features

1. **Volumetric 3D Parametric Heart**:
   - Thousands of glowing celestial particles calculated via the mathematical parametric heart curve ($x = 16\sin^3(t)$, $y = -(13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t))$).
   - Dynamic 3D depth and parallax that tilts smoothly in real-time as you move your mouse or touch the screen.

2. **Realistic "Lub-Dub" Cardiac Rhythm**:
   - Modeled after genuine dual-pulse cardiac cycle (atrial systole followed by ventricular contraction).
   - Adjustable BPM slider from relaxed (40 BPM) to passionate (140 BPM).

3. **Synthesized Heartbeat Audio**:
   - Realistic low-frequency heartbeat sound synthesized on-the-fly using the **Web Audio API** (zero external mp3 downloads required!).
   - Toggle audio on/off anytime with the sound button.

4. **Click & Tap Explosions**:
   - Click anywhere on the screen (or press `Spacebar`) to trigger an explosive burst of mini floating hearts and glowing stardust.
   - Cursor movement leaves a faint glowing fairy-dust trail.

5. **Theme Customization & Personalization**:
   - **4 Color Themes**: Ruby Passion, Crimson Fire, Neon Bloom, and Rose Gold.
   - **Custom Message Editor**: Personalize the glowing headline with any name or romantic phrase you wish.

---

## 🚀 How to Run in VS Code

### Option 1: Open Directly in Your Web Browser
1. In VS Code's Explorer, navigate to `index.html`.
2. Right-click [index.html](file:///C:/Users/Super/.gemini/antigravity/scratch/fun%20project/index.html) and select **Reveal in File Explorer** (or press `Alt + B` if you have the *Open in Default Browser* extension).
3. Double-click `index.html` to open it in Chrome, Edge, Brave, or Firefox.

### Option 2: Run with VS Code "Live Server"
1. In VS Code Extensions (`Ctrl + Shift + X`), search and install **Live Server** (by Ritwick Dey).
2. Right-click `index.html` and choose **Open with Live Server**.
3. It will launch at `http://127.0.0.1:5500`.

### Setting as Active Workspace
To set this folder as your active workspace in VS Code:
1. In VS Code, click **File** > **Open Folder...** (or `Ctrl + K, Ctrl + O`).
2. Select:
   ```text
   C:\Users\Super\.gemini\antigravity\scratch\fun project
   ```
3. Click **Select Folder**.

---

## 📁 Project Structure

```
fun project/
│
├── index.html        # Main HTML5 Canvas container & modern UI dock
├── style.css         # Glassmorphism styling, ambient radial lighting & animations
├── script.js         # Math heart formulas, 3D particles, Web Audio engine & interactions
└── README.md         # Guide and feature overview
```
