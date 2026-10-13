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

// Plays once per visit: once per launch in the iOS app, once per browser
// session on the website (moving between pages never replays it), or
// anywhere with ?intro=1 for a preview. Never with reduced motion (the OS
// setting or the site's own "stop animations" switch, read from storage here
// because this runs during parsing, before the a11y script has applied it).
// It also applies the theme the no-flash theme script will pick, for the same
// reason: that one runs later, and the plate would change colour mid-intro.
// A reload is never a new visit: AppUpdateWatcher reloads the app onto a new
// deploy, sometimes mid-use, and the intro must not cover that.
export const appIntroScript = `(function(){try{var h=document.documentElement,force=/[?&]intro=1(&|$)/.test(location.search);if(!force){if(sessionStorage.getItem("${APP_INTRO_SEEN_KEY}")==="1")return;if(new RegExp("${BOT_UA}","i").test(navigator.userAgent))return;var path=location.pathname,skip=${JSON.stringify(SKIP_PATHS)};for(var i=0;i<skip.length;i++){if(path===skip[i]||path.indexOf(skip[i]+"/")===0)return}var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload")return}var p=JSON.parse(localStorage.getItem("saylo-a11y-prefs")||"{}");if((p&&p.stopAnimations)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("${APP_INTRO_SEEN_KEY}","1");var t=localStorage.getItem("theme");h.setAttribute("data-theme",t==="light"?"light":"dark");h.setAttribute("data-intro","play")}catch(e){}})();`;
