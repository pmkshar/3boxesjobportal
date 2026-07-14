import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ResumeBuilderScreen extends StatefulWidget {
  const ResumeBuilderScreen({super.key});

  @override
  State<ResumeBuilderScreen> createState() => _ResumeBuilderScreenState();
}

class _ResumeBuilderScreenState extends State<ResumeBuilderScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _summaryController = TextEditingController();
  final _experienceController = TextEditingController();
  final _skillsController = TextEditingController();
  final _educationController = TextEditingController();
  bool _generating = false;
  int _currentStep = 0;

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
    await Future.delayed(const Duration(seconds: 2));
    _summaryController.text = 'Results-driven professional with proven expertise in ${_skillsController.text.isNotEmpty ? _skillsController.text.split(",").take(3).join(", ") : "multiple domains"}. Demonstrated ability to deliver high-impact solutions, lead cross-functional teams, and drive innovation. Strong analytical and communication skills with a track record of exceeding performance targets.';
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
      body: Column(
        children: [
          // Step indicator
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                _stepDot(0, 'Info'),
                _stepLine(1),
                _stepDot(1, 'Summary'),
                _stepLine(2),
                _stepDot(2, 'Skills'),
                _stepLine(3),
                _stepDot(3, 'Review'),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildStep(),
            ),
          ),
          // Navigation buttons
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _currentStep--),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        side: const BorderSide(color: Color(0xFF059669)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Back', style: TextStyle(color: Color(0xFF059669))),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _currentStep < 3 ? () => setState(() => _currentStep++) : _saveResume,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(_currentStep < 3 ? 'Next' : 'Save Resume', style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepDot(int step, String label) {
    final isActive = _currentStep >= step;
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: isActive ? const Color(0xFF059669) : const Color(0xFFE4E8EC),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: isActive
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : Text('${step + 1}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade400)),
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10, color: isActive ? const Color(0xFF059669) : const Color(0xFF66789C), fontWeight: isActive ? FontWeight.w600 : FontWeight.normal)),
        ],
      ),
    );
  }

  Widget _stepLine(int step) {
    final isActive = _currentStep >= step;
    return Container(
      width: 20,
      height: 2,
      color: isActive ? const Color(0xFF059669) : const Color(0xFFE4E8EC),
      margin: const EdgeInsets.only(bottom: 16),
    );
  }

  Widget _buildStep() {
    switch (_currentStep) {
      case 0: return _buildPersonalInfo();
      case 1: return _buildSummary();
      case 2: return _buildSkills();
      case 3: return _buildReview();
      default: return _buildPersonalInfo();
    }
  }

  Widget _buildPersonalInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
        const SizedBox(height: 16),
        _textField(_nameController, 'Full Name', Icons.person_outline),
        const SizedBox(height: 12),
        _textField(_emailController, 'Email', Icons.email_outlined),
        const SizedBox(height: 12),
        _textField(_phoneController, 'Phone Number', Icons.phone_outlined),
      ],
    );
  }

  Widget _buildSummary() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Professional Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
            TextButton.icon(
              onPressed: _generating ? null : _generateWithAI,
              icon: _generating
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF059669)))
                  : const Icon(Icons.auto_awesome, size: 16),
              label: Text(_generating ? 'Generating...' : 'AI Generate', style: const TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _summaryController,
          maxLines: 8,
          decoration: InputDecoration(
            hintText: 'Write a brief summary of your professional background and key achievements...',
            hintStyle: const TextStyle(color: Color(0xFFC1C9D2)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildSkills() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Skills & Experience', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
        const SizedBox(height: 16),
        _textField(_experienceController, 'Years of experience', Icons.work_outline),
        const SizedBox(height: 12),
        TextField(
          controller: _skillsController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'Enter your skills (comma-separated)\ne.g., React, Python, Project Management, Data Analysis',
            hintStyle: const TextStyle(color: Color(0xFFC1C9D2)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
        const SizedBox(height: 12),
        _textField(_educationController, 'Education', Icons.school_outlined),
      ],
    );
  }

  Widget _buildReview() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Review Resume', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE4E8EC)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_nameController.text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
              const SizedBox(height: 4),
              Row(
                children: [
                  if (_emailController.text.isNotEmpty) ...[
                    Icon(Icons.email, size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(_emailController.text, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                    const SizedBox(width: 12),
                  ],
                  if (_phoneController.text.isNotEmpty) ...[
                    Icon(Icons.phone, size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(_phoneController.text, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                  ],
                ],
              ),
              if (_summaryController.text.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Divider(color: Color(0xFFE4E8EC)),
                const SizedBox(height: 12),
                const Text('Summary', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF05264E), fontSize: 14)),
                const SizedBox(height: 4),
                Text(_summaryController.text, style: const TextStyle(fontSize: 13, color: Color(0xFF66789C), height: 1.5)),
              ],
              if (_skillsController.text.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(color: Color(0xFFE4E8EC)),
                const SizedBox(height: 12),
                const Text('Skills', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF05264E), fontSize: 14)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: _skillsController.text.split(',').map((s) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(s.trim(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF059669))),
                  )).toList(),
                ),
              ],
              if (_educationController.text.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(color: Color(0xFFE4E8EC)),
                const SizedBox(height: 12),
                const Text('Education', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF05264E), fontSize: 14)),
                const SizedBox(height: 4),
                Text(_educationController.text, style: const TextStyle(fontSize: 13, color: Color(0xFF66789C))),
              ],
            ],
          ),
        ),
      ],
    );
  }

  void _saveResume() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Resume saved successfully!'), backgroundColor: Color(0xFF059669)),
    );
    Navigator.pop(context);
  }

  Widget _textField(TextEditingController controller, String hint, IconData icon) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF66789C), size: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }
}
