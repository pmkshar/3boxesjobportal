import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class JobFitScreen extends StatelessWidget {
  const JobFitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Job Fit Evaluation',
      webPath: '/',
      icon: Icons.work_outline,
      color: Color(0xFF14B8A6),
    );
  }
}
