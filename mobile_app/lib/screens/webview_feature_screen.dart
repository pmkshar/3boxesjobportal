import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WebViewFeatureScreen extends StatefulWidget {
  final String title;
  final String webPath;
  final IconData icon;
  final Color color;

  const WebViewFeatureScreen({
    super.key,
    required this.title,
    required this.webPath,
    required this.icon,
    required this.color,
  });

  @override
  State<WebViewFeatureScreen> createState() => _WebViewFeatureScreenState();
}

class _WebViewFeatureScreenState extends State<WebViewFeatureScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _token;

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://3boxesjobportal.vercel.app',
  );

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final url = '$baseUrl${widget.webPath}';

    // Initialize with URL
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            setState(() => _isLoading = false);
            if (_token != null) {
              _controller.runJavaScript(
                "localStorage.setItem('3boxes-auth', JSON.stringify({token: '$_token', state: {user: null}}));"
              );
            }
          },
          onWebResourceError: (error) {
            setState(() => _isLoading = false);
          },
        ),
      );

    // Load URL using loadRequest with proper Uri
    _controller.loadRequest(Uri.parse(url));

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            Icon(widget.icon, size: 20, color: Colors.white),
            const SizedBox(width: 8),
            Text(widget.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          ],
        ),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Color(0xFF059669)),
                  const SizedBox(height: 16),
                  Text('Loading ${widget.title}...', style: const TextStyle(color: Color(0xFF66789C))),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
