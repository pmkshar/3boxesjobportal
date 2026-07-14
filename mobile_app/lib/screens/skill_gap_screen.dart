import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class SkillGapScreen extends StatefulWidget {
  const SkillGapScreen({super.key});

  @override
  State<SkillGapScreen> createState() => _SkillGapScreenState();
}

class _SkillGapScreenState extends State<SkillGapScreen> {
  List<dynamic> _skills = [];
  Map<String, dynamic>? _user;
  bool _loading = true;
  String _targetRole = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    _user = await ApiService.getStoredUser();
    final skills = await ApiService.getSkills();
    setState(() {
      _skills = skills;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Skill Gap Analysis', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.track_changes_outlined, color: Colors.white, size: 28),
                            SizedBox(width: 12),
                            Text('Skill Gap Analysis', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        SizedBox(height: 12),
                        Text(
                          'Identify skills you need to develop for your target role. Compare your current skills against industry requirements.',
                          style: TextStyle(fontSize: 13, color: Color(0xFFFDE68A)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Target Role Input
                  const Text('Target Role', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 8),
                  TextField(
                    onChanged: (v) => setState(() => _targetRole = v),
                    decoration: InputDecoration(
                      hintText: 'e.g., Senior Software Engineer',
                      prefixIcon: const Icon(Icons.work_outline, color: Color(0xFFF59E0B), size: 20),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Analyze button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => setState(() {}),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Analyze Skill Gap', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Skill Categories
                  const Text('Your Skills Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 12),
                  ..._buildSkillCategories(),
                  const SizedBox(height: 20),

                  // Recommended Skills
                  const Text('Recommended Skills to Develop', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 12),
                  ..._buildRecommendedSkills(),
                ],
              ),
            ),
    );
  }

  List<Widget> _buildSkillCategories() {
    final categories = [
      {'name': 'Programming', 'level': 0.85, 'color': const Color(0xFF059669)},
      {'name': 'Communication', 'level': 0.7, 'color': const Color(0xFF3B82F6)},
      {'name': 'Leadership', 'level': 0.55, 'color': const Color(0xFF8B5CF6)},
      {'name': 'Problem Solving', 'level': 0.8, 'color': const Color(0xFF06B6D4)},
      {'name': 'Project Management', 'level': 0.6, 'color': const Color(0xFFF59E0B)},
    ];
    return categories.map((cat) => Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E8EC)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(cat['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E), fontSize: 13)),
              Text('${((cat['level'] as double) * 100).round()}%', style: TextStyle(fontWeight: FontWeight.w600, color: cat['color'] as Color, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: cat['level'] as double,
              minHeight: 6,
              backgroundColor: const Color(0xFFE4E8EC),
              valueColor: AlwaysStoppedAnimation<Color>(cat['color'] as Color),
            ),
          ),
        ],
      ),
    )).toList();
  }

  List<Widget> _buildRecommendedSkills() {
    final recommended = [
      {'skill': 'System Design', 'reason': 'Essential for senior roles', 'priority': 'High', 'color': const Color(0xFFEF4444)},
      {'skill': 'Cloud Architecture', 'reason': 'In-demand across industries', 'priority': 'High', 'color': const Color(0xFFEF4444)},
      {'skill': 'Team Leadership', 'reason': 'Required for management track', 'priority': 'Medium', 'color': const Color(0xFFF59E0B)},
      {'skill': 'Data Analysis', 'reason': 'Growing importance in all roles', 'priority': 'Medium', 'color': const Color(0xFFF59E0B)},
      {'skill': 'DevOps Practices', 'reason': 'Complementary to development skills', 'priority': 'Low', 'color': const Color(0xFF059669)},
    ];
    return recommended.map((rec) => Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4E8EC)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: (rec['color'] as Color).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.trending_up, color: rec['color'] as Color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(rec['skill'] as String, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E), fontSize: 14)),
                Text(rec['reason'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF66789C))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: (rec['color'] as Color).withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(rec['priority'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: rec['color'] as Color)),
          ),
        ],
      ),
    )).toList();
  }
}
