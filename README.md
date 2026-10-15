# Ward 30 — Nadi Mohalla, Pali, Rajasthan

Updated responsive bilingual complaint portal with profiles for present Parshad Mohsin Khatri and Mohd Javed (upcoming Parshad profile; Ex-Secretary, District Congress Committee, Pali), both shown with INC affiliation, INC-inspired tricolour styling, GPS location capture, optional photo/video uploads, Google authentication for the admin dashboard, and Google Sheets + Drive backend.

## Included
- Present Parshad profile: MOHSIN KHATRI
- MOHD JAVED profile: Upcoming Parshad · Ex-Secretary, District Congress Committee (DCC), Pali
- Both profiles marked with INC / Indian National Congress affiliation, as provided by the portal administrator
- INC hand symbol reference: https://commons.wikimedia.org/wiki/File:Indian_National_Congress_logo.svg (source credited to inc.in)
- Congress-inspired saffron, white and green visual theme
- English/Hindi language selection popup
- Complaint form with mandatory name, mobile, category, street/landmark and issue description
- GPS capture after the visitor starts filling in the location field, with a manual capture button too; browser permission and HTTPS are required
- Optional upload of up to 3 photos/videos, maximum 4 MB each; uploaded files are saved in Google Drive
- Complaint tracking and recent public summaries that do not show complainant mobile numbers
- Admin dashboard requiring both an allowed Google account and the 4-digit PIN
- Status updates, GPS map links and Drive media links for authorized admins
- WhatsApp message drafts for Parshad and responsible person (the user still presses Send in WhatsApp)

## 1. Connect Google Sheets and Drive
1. Create a new Google Sheet.
2. Open **Extensions → Apps Script** and paste `Code.gs`.
3. In `Code.gs`, set `ADMIN_PIN`, `GOOGLE_CLIENT_ID`, and `ADMIN_EMAILS`.
4. Deploy → **New deployment** → type **Web app**. Execute as **Me**. Set access to **Anyone** if the public should be able to submit complaints. Authorize Google Sheets, Drive and UrlFetch permissions.
5. Copy the deployed `/exec` URL into `API_URL` in `config.js`.
6. Deploy a new version after any Apps Script code changes.

## 2. Set up Google sign-in
1. In Google Cloud Console, create/select a project and configure the OAuth consent screen.
2. Create an OAuth Client ID of type **Web application**.
3. Add the exact production site origin (for example `https://your-site.vercel.app`) to **Authorized JavaScript origins**.
4. Put the client ID in both `config.js` (`GOOGLE_CLIENT_ID`) and `Code.gs` (`GOOGLE_CLIENT_ID`). They must match.
5. Put the allowed administrator email address(es), lowercase, in both `config.js` (`ADMIN_EMAILS`) and `Code.gs` (`ADMIN_EMAILS`). Backend verification is authoritative.
6. Change the default four-digit PIN in both files.
7. In the admin page, sign in with an allow-listed Google account and then enter the PIN.

## 3. WhatsApp setup
The public complaint form now has a **Send complaint via WhatsApp** button. It opens WhatsApp with the complaint details pre-filled and lets the resident choose a contact; the resident must press Send. This fallback works even before the portal backend is connected, but WhatsApp messages are not automatically sent. After a successful portal submission, the page also offers Share on WhatsApp. To show direct WhatsApp buttons for the Parshad and responsible person, set `PARSHAD_WHATSAPP` and `RESPONSIBLE_WHATSAPP` in `config.js` to each recipient’s full international number using digits only, e.g. `91XXXXXXXXXX`. These two real recipient numbers were not provided, so they are deliberately not guessed.

## 4. Publish
Upload all website files and the `assets` folder to a static host such as Vercel. Keep `index.html`, `track.html`, `recent.html`, `admin.html`, `style.css`, `app.js`, `config.js`, `Code.gs`, and `assets/` together.

## Privacy and deployment notes
- GPS is collected only after browser permission is granted. Geolocation generally requires HTTPS.
- Tell residents that uploaded images/videos and GPS coordinates will be stored in your connected Google Drive/Sheet. Do not upload private or sensitive information.
- Drive media files remain in the portal owner's Drive; access depends on that account's sharing settings.
- Google sign-in is only for the admin dashboard. Public complaint submission does not require Google login.
- This is a community portal template, not a verified official government website. Candidate and party details are supplied by the portal administrator. Use political logos in accordance with applicable election rules and local law.


