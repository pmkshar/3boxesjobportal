import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _user;
  bool _loading = true;
  Map<String, dynamic>? _stats;

  // Brand colors from logo
  static const _primaryGreen = Color(0xFF014217);
  static const _mediumGreen = Color(0xFF066722);
  static const _accentGreen = Color(0xFF04A331);
  static const _orangeAccent = Color(0xFFF26405);

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://3boxesjobportal.vercel.app',
  );

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      _user = jsonDecode(userData);
      final token = prefs.getString('auth_token');
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/api/analytics?userId=${_user?['id']}'),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode == 200) {
          _stats = jsonDecode(response.body)['summary'];
        }
      } catch (_) {}
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: _accentGreen,
          child: CustomScrollView(
            slivers: [
              // App Bar with Logo
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [_primaryGreen, _mediumGreen],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(24),
                      bottomRight: Radius.circular(24),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Logo in header
                                Image.asset(
                                  'assets/images/logo.png',
                                  height: 40,
                                  fit: BoxFit.contain,
                                  color: Colors.white.withOpacity(0.9),
                                  colorBlendMode: BlendMode.srcIn,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Welcome, ${_user?['name']?.split(' ').first ?? 'User'}!',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  "Here's what's happening with your career",
                                  style: TextStyle(color: Color(0xFFA3D8B0), fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: Colors.white.withOpacity(0.15),
                            child: Text(
                              _user?['name']?.substring(0, 1).toUpperCase() ?? 'U',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Hero banner image
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=200&fit=crop',
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          Container(
                        height: 140,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [_accentGreen, _mediumGreen],
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Center(
                          child: Icon(Icons.business_center, color: Colors.white, size: 40),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Quick Access Features
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: const Text(
                    'Quick Access',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _primaryGreen),
                  ),
                ),
              ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: GridView.count(
                    crossAxisCount: 4,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.75,
                    children: [
                      _QuickCard(Icons.psychology, 'AI Interview', const Color(0xFF8B5CF6)),
                      _QuickCard(Icons.description, 'CV Manager', const Color(0xFF3B82F6)),
                      _QuickCard(Icons.assignment, 'Tracker', _accentGreen),
                      _QuickCard(Icons.smart_toy, 'AI Buddy', const Color(0xFF6366F1)),
                      _QuickCard(Icons.track_changes_outlined, 'Skill Gap', _orangeAccent),
                      _QuickCard(Icons.work_outline, 'Job Fit', const Color(0xFF14B8A6)),
                      _QuickCard(Icons.school, 'Training', const Color(0xFF06B6D4)),
                      _QuickCard(Icons.bar_chart, 'Analytics', _orangeAccent),
                    ],
                  ),
                ),
              ),

              // Feature images carousel
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: SizedBox(
                    height: 120,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _FeatureImageCard(
                          'AI Resume Builder',
                          'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
                        ),
                        const SizedBox(width: 12),
                        _FeatureImageCard(
                          'Interview Practice',
                          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop',
                        ),
                        const SizedBox(width: 12),
                        _FeatureImageCard(
                          'Business Network',
                          'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop',
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Stats
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: const Text(
                    'Your Stats',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _primaryGreen),
                  ),
                ),
              ),

              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.4,
                  ),
                  delegate: SliverChildListDelegate([
                    _StatCard('Applications', '${_stats?['totalApplications'] ?? 0}', '+5%', true, Icons.assignment_outlined, _accentGreen),
                    _StatCard('Interviews', '${_stats?['interviewsCompleted'] ?? 0}', '+25%', true, Icons.computer, const Color(0xFF8B5CF6)),
                    _StatCard('Profile Views', '165', '+15%', true, Icons.visibility, const Color(0xFF06B6D4)),
                    _StatCard('Trainings', '${_stats?['trainingsCompleted'] ?? 0}', '+12%', true, Icons.school, _orangeAccent),
                  ]),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _QuickCard(IconData icon, String label, Color color) {
    return GestureDetector(
      onTap: () {
        // Navigate to feature - handled by parent
      },
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _FeatureImageCard(String title, String imageUrl) {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4E8EC)),
      ),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(
              imageUrl,
              height: 120,
              width: 200,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) =>
                  Container(
                height: 120,
                width: 200,
                decoration: BoxDecoration(
                  color: _accentGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.image, color: Color(0xFF04A331), size: 32),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xCC014217),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _StatCard(String title, String value, String change, bool isUp, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4E8EC)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: Color(0xFF66789C), fontWeight: FontWeight.w500)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _primaryGreen)),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(isUp ? Icons.trending_up : Icons.trending_down, size: 14, color: isUp ? _accentGreen : Colors.red),
              Text(change, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: isUp ? _accentGreen : Colors.red)),
              const SizedBox(width: 4),
              const Text('vs last month', style: TextStyle(fontSize: 10, color: Color(0xFF66789C))),
            ],
          ),
        ],
      ),
    );
  }
}
