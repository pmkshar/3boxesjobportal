import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:cached_network_image/cached_network_image.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _user;
  bool _loading = true;
  Map<String, dynamic>? _stats;

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
          color: const Color(0xFF014217),
          child: CustomScrollView(
            slivers: [
              // App Bar with logo and hero image
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF014217), Color(0xFF066722)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(24),
                      bottomRight: Radius.circular(24),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Top bar with logo
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Image.asset(
                              'assets/images/logo.png',
                              height: 50,
                              fit: BoxFit.contain,
                            ),
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: Colors.white.withOpacity(0.15),
                              child: Text(
                                _user?['name']?.substring(0, 1).toUpperCase() ?? 'U',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Welcome section with HR image
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome back, ${_user?['name']?.split(' ').first ?? 'User'}! 👋',
                                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    "Here's what's happening with your career",
                                    style: TextStyle(color: Color(0xFF86efac), fontSize: 13),
                                  ),
                                  const SizedBox(height: 16),
                                  // Quick stats
                                  Row(
                                    children: [
                                      _MiniStat(Icons.assignment_outlined, '${_stats?['totalApplications'] ?? 0}', 'Applied'),
                                      const SizedBox(width: 16),
                                      _MiniStat(Icons.computer, '${_stats?['interviewsCompleted'] ?? 0}', 'Interviews'),
                                      const SizedBox(width: 16),
                                      _MiniStat(Icons.school, '${_stats?['trainingsCompleted'] ?? 0}', 'Training'),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            // HR Professional image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: CachedNetworkImage(
                                imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=250&fit=crop&crop=face',
                                width: 100,
                                height: 140,
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(
                                  width: 100, height: 140,
                                  color: Colors.white10,
                                  child: const Icon(Icons.person, color: Colors.white30, size: 40),
                                ),
                                errorWidget: (_, __, ___) => Container(
                                  width: 100, height: 140,
                                  color: Colors.white10,
                                  child: const Icon(Icons.person, color: Colors.white30, size: 40),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Quick Access Features
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: const Text(
                    'Quick Access',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E)),
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
                      _QuickCard(Icons.psychology, 'AI Interview', const Color(0xFF014217)),
                      _QuickCard(Icons.description, 'CV Manager', const Color(0xFF066722)),
                      _QuickCard(Icons.assignment, 'Tracker', const Color(0xFF04a331)),
                      _QuickCard(Icons.smart_toy, 'AI Buddy', const Color(0xFF014217)),
                      _QuickCard(Icons.track_changes_outlined, 'Skill Gap', const Color(0xFFF26405)),
                      _QuickCard(Icons.work_outline, 'Job Fit', const Color(0xFF04a331)),
                      _QuickCard(Icons.school, 'Training', const Color(0xFF066722)),
                      _QuickCard(Icons.bar_chart, 'Analytics', const Color(0xFFF26405)),
                    ],
                  ),
                ),
              ),

              // Stats
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: const Text(
                    'Your Stats',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E)),
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
                    _StatCard('Applications', '${_stats?['totalApplications'] ?? 0}', '+5%', true, Icons.assignment_outlined, const Color(0xFF014217)),
                    _StatCard('Interviews', '${_stats?['interviewsCompleted'] ?? 0}', '+25%', true, Icons.computer, const Color(0xFF066722)),
                    _StatCard('Profile Views', '165', '+15%', true, Icons.visibility, const Color(0xFF04a331)),
                    _StatCard('Trainings', '${_stats?['trainingsCompleted'] ?? 0}', '+12%', true, Icons.school, const Color(0xFFF26405)),
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

  Widget _MiniStat(IconData icon, String value, String label) {
    return Column(
      children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF86efac), size: 20),
        ),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Color(0xFF86efac), fontSize: 10)),
      ],
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
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(isUp ? Icons.trending_up : Icons.trending_down, size: 14, color: isUp ? const Color(0xFF04a331) : Colors.red),
              Text(change, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: isUp ? const Color(0xFF04a331) : Colors.red)),
              const SizedBox(width: 4),
              const Text('vs last month', style: TextStyle(fontSize: 10, color: Color(0xFF66789C))),
            ],
          ),
        ],
      ),
    );
  }
}
