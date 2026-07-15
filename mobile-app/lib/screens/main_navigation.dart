import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'find_jobs_screen.dart';
import 'applications_tracker_screen.dart';
import 'ai_interview_screen.dart';
import 'resume_builder_screen.dart';
import 'cv_manager_screen.dart';
import 'ai_buddy_screen.dart';
import 'skill_gap_screen.dart';
import 'job_fit_screen.dart';
import 'training_screen.dart';
import 'analytics_screen.dart';
import 'profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  static const Color _primaryColor = Color(0xFF00C853);

  // Feature screen builder using switch statement (IDs 1-13)
  Widget _buildFeatureScreen(int featureId) {
    switch (featureId) {
      case 1:
        return const AiInterviewScreen();
      case 2:
        return const ResumeBuilderScreen();
      case 3:
        return const ApplicationsTrackerScreen();
      case 4:
        return const CvManagerScreen();
      case 5:
        return const AiBuddyScreen();
      case 6:
        return const SkillGapScreen();
      case 7:
        return const JobFitScreen();
      case 8:
        return const TrainingScreen();
      case 9:
        return const AnalyticsScreen();
      case 10:
        return const ProfileScreen();
      case 11:
        return const FindJobsScreen();
      case 12:
        return const SizedBox.shrink(); // reserved
      case 13:
        return const ResumeBuilderScreen();
      default:
        return const SizedBox.shrink();
    }
  }

  void _navigateToFeature(int featureId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => _buildFeatureScreen(featureId)),
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ApiService.clearToken();
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
      }
    }
  }

  // ── Home Tab ──────────────────────────────────────────────────────
  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Card
          _buildWelcomeCard(),
          const SizedBox(height: 24),

          // Quick Actions
          const Text(
            'Quick Actions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          _buildQuickActionGrid(),
          const SizedBox(height: 24),

          // Recent Activity
          const Text(
            'Recent Activity',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          _buildRecentActivityList(),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [_primaryColor, Color(0xFF00E676)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: _primaryColor.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 24,
                backgroundColor: Colors.white,
                child: Icon(Icons.person, color: _primaryColor, size: 28),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 14,
                      ),
                    ),
                    const Text(
                      'User',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.notifications_outlined, color: Colors.white, size: 28),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Your job search dashboard is ready. Let\'s find your next opportunity!',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid() {
    final items = [
      _QuickAction(icon: Icons.psychology, label: 'AI Interview', id: 1),
      _QuickAction(icon: Icons.description_outlined, label: 'Resume Builder', id: 2),
      _QuickAction(icon: Icons.track_changes, label: 'Applications Tracker', id: 3),
      _QuickAction(icon: Icons.folder_open, label: 'CV Manager', id: 4),
      _QuickAction(icon: Icons.smart_toy_outlined, label: 'AI Buddy', id: 5),
      _QuickAction(icon: Icons.trending_up, label: 'Skill Gap', id: 6),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _buildQuickActionCard(item);
      },
    );
  }

  Widget _buildQuickActionCard(_QuickAction action) {
    return InkWell(
      onTap: () => _navigateToFeature(action.id),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: _primaryColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _primaryColor.withOpacity(0.15)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: _primaryColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(action.icon, color: _primaryColor, size: 24),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                action.label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivityList() {
    final activities = [
      _Activity(icon: Icons.send, title: 'Applied to Senior Flutter Developer', subtitle: '2 hours ago', color: Colors.blue),
      _Activity(icon: Icons.check_circle, title: 'Interview Scheduled at TechCorp', subtitle: 'Yesterday', color: _primaryColor),
      _Activity(icon: Icons.update, title: 'Resume updated successfully', subtitle: '2 days ago', color: Colors.orange),
      _Activity(icon: Icons.star, title: 'New skill match found: AWS', subtitle: '3 days ago', color: Colors.purple),
    ];

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: activities.length,
        separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade100),
        itemBuilder: (context, index) {
          final a = activities[index];
          return ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: a.color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(a.icon, color: a.color, size: 20),
            ),
            title: Text(a.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            subtitle: Text(a.subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          );
        },
      ),
    );
  }

  // ── Find Jobs Tab ─────────────────────────────────────────────────
  Widget _buildFindJobsTab() {
    return const FindJobsScreen();
  }

  // ── Applications Tab ──────────────────────────────────────────────
  Widget _buildApplicationsTab() {
    return const ApplicationsTrackerScreen();
  }

  // ── More Tab ──────────────────────────────────────────────────────
  Widget _buildMoreTab() {
    final features = [
      _FeatureItem(icon: Icons.psychology, label: 'AI Interview', id: 1),
      _FeatureItem(icon: Icons.description_outlined, label: 'Resume Builder', id: 2),
      _FeatureItem(icon: Icons.track_changes, label: 'Applications Tracker', id: 3),
      _FeatureItem(icon: Icons.folder_open, label: 'CV Manager', id: 4),
      _FeatureItem(icon: Icons.smart_toy_outlined, label: 'AI Buddy', id: 5),
      _FeatureItem(icon: Icons.trending_up, label: 'Skill Gap', id: 6),
      _FeatureItem(icon: Icons.work_outline, label: 'Job Fit', id: 7),
      _FeatureItem(icon: Icons.school_outlined, label: 'Training', id: 8),
      _FeatureItem(icon: Icons.bar_chart, label: 'Analytics', id: 9),
      _FeatureItem(icon: Icons.person_outline, label: 'My Profile', id: 10),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'More Features',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.1,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: features.length,
            itemBuilder: (context, index) {
              final f = features[index];
              return _buildFeatureCard(f);
            },
          ),
          const SizedBox(height: 24),
          // Logout button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _handleLogout,
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text(
                'Logout',
                style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(_FeatureItem feature) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () => _navigateToFeature(feature.id),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(feature.icon, color: _primaryColor, size: 28),
              ),
              const SizedBox(height: 12),
              Text(
                feature.label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final tabs = [
      _buildHomeTab(),
      _buildFindJobsTab(),
      _buildApplicationsTab(),
      _buildMoreTab(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: tabs,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        indicatorColor: _primaryColor.withOpacity(0.12),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Find Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment),
            label: 'Applications',
          ),
          NavigationDestination(
            icon: Icon(Icons.more_horiz),
            selectedIcon: Icon(Icons.more_horiz),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

// ── Helper classes ──────────────────────────────────────────────────
class _QuickAction {
  final IconData icon;
  final String label;
  final int id;

  const _QuickAction({required this.icon, required this.label, required this.id});
}

class _Activity {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const _Activity({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });
}

class _FeatureItem {
  final IconData icon;
  final String label;
  final int id;

  const _FeatureItem({required this.icon, required this.label, required this.id});
}