### Official INC branding and updated palette
The site now references the Indian National Congress logo SVG hosted by Wikimedia Commons (https://commons.wikimedia.org/wiki/File:Indian_National_Congress_logo.svg) for the logo and browser favicon. An internet connection is needed to load that hosted SVG. The refreshed visual palette uses deep navy, muted teal, warm saffron accents, and a soft neutral background.


## Public portal and separate admin dashboard
- Public portal: `index.html` (plus `track.html` and `recent.html`). The public footer does not link to the admin dashboard.
- Admin dashboard: open `/admin.html` directly. It is a separate page, includes `noindex,nofollow`, and requires configured Google sign-in plus the admin PIN. This is not a substitute for server-side access controls; keep the Apps Script allowlist and PIN configured.
- The public footer credits **Designed By E-TECH**, **Founder MOHD SOHAIL**, and contact **7240610313**.
- The official INC SVG is referenced from Wikimedia Commons (`https://upload.wikimedia.org/wikipedia/commons/7/78/Indian_National_Congress_logo.svg`); a connection is required for that remote logo/favicon to load.


## Automatic GPS and WhatsApp alert setup (v8)

### GPS
The public page requests browser geolocation automatically on load. GPS only works on HTTPS (or localhost) and the visitor must grant the browser's location permission. Browsers do not allow websites to secretly collect location; if permission is denied, the resident can still submit their street/landmark and retry GPS with the button.

### Automatic WhatsApp alert to the Parshad
Automatic sending is done server-side through Meta WhatsApp Business Cloud API; it is not a `wa.me` link. Do not place API tokens in `config.js` or public files.

In Apps Script, open **Project Settings → Script Properties** and add:
- `WHATSAPP_ACCESS_TOKEN` — your WhatsApp Cloud API access token
- `WHATSAPP_PHONE_NUMBER_ID` — the business sender phone-number ID from Meta
- `PARSHAD_WHATSAPP` — Parshad's destination number in international digits, e.g. 91 followed by the 10-digit mobile number
- `WHATSAPP_TEMPLATE_NAME` — an approved template name (default `ward30_complaint_alert`)
- `WHATSAPP_TEMPLATE_LANGUAGE` — approved template language code (default `en`)

Create and get approval for a WhatsApp template named `ward30_complaint_alert` with **7 body parameters**, in this exact order:
1. Complaint ID
2. Resident name
3. Resident mobile
4. Complaint category
5. Street/landmark
6. Complaint details
7. GPS map link (or “GPS unavailable”)

The backend attempts to send this template automatically after the complaint is written to the Google Sheet. If sending fails, the complaint remains saved and the public page says that WhatsApp delivery was not confirmed. Delivery also depends on Meta's WhatsApp Business policies, template approval, account setup, and the recipient's applicable messaging/consent requirements. The portal cannot truthfully promise delivery until these are configured and tested.

### Official logo
The page header, language screen, footer and browser favicon reference the official Indian National Congress logo hosted on Wikimedia Commons. An internet connection is needed to load this remote SVG.


## v9 visual update
- Removed duplicated INC marks from the language popup, header and footer; the primary logo beside the Ward 30 name remains. Profile-level party markers remain beside the relevant profiles.
- Added a bilingual “How It Works?” section with four steps: register issue, WhatsApp alert, action taken, and problem resolved.
- Added an expected resolution target of usually 3–7 days, with a note that special cases may take up to one month; this is an estimate, not a guarantee.

## Language selection
The first public visit on Register, Track, and Recent Complaints shows a Hindi/English choice popup. The choice is saved in the browser and applies across portal pages; visitors can switch language later using the EN / हिन्दी control. The separate admin page also shows the choice popup when no preference has been saved.


Admin OTP repair: read FIX_OTP_UNKNOWN_ACTION.txt. Deploy Code.gs as a NEW Web App version; the /exec URL must be set in config.js.


Homepage update: removed the old duplicate Mohsin Khatri and Mohd Javed profile photos/cards from the hero area. The new combined Ward 30 campaign banner remains.
