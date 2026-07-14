import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class ApplicationsTrackerScreen extends StatelessWidget {
  const ApplicationsTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Applications Tracker',
      webPath: '/',
      icon: Icons.track_changes,
      color: Color(0xFF10B981),
    );
  }
}
