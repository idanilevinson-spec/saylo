import UIKit
import Capacitor

// Capacitor's WKWebView doesn't enable iOS's native swipe-back/forward
// gesture by default. In remote-URL mode the app is effectively a stack of
// real pages (topic -> exercise, list -> detail, etc.) with no OS-level way
// back unless every single page also ships its own in-page back button —
// this one native override gives every page that gesture for free instead.
class MainViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.allowsBackForwardNavigationGestures = true

        // WKWebView paints white by default during any blank moment between
        // pages — most visible during the OAuth round trip (Apple/Google page
        // -> Supabase's callback domain -> our own /auth/callback redirect ->
        // /dashboard), which is several real network hops, not one soft
        // client-side transition, so some blank moment there is unavoidable.
        // Matching the app's own dark background (the deliberate first-visit
        // default — see noFlashThemeScript in src/app/layout.tsx) makes those
        // moments read as a brief pause instead of a jarring white flash. A
        // user who's switched to light theme sees the reverse trade-off, but
        // Apple/Google's own auth pages are light-background regardless, so
        // there's already an inherent flash between themes either way.
        webView?.isOpaque = false
        webView?.backgroundColor = UIColor(
            red: CGFloat(0x0b) / 255.0,
            green: CGFloat(0x0c) / 255.0,
            blue: CGFloat(0x0f) / 255.0,
            alpha: 1.0
        )
        webView?.scrollView.backgroundColor = webView?.backgroundColor
        view.backgroundColor = webView?.backgroundColor
    }
}
