// Shared by layout.tsx (a server component) and AppIntro, so it lives outside
// the "use client" module: a client module's plain exports reach the server
// as references, not values.

const APP_INTRO_SEEN_KEY = "saylo-intro-seen";

// Plays inside the native app (the Capacitor bridge is injected at document
// start, so it exists before this runs), or anywhere with ?intro=1 for a
// preview. Never twice in one launch, never with reduced motion (the OS
// setting or the site's own "stop animations" switch, read from storage here
// because this runs during parsing, before the a11y script has applied it).
// It also applies the theme the no-flash theme script will pick, for the same
// reason: that one runs later, and the plate would change colour mid-intro.
// A reload is never a launch: AppUpdateWatcher reloads the app onto a new
// deploy, sometimes mid-use, and the intro must not cover that.
export const appIntroScript = `(function(){try{var h=document.documentElement,force=/[?&]intro=1(&|$)/.test(location.search),c=window.Capacitor;if(!force&&!(c&&c.isNativePlatform&&c.isNativePlatform()))return;if(!force&&sessionStorage.getItem("${APP_INTRO_SEEN_KEY}")==="1")return;var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(!force&&n&&n.type==="reload")return;var p=JSON.parse(localStorage.getItem("saylo-a11y-prefs")||"{}");if((p&&p.stopAnimations)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("${APP_INTRO_SEEN_KEY}","1");var t=localStorage.getItem("theme");h.setAttribute("data-theme",t==="light"?"light":"dark");h.setAttribute("data-intro","play")}catch(e){}})();`;
