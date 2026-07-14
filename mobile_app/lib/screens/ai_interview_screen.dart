import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class AiInterviewScreen extends StatelessWidget {
  const AiInterviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'AI Interview',
      webPath: '/',
      icon: Icons.psychology,
      color: Color(0xFF8B5CF6),
    );
  }
}
