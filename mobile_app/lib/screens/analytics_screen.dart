import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Analytics',
      webPath: '/',
      icon: Icons.bar_chart,
      color: Color(0xFFF97316),
    );
  }
}
