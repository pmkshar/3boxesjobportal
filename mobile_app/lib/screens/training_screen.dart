import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class TrainingScreen extends StatelessWidget {
  const TrainingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Training',
      webPath: '/training',
      icon: Icons.school,
      color: Color(0xFF06B6D4),
    );
  }
}
