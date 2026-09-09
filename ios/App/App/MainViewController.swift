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
    }
}
