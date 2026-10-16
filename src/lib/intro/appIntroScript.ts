// Shared by layout.tsx (a server component) and AppIntro, so it lives outside
// the "use client" module: a client module's plain exports reach the server
// as references, not values.

const APP_INTRO_SEEN_KEY = "saylo-intro-seen";

// Pages reached from an email or used to run the site, where a visitor came
// to do one specific thing (confirm an account, set a password, give a
// parent's consent): straight to it, no titles.
const SKIP_PATHS = ["/auth", "/reset-password", "/consent", "/guardian-report", "/admin"];

// Crawlers and link-preview fetchers render pages too; they should see the
// page, not a logo on a blank plate.
const BOT_UA = "bot|crawl|spider|slurp|lighthouse|headless|facebookexternalhit|whatsapp|telegram|preview";

// Visitors from an ad or a social post came from a feed with a thumb on the
// back button: on 2026-10-16, 95% of 122 TikTok-ad visitors left the home
// page, which first shows ~1s of empty plate and then the logo. They get the
// page straight away, and the whole visit is marked seen so a later full page
// load doesn't play it either. Recognised by a tagged link (utm_* or an ad
// click id), the referring site, or the in-app browser's user agent (TikTok,
// Instagram and Facebook often send no referrer from their own browsers).
const SOCIAL_PARAM = "[?&](utm_[a-z]+|fbclid|ttclid|gclid)=";
const SOCIAL_REFERRER = "^https?://([a-z0-9-]+\\\\.)*(tiktok\\\\.com|instagram\\\\.com|facebook\\\\.com|fb\\\\.com|fb\\\\.me)(/|$)";
const SOCIAL_UA = "musical_ly|bytedancewebview|tiktok|instagram|fban|fbav|fb_iab";

// Plays once per visit: once per launch in the iOS app, once per browser
// session on the website (moving between pages never replays it), or
// anywhere with ?intro=1 for a preview. Never with reduced motion (the OS
// setting or the site's own "stop animations" switch, read from storage here
// because this runs during parsing, before the a11y script has applied it).
// It also applies the theme the no-flash theme script will pick, for the same
// reason: that one runs later, and the plate would change colour mid-intro.
// A reload is never a new visit: AppUpdateWatcher reloads the app onto a new
// deploy, sometimes mid-use, and the intro must not cover that.
//
// The logo waits for the screen to hold still. In the iOS app the web view
// draws its first frames before iOS has pushed the page down below the
// status bar (contentInset: automatic), and then everything drops by the
// status bar's height in one frame. In the owner's first recording that came
// about 50ms after the plate appeared, with the logo already on screen, and
// it visibly jumped down.
// - In the app: as soon as the window's geometry has changed (the drop) and
//   then held still for SETTLE_MS, or at APP_MAX_MS at the latest. The
//   owner's second recording showed the drop isn't always visible to the page
//   (it waited out a 1.2s cap there, a long empty plate), so the cap is short:
//   0.5s is ten times the drop's observed delay, and the bubble's own 0.26s
//   beat after release keeps it off screen until ~0.76s.
// - On the website (no drop): SETTLE_MS of a still window, capped at
//   WEB_MAX_MS.
// data-intro-settled releases the logo's paused pieces (globals.css).
const SETTLE_MS = 150;
const SETTLE_MIN_MS = 120;
const WEB_MAX_MS = 900;
const APP_MAX_MS = 500;
const settleWatcher = `var settled=function(){h.setAttribute("data-intro-settled",typeof t0==="number"?String(Math.round(performance.now()-t0)):"0")};if(typeof requestAnimationFrame!=="function"){settled();return}var c=window.Capacitor,app=!!(c&&c.isNativePlatform&&c.isNativePlatform()),max=app?${APP_MAX_MS}:${WEB_MAX_MS},sig=function(){var v=window.visualViewport;return [innerWidth,innerHeight,h.clientWidth,h.clientHeight,v?v.width:0,v?v.height:0,v?v.offsetTop:0,v?v.pageTop:0,pageYOffset].join(",")},t0=performance.now(),first=sig(),last=first,since=t0,moved=false;(function tick(now){var s=sig();if(s!==last){last=s;since=now;moved=true}var ready=app?moved:true;if((ready&&now-since>=${SETTLE_MS}&&now-t0>=${SETTLE_MIN_MS})||now-t0>=max){settled();return}requestAnimationFrame(tick)})(t0);`;

export const appIntroScript = `(function(){try{var h=document.documentElement,force=/[?&]intro=1(&|$)/.test(location.search);if(!force){if(sessionStorage.getItem("${APP_INTRO_SEEN_KEY}")==="1")return;if(new RegExp("${BOT_UA}","i").test(navigator.userAgent))return;var path=location.pathname,skip=${JSON.stringify(SKIP_PATHS)};for(var i=0;i<skip.length;i++){if(path===skip[i]||path.indexOf(skip[i]+"/")===0)return}var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload")return;if(new RegExp("${SOCIAL_PARAM}","i").test(location.search)||new RegExp("${SOCIAL_REFERRER}","i").test(document.referrer||"")||new RegExp("${SOCIAL_UA}","i").test(navigator.userAgent)){sessionStorage.setItem("${APP_INTRO_SEEN_KEY}","1");return}}var p=JSON.parse(localStorage.getItem("saylo-a11y-prefs")||"{}");if((p&&p.stopAnimations)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("${APP_INTRO_SEEN_KEY}","1");var t=localStorage.getItem("theme");h.setAttribute("data-theme",t==="light"?"light":"dark");h.setAttribute("data-intro","play");${settleWatcher}}catch(e){try{document.documentElement.setAttribute("data-intro-settled","0")}catch(_){}}})();`;
