import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  Map<String, dynamic>? _analytics;
  Map<String, dynamic>? _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    _user = await ApiService.getStoredUser();
    final data = await ApiService.getAnalytics(userId: _user?['id']?.toString());
    setState(() {
      _analytics = data?['summary'];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Analytics', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFF97316), Color(0xFFEA580C)]),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.bar_chart, color: Colors.white, size: 28),
                              SizedBox(width: 12),
                              Text('Your Analytics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                            ],
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Track your career progress, application success rate, and skill development over time.',
                            style: TextStyle(fontSize: 13, color: Color(0xFFFED7AA)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Key Metrics
                    const Text('Key Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.3,
                      children: [
                        _MetricCard(
                          title: 'Applications',
                          value: '${_analytics?['totalApplications'] ?? 0}',
                          change: '+12%',
                          icon: Icons.assignment_outlined,
                          color: const Color(0xFF059669),
                        ),
                        _MetricCard(
                          title: 'Interviews',
                          value: '${_analytics?['interviewsCompleted'] ?? 0}',
                          change: '+25%',
                          icon: Icons.computer,
                          color: const Color(0xFF8B5CF6),
                        ),
                        _MetricCard(
                          title: 'Profile Views',
                          value: '${_analytics?['profileViews'] ?? 165}',
                          change: '+15%',
                          icon: Icons.visibility,
                          color: const Color(0xFF06B6D4),
                        ),
                        _MetricCard(
                          title: 'Trainings',
                          value: '${_analytics?['trainingsCompleted'] ?? 0}',
                          change: '+8%',
                          icon: Icons.school,
                          color: const Color(0xFFF59E0B),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Application Success Rate
                    const Text('Application Success Rate', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _ringStat('Applied', 24, const Color(0xFF3B82F6)),
                              _ringStat('Shortlisted', 12, const Color(0xFF8B5CF6)),
                              _ringStat('Interviewed', 8, const Color(0xFF06B6D4)),
                              _ringStat('Offered', 3, const Color(0xFF059669)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: Color(0xFFE4E8EC)),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Success Rate', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
                              const Text('12.5%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Weekly Activity
                    const Text('Weekly Activity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              _barDay('Mon', 0.6),
                              _barDay('Tue', 0.8),
                              _barDay('Wed', 0.4),
                              _barDay('Thu', 0.9),
                              _barDay('Fri', 0.7),
                              _barDay('Sat', 0.3),
                              _barDay('Sun', 0.2),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Top Skills
                    const Text('Top Performing Skills', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    ...['React & TypeScript', 'Python', 'Problem Solving', 'Communication'].asMap().entries.map((entry) {
                      final colors = [const Color(0xFF059669), const Color(0xFF3B82F6), const Color(0xFF8B5CF6), const Color(0xFFF59E0B)];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE4E8EC)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: colors[entry.key].withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text('${entry.key + 1}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: colors[entry.key])),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Text(entry.value, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E), fontSize: 14))),
                            Icon(Icons.trending_up, size: 16, color: colors[entry.key]),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _ringStat(String label, int count, Color color) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 48,
              height: 48,
              child: CircularProgressIndicator(
                value: count / 24,
                strokeWidth: 4,
                backgroundColor: const Color(0xFFE4E8EC),
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
            Text('$count', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 9, color: Color(0xFF66789C))),
      ],
    );
  }

  Widget _barDay(String day, double value) {
    return Column(
      children: [
        Container(
          width: 28,
          height: 80,
          decoration: BoxDecoration(
            color: const Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: 28,
              height: (80 * value).clamp(4, 80),
              decoration: BoxDecoration(
                color: const Color(0xFFF97316),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(day, style: const TextStyle(fontSize: 10, color: Color(0xFF66789C))),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String change;
  final IconData icon;
  final Color color;

  const _MetricCard({required this.title, required this.value, required this.change, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
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
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
          Row(
            children: [
              const Icon(Icons.trending_up, size: 12, color: Colors.green),
              Text(change, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.green)),
            ],
          ),
        ],
      ),
    );
  }
}
