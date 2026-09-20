import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { deployDistToGhPages } from './gh-pages-deploy.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--local-only');
const deployCloudflare = args.includes('--cloudflare') || process.env.CLOUDFLARE === '1';

// Allow optional custom maintenance message
const msgIdx = args.indexOf('--message');
const customMessage = msgIdx !== -1 && args[msgIdx + 1] ? args[msgIdx + 1] : null;

/**
 * Generate the standalone, responsive paused maintenance HTML page.
 */
export function generateMaintenanceHtml(customText = null) {
  const explanation = customText || `Our online menu catalog and booking portal is currently paused for scheduled system updates and maintenance. We apologize for any temporary inconvenience. Full service will resume shortly.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sri Vinayaka Caterers | Scheduled Maintenance</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="Sri Vinayaka Caterers online portal is currently undergoing scheduled system updates and maintenance.">
  <style>
    :root {
      --bg-dark: #070a12;
      --card-bg: rgba(17, 24, 39, 0.90);
      --card-border: rgba(245, 158, 11, 0.28);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --amber-primary: #f59e0b;
      --amber-dark: #d97706;
      --amber-glow: rgba(245, 158, 11, 0.15);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 50% 10%, rgba(217, 119, 6, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 20% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 50%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      line-height: 1.6;
    }
    .maintenance-container {
      width: 100%;
      max-width: 580px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 50px -10px var(--amber-glow);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 40px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .maintenance-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b);
    }
    .icon-wrapper {
      width: 76px;
      height: 76px;
      margin: 0 auto 20px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--amber-primary);
      box-shadow: 0 0 24px rgba(245, 158, 11, 0.2);
    }
    .icon-wrapper svg {
      width: 40px;
      height: 40px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 9999px;
      color: var(--amber-primary);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 20px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: var(--amber-primary);
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
    }
    .subheading {
      color: var(--amber-primary);
      font-size: 0.95rem;
      font-weight: 500;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent);
      margin: 0 auto 24px;
      width: 80%;
    }
    p.message {
      font-size: 1.05rem;
      color: var(--text-muted);
      margin-bottom: 28px;
      line-height: 1.65;
    }
    .contact-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .contact-card h3 {
      font-size: 0.95rem;
      color: #e2e8f0;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .contact-card p {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #090d16;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-1px);
    }
    .btn-whatsapp {
      background: rgba(37, 211, 102, 0.12);
      color: #25d366;
      border: 1px solid rgba(37, 211, 102, 0.3);
    }
    .btn-whatsapp:hover {
      background: rgba(37, 211, 102, 0.2);
      transform: translateY(-1px);
    }
    .footer {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="maintenance-container">
    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </div>

    <div class="status-pill">
      <span class="pulse-dot"></span>
      Scheduled Maintenance
    </div>

    <h1>Sri Vinayaka Caterers</h1>
    <div class="subheading">Pure Vegetarian Catering • Hyderabad</div>

    <div class="divider"></div>

    <p class="message">
      ${explanation}
    </p>

    <div class="contact-card">
      <h3>Need Catering for an Upcoming Event?</h3>
      <p>Direct bookings and catering inquiries remain open. Contact us directly:</p>
      <div class="btn-group">
        <a href="tel:+919533032737" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          Call +91 95330 32737
        </a>
        <a href="https://wa.me/919533032737?text=Hello%20Sri%20Vinayaka%20Caterers%2C%20I%20would%20like%20to%20inquire%20about%20catering%20services" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp Chat
        </a>
      </div>
    </div>

    <div class="footer">
      &copy; Sri Vinayaka Caterers &bull; Hyderabad, Telangana
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Builds the paused distribution bundle into dist/.
 * Removes all public assets, dishes, and catalog, replacing them with the maintenance page.
 * Preserves dist/.git if present so git history/remote config remains intact.
 */
export async function buildPausedDist(customText = null) {
  const distDir = resolve(process.cwd(), 'dist');

  // Clean existing non-git contents in dist/
  if (existsSync(distDir)) {
    const existing = await readdir(distDir);
    for (const item of existing) {
      if (item !== '.git') {
        await rm(resolve(distDir, item), { recursive: true, force: true });
      }
    }
  } else {
    await mkdir(distDir, { recursive: true });
  }

  const html = generateMaintenanceHtml(customText);

  // Write index.html and 404.html (for route catch-all)
  await writeFile(resolve(distDir, 'index.html'), html, 'utf8');
  await writeFile(resolve(distDir, '404.html'), html, 'utf8');

  // Add .nojekyll for GitHub Pages
  await writeFile(resolve(distDir, '.nojekyll'), '', 'utf8');

  // Block search crawlers during maintenance
  await writeFile(resolve(distDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

  console.log('✅ Generated paused maintenance bundle in dist/ (catalog and dish photos removed).');
}

// Main execution if invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n⏸️  INITIATING WEBSITE PAUSE SEQUENCE...');

  await buildPausedDist(customMessage);

  const result = deployDistToGhPages({
    commitMessage: 'deploy: pause website for scheduled maintenance [ci skip]',
    dryRun,
    deployCloudflare
  });

  console.log('\n=============================================================');
  console.log('⏸️  WEBSITE PAUSED SUCCESSFULLY');
  console.log('=============================================================');
  console.log(`🌐 Live URL: https://sumanthmakkapati123.github.io/sri-vinayaka-caterers/`);
  console.log('🔒 Public catalog, dish photos, packages, and cart are now disabled.');
  console.log('📄 Visitors will now see the sleek maintenance holding page.');
  console.log('\n💡 When you get paid and want to resume the full site, run:');
  console.log('   npm run site:resume');
  console.log('=============================================================\n');
}
