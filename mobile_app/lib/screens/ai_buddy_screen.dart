import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class AiBuddyScreen extends StatelessWidget {
  const AiBuddyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'AI Buddy',
      webPath: '/',
      icon: Icons.smart_toy,
      color: Color(0xFF6366F1),
    );
  }
}
