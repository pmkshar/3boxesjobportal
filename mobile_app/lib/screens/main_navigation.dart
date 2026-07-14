import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'login_screen.dart';
import 'dashboard_screen.dart';
import 'find_jobs_screen.dart';
import 'ai_interview_screen.dart';
import 'cv_manager_screen.dart';
import 'applications_tracker_screen.dart';
import 'ai_buddy_screen.dart';
import 'skill_gap_screen.dart';
import 'job_fit_screen.dart';
import 'training_screen.dart';
import 'analytics_screen.dart';
import 'my_profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  Map<String, dynamic>? _user;
  bool _showAllFeatures = false;

  final List<NavigationItem> _navItems = const [
    NavigationItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Home'),
    NavigationItem(icon: Icons.search_outlined, activeIcon: Icons.search, label: 'Jobs'),
    NavigationItem(icon: Icons.psychology_outlined, activeIcon: Icons.psychology, label: 'Interview'),
    NavigationItem(icon: Icons.description_outlined, activeIcon: Icons.description, label: 'CV'),
    NavigationItem(icon: Icons.more_horiz, activeIcon: Icons.more_horiz, label: 'More'),
  ];

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      setState(() => _user = jsonDecode(userData));
    }
  }

  final List<Widget> _screens = const [
    DashboardScreen(),
    FindJobsScreen(),
    AiInterviewScreen(),
    CvManagerScreen(),
    SizedBox(), // Placeholder for More
  ];

  void _onNavTap(int index) {
    if (index == 4) {
      // More button - show all features
      _showFeaturesModal();
      return;
    }
    setState(() {
      _currentIndex = index;
      _showAllFeatures = false;
    });
  }

  void _showFeaturesModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('All Features', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: GridView.count(
                crossAxisCount: 3,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.85,
                children: [
                  _FeatureCard(icon: Icons.dashboard, label: 'Dashboard', color: const Color(0xFF059669), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 0); }),
                  _FeatureCard(icon: Icons.search, label: 'Find Jobs', color: const Color(0xFF34A853), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 1); }),
                  _FeatureCard(icon: Icons.assignment, label: 'Applications', color: const Color(0xFF10B981), onTap: () { Navigator.pop(context); _navigateToFeature(5); }),
                  _FeatureCard(icon: Icons.track_changes, label: 'Tracker', color: const Color(0xFF059669), onTap: () { Navigator.pop(context); _navigateToFeature(6); }),
                  _FeatureCard(icon: Icons.description, label: 'CV Manager', color: const Color(0xFF3B82F6), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 3); }),
                  _FeatureCard(icon: Icons.psychology, label: 'AI Interview', color: const Color(0xFF8B5CF6), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 2); }),
                  _FeatureCard(icon: Icons.smart_toy, label: 'AI Buddy', color: const Color(0xFF6366F1), onTap: () { Navigator.pop(context); _navigateToFeature(7); }),
                  _FeatureCard(icon: Icons.track_changes_outlined, label: 'Skill Gap', color: const Color(0xFFF59E0B), onTap: () { Navigator.pop(context); _navigateToFeature(8); }),
                  _FeatureCard(icon: Icons.work_outline, label: 'Job Fit', color: const Color(0xFF14B8A6), onTap: () { Navigator.pop(context); _navigateToFeature(9); }),
                  _FeatureCard(icon: Icons.school, label: 'Training', color: const Color(0xFF06B6D4), onTap: () { Navigator.pop(context); _navigateToFeature(10); }),
                  _FeatureCard(icon: Icons.bar_chart, label: 'Analytics', color: const Color(0xFFF97316), onTap: () { Navigator.pop(context); _navigateToFeature(11); }),
                  _FeatureCard(icon: Icons.person, label: 'My Profile', color: const Color(0xFFEC4899), onTap: () { Navigator.pop(context); _navigateToFeature(12); }),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _navigateToFeature(int index) {
    final screen = _getFeatureScreen(index);
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  Widget _getFeatureScreen(int index) {
    switch (index) {
      case 5: return const ApplicationsTrackerScreen();
      case 6: return const ApplicationsTrackerScreen();
      case 7: return const AiBuddyScreen();
      case 8: return const SkillGapScreen();
      case 9: return const JobFitScreen();
      case 10: return const TrainingScreen();
      case 11: return const AnalyticsScreen();
      case 12: return const MyProfileScreen();
      default: return const DashboardScreen();
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2)),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _navItems.asMap().entries.map((entry) {
                final idx = entry.key;
                final item = entry.value;
                final isActive = _currentIndex == idx;
                return GestureDetector(
                  onTap: () => _onNavTap(idx),
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isActive ? item.activeIcon : item.icon,
                          color: isActive ? const Color(0xFF059669) : const Color(0xFF66789C),
                          size: 24,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                            color: isActive ? const Color(0xFF059669) : const Color(0xFF66789C),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const NavigationItem({required this.icon, required this.activeIcon, required this.label});
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _FeatureCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
