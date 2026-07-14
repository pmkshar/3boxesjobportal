import 'package:flutter/material.dart';
import 'webview_feature_screen.dart';

class SkillGapScreen extends StatelessWidget {
  const SkillGapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const WebViewFeatureScreen(
      title: 'Skill Gap Analysis',
      webPath: '/',
      icon: Icons.track_changes_outlined,
      color: Color(0xFFF59E0B),
    );
  }
}
