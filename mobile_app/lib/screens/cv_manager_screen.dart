import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class CvManagerScreen extends StatelessWidget {
  const CvManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'CV Manager',
      webPath: '/',
      icon: Icons.description,
      color: Color(0xFF3B82F6),
    );
  }
}
