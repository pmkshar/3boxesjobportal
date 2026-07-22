import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class CvManagerScreen extends StatefulWidget {
  const CvManagerScreen({super.key});

  @override
  State<CvManagerScreen> createState() => _CvManagerScreenState();
}

class _CvManagerScreenState extends State<CvManagerScreen> {
  List<dynamic> _resumes = [];
  bool _loading = true;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final resumes = await ApiService.getResumes();
    _user = await ApiService.getStoredUser();
    setState(() {
      _resumes = resumes;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('CV Manager', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.description, color: Colors.white, size: 32),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('CV Manager', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                              Text('${_resumes.length} resume(s) on file', style: const TextStyle(color: Color(0xFFBFDBFE), fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Resume Builder Section
                  const Text('Resume Builder', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE4E8EC)),
                    ),
                    child: Column(
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.auto_awesome, color: Color(0xFF3B82F6), size: 24),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('AI Resume Builder', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
                                  Text('Let AI craft a professional resume based on your profile', style: TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 42,
                          child: ElevatedButton.icon(
                            onPressed: () => _showResumeBuilder(context),
                            icon: const Icon(Icons.auto_awesome, size: 18),
                            label: const Text('Build with AI'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Quick Templates
                  const Text('Quick Templates', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _templateCard('Professional', Icons.work, const Color(0xFF059669)),
                      const SizedBox(width: 12),
                      _templateCard('Creative', Icons.palette, const Color(0xFF8B5CF6)),
                      const SizedBox(width: 12),
                      _templateCard('Technical', Icons.code, const Color(0xFF3B82F6)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // My Resumes
                  const Text('My Resumes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                  const SizedBox(height: 12),
                  if (_resumes.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.description_outlined, size: 48, color: Colors.grey.shade300),
                          const SizedBox(height: 12),
                          const Text('No resumes yet', style: TextStyle(fontSize: 14, color: Color(0xFF66789C))),
                          const SizedBox(height: 4),
                          const Text('Use the AI builder or upload one', style: TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                        ],
                      ),
                    )
                  else
                    ..._resumes.map((resume) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.description, color: Color(0xFF3B82F6)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(resume['name'] ?? resume['fileName'] ?? 'Resume', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
                                Text(resume['uploadedAt'] ?? 'Recently uploaded', style: const TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                              ],
                            ),
                          ),
                          const Icon(Icons.more_vert, color: Color(0xFF66789C)),
                        ],
                      ),
                    )),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showResumeBuilder(context),
        backgroundColor: const Color(0xFF3B82F6),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _templateCard(String name, IconData icon, Color color) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _showResumeBuilder(context),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(name, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
            ],
          ),
        ),
      ),
    );
  }

  void _showResumeBuilder(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const _ResumeBuilderScreen(),
      ),
    );
  }
}

class _ResumeBuilderScreen extends StatefulWidget {
  const _ResumeBuilderScreen();

  @override
  State<_ResumeBuilderScreen> createState() => _ResumeBuilderScreenState();
}

class _ResumeBuilderScreenState extends State<_ResumeBuilderScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _summaryController = TextEditingController();
  final _experienceController = TextEditingController();
  final _skillsController = TextEditingController();
  final _educationController = TextEditingController();
  bool _generating = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final user = await ApiService.getStoredUser();
    if (user != null) {
      _nameController.text = user['name'] ?? '';
      _emailController.text = user['email'] ?? '';
    }
  }

  Future<void> _generateWithAI() async {
    setState(() => _generating = true);
    // Simulate AI generation
    await Future.delayed(const Duration(seconds: 2));
    _summaryController.text = 'Results-driven professional with ${_experienceController.text.isNotEmpty ? _experienceController.text : "5+"} years of experience. Proven track record of delivering high-impact solutions and driving team success. Strong expertise in ${_skillsController.text.isNotEmpty ? _skillsController.text : "multiple technologies"} with a focus on innovation and continuous improvement.';
    setState(() => _generating = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _summaryController.dispose();
    _experienceController.dispose();
    _skillsController.dispose();
    _educationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Resume Builder', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // AI Generate button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: _generating ? null : _generateWithAI,
                icon: _generating
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF3B82F6)))
                    : const Icon(Icons.auto_awesome, color: Color(0xFF3B82F6)),
                label: Text(_generating ? 'Generating with AI...' : 'Auto-fill with AI', style: const TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w600)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF3B82F6)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            _sectionTitle('Personal Information'),
            _textField(_nameController, 'Full Name', Icons.person_outline),
            const SizedBox(height: 12),
            _textField(_emailController, 'Email', Icons.email_outlined),
            const SizedBox(height: 12),
            _textField(_phoneController, 'Phone', Icons.phone_outlined),
            const SizedBox(height: 20),

            _sectionTitle('Professional Summary'),
            _textField(_summaryController, 'Brief professional summary...', null, maxLines: 4),
            const SizedBox(height: 20),

            _sectionTitle('Experience'),
            _textField(_experienceController, 'Years of experience', Icons.work_outline),
            const SizedBox(height: 20),

            _sectionTitle('Skills'),
            _textField(_skillsController, 'e.g., React, Python, Project Management', Icons.psychology_outlined, maxLines: 3),
            const SizedBox(height: 20),

            _sectionTitle('Education'),
            _textField(_educationController, 'Degree, University, Year', Icons.school_outlined, maxLines: 2),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Resume saved successfully!'), backgroundColor: Color(0xFF059669)),
                  );
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Save Resume', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
    );
  }

  Widget _textField(TextEditingController controller, String hint, IconData? icon, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: icon != null ? Icon(icon, color: const Color(0xFF66789C), size: 20) : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }
}
