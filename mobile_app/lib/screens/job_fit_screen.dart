import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class JobFitScreen extends StatefulWidget {
  const JobFitScreen({super.key});

  @override
  State<JobFitScreen> createState() => _JobFitScreenState();
}

class _JobFitScreenState extends State<JobFitScreen> {
  List<dynamic> _jobs = [];
  bool _loading = true;
  Map<String, dynamic>? _user;
  String? _selectedJobId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    _user = await ApiService.getStoredUser();
    final jobs = await ApiService.getJobs();
    setState(() {
      _jobs = jobs;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Job Fit Evaluation', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF14B8A6)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF0D9488)]),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.work_outline, color: Colors.white, size: 28),
                            SizedBox(width: 12),
                            Text('Job Fit Evaluation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        SizedBox(height: 12),
                        Text(
                          'Discover how well your skills match specific job requirements. Get a detailed compatibility score and actionable insights.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF99F6E4)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Select a Job
                  const Text('Select a Job to Evaluate', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE4E8EC)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        hint: const Text('Choose a job...'),
                        value: _selectedJobId,
                        items: _jobs.map((job) => DropdownMenuItem<String>(
                          value: job['id']?.toString(),
                          child: Text(job['title'] ?? 'Untitled', style: const TextStyle(fontSize: 14)),
                        )).toList(),
                        onChanged: (v) => setState(() => _selectedJobId = v),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Evaluate button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _selectedJobId != null ? () {} : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF14B8A6),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Evaluate Job Fit', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Sample Results
                  if (_selectedJobId != null) ...[
                    const Text('Compatibility Score', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Column(
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 120,
                                height: 120,
                                child: CircularProgressIndicator(
                                  value: 0.78,
                                  strokeWidth: 10,
                                  backgroundColor: const Color(0xFFE4E8EC),
                                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF14B8A6)),
                                ),
                              ),
                              Column(
                                children: [
                                  const Text('78%', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF14B8A6))),
                                  const Text('Match', style: TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text('Good Match!', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                          const SizedBox(height: 4),
                          const Text('Your skills align well with this role', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Skill Breakdown
                    const Text('Skill Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    ..._buildSkillBreakdown(),
                    const SizedBox(height: 20),

                    // Recommendations
                    const Text('Recommendations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDFA),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF99F6E4)),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('To improve your match score:', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF14B8A6), fontSize: 13)),
                          SizedBox(height: 8),
                          Text('1. Develop cloud architecture skills (AWS/GCP)', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
                          Text('2. Gain experience with system design patterns', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
                          Text('3. Highlight leadership experience in your resume', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  List<Widget> _buildSkillBreakdown() {
    final skills = [
      {'name': 'Technical Skills', 'match': 0.85, 'color': const Color(0xFF059669)},
      {'name': 'Experience Level', 'match': 0.7, 'color': const Color(0xFF3B82F6)},
      {'name': 'Soft Skills', 'match': 0.9, 'color': const Color(0xFF8B5CF6)},
      {'name': 'Domain Knowledge', 'match': 0.65, 'color': const Color(0xFFF59E0B)},
      {'name': 'Culture Fit', 'match': 0.8, 'color': const Color(0xFF14B8A6)},
    ];
    return skills.map((skill) => Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
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
              Text(skill['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E), fontSize: 13)),
              Text('${((skill['match'] as double) * 100).round()}%', style: TextStyle(fontWeight: FontWeight.w600, color: skill['color'] as Color, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: skill['match'] as double,
              minHeight: 4,
              backgroundColor: const Color(0xFFE4E8EC),
              valueColor: AlwaysStoppedAnimation<Color>(skill['color'] as Color),
            ),
          ),
        ],
      ),
    )).toList();
  }
}
