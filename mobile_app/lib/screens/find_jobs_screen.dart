import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class FindJobsScreen extends StatelessWidget {
  const FindJobsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Find Jobs',
      webPath: '/find-jobs',
      icon: Icons.search,
      color: Color(0xFF34A853),
    );
  }
}
