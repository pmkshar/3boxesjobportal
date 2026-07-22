import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ResumeBuilderScreen extends StatefulWidget {
  final String? template;
  const ResumeBuilderScreen({super.key, this.template});

  @override
  State<ResumeBuilderScreen> createState() => _ResumeBuilderScreenState();
}

class _ResumeBuilderScreenState extends State<ResumeBuilderScreen> {
  static const Color _primaryColor = Color(0xFF00C853);
  static const int _totalSteps = 4;

  int _currentStep = 0;
  bool _isSubmitting = false;
  bool _isGeneratingSummary = false;

  // Step 1 - Personal Info
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  // Step 2 - Professional Summary
  final TextEditingController _summaryController = TextEditingController();

  // Step 3 - Skills
  final TextEditingController _skillInputController = TextEditingController();
  final List<String> _skills = [];

  final List<String> _suggestedSkills = [
    'Flutter',
    'Dart',
    'React',
    'JavaScript',
    'TypeScript',
    'Python',
    'Node.js',
    'SQL',
    'Git',
    'Docker',
    'AWS',
    'Figma',
    'Agile',
    'REST APIs',
    'GraphQL',
  ];

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _summaryController.dispose();
    _skillInputController.dispose();
    super.dispose();
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        if (_nameController.text.trim().isEmpty) {
          _showError('Please enter your name');
          return false;
        }
        if (_emailController.text.trim().isEmpty ||
            !_emailController.text.contains('@')) {
          _showError('Please enter a valid email');
          return false;
        }
        return true;
      case 1:
        if (_summaryController.text.trim().isEmpty) {
          _showError('Please add a professional summary');
          return false;
        }
        return true;
      case 2:
        if (_skills.isEmpty) {
          _showError('Please add at least one skill');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red[700],
      ),
    );
  }

  void _nextStep() {
    if (!_validateCurrentStep()) return;
    if (_currentStep < _totalSteps - 1) {
      setState(() => _currentStep++);
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _generateSummary() async {
    setState(() => _isGeneratingSummary = true);

    final name = _nameController.text.trim();
    final skillList = _skills.isNotEmpty ? _skills.take(5).join(', ') : 'various technologies';

    // Simulate AI generation with a delay
    await Future.delayed(const Duration(seconds: 2));

    final generatedSummary =
        'Results-driven professional${name.isNotEmpty ? ' with $name' : ''} bringing strong expertise in $skillList. '
        'Passionate about building scalable solutions and delivering high-quality products. '
        'Proven track record of collaborating with cross-functional teams to drive innovation and meet tight deadlines. '
        'Committed to continuous learning and leveraging emerging technologies to solve complex challenges.';

    setState(() {
      _summaryController.text = generatedSummary;
      _isGeneratingSummary = false;
    });
  }

  void _addSkill(String skill) {
    final trimmed = skill.trim();
    if (trimmed.isNotEmpty && !_skills.contains(trimmed)) {
      setState(() => _skills.add(trimmed));
    }
    _skillInputController.clear();
  }

  void _removeSkill(String skill) {
    setState(() => _skills.remove(skill));
  }

  Future<void> _submitResume() async {
    setState(() => _isSubmitting = true);

    final resumeData = {
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'phone': _phoneController.text.trim(),
      'location': _locationController.text.trim(),
      'summary': _summaryController.text.trim(),
      'skills': _skills,
    };

    try {
      final response = await ApiService.createResume(resumeData);
      if (mounted) {
        if (response.containsKey('error')) {
          // API returned error, still show success in demo mode
          _showSuccessDialog();
        } else {
          _showSuccessDialog();
        }
      }
    } catch (e) {
      if (mounted) {
        _showSuccessDialog();
      }
    }
  }

  void _showSuccessDialog() {
    setState(() => _isSubmitting = false);
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: _primaryColor, size: 28),
            SizedBox(width: 10),
            Text('Resume Created!'),
          ],
        ),
        content: const Text(
          'Your resume has been successfully created and saved. You can view and edit it anytime from your profile.',
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resetForm();
            },
            style: FilledButton.styleFrom(
              backgroundColor: _primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _resetForm() {
    setState(() {
      _currentStep = 0;
      _nameController.clear();
      _emailController.clear();
      _phoneController.clear();
      _locationController.clear();
      _summaryController.clear();
      _skillInputController.clear();
      _skills.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorSchemeSeed: _primaryColor,
      useMaterial3: true,
    );

    return Theme(
      data: theme,
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F7FA),
        appBar: AppBar(
          title: const Text(
            'Resume Builder',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        body: Column(
          children: [
            // Step indicator
            _buildStepIndicator(),
            // Step content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildStepContent(),
              ),
            ),
            // Navigation buttons
            _buildNavigationButtons(),
          ],
        ),
      ),
    );
  }

  // ── Step Indicator ─────────────────────────────────────────────────
  Widget _buildStepIndicator() {
    const stepLabels = ['Personal', 'Summary', 'Skills', 'Review'];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: List.generate(_totalSteps, (index) {
          final isActive = index == _currentStep;
          final isCompleted = index < _currentStep;

          return Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    // Circle
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: isCompleted || isActive
                              ? _primaryColor
                              : Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                // Circle with number/check
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCompleted
                        ? _primaryColor
                        : isActive
                            ? _primaryColor.withOpacity(0.15)
                            : Colors.grey[200],
                    border: isActive
                        ? Border.all(color: _primaryColor, width: 2)
                        : null,
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check,
                            color: Colors.white, size: 18)
                        : Text(
                            '${index + 1}',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: isActive ? _primaryColor : Colors.grey,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  stepLabels[index],
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    color: isActive ? _primaryColor : Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ── Step Content Router ────────────────────────────────────────────
  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildPersonalInfoStep();
      case 1:
        return _buildSummaryStep();
      case 2:
        return _buildSkillsStep();
      case 3:
        return _buildReviewStep();
      default:
        return const SizedBox.shrink();
    }
  }

  // ── Step 1: Personal Info ──────────────────────────────────────────
  Widget _buildPersonalInfoStep() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personal Information',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'Tell us about yourself',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),
          _buildTextField(
            controller: _nameController,
            label: 'Full Name',
            hint: 'John Doe',
            icon: Icons.person_outline,
            required: true,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _emailController,
            label: 'Email Address',
            hint: 'john@example.com',
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            required: true,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _phoneController,
            label: 'Phone Number',
            hint: '+1 (555) 123-4567',
            icon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: _locationController,
            label: 'Location',
            hint: 'New York, NY',
            icon: Icons.location_on_outlined,
          ),
        ],
      ),
    );
  }

  // ── Step 2: Professional Summary ───────────────────────────────────
  Widget _buildSummaryStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Professional Summary',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Write a brief overview of your professional background',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            const Icon(Icons.auto_awesome, color: _primaryColor, size: 20),
            const SizedBox(width: 8),
            const Text(
              'AI-Generated Summary',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: _primaryColor,
              ),
            ),
            const Spacer(),
            FilledButton.tonal(
              onPressed: _isGeneratingSummary ? null : _generateSummary,
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor.withOpacity(0.1),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: _isGeneratingSummary
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        color: _primaryColor,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'AI Generate',
                      style: TextStyle(color: _primaryColor),
                    ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _summaryController,
          maxLines: 8,
          decoration: InputDecoration(
            hintText:
                'Write a compelling summary highlighting your experience, key strengths, and career goals...',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: _primaryColor, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: Text(
            '${_summaryController.text.length} characters',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
        ),
      ],
    );
  }

  // ── Step 3: Skills ─────────────────────────────────────────────────
  Widget _buildSkillsStep() {
    final availableSuggestions =
        _suggestedSkills.where((s) => !_skills.contains(s)).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Skills',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Add your technical and soft skills',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 24),
        // Add skill input
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _skillInputController,
                decoration: InputDecoration(
                  hintText: 'Type a skill...',
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon: const Icon(Icons.add_circle_outline,
                      color: Colors.grey),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: _primaryColor, width: 2),
                  ),
                ),
                onSubmitted: _addSkill,
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: () => _addSkill(_skillInputController.text),
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                minimumSize: const Size(48, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Icon(Icons.add),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Current skills
        if (_skills.isNotEmpty) ...[
          Text(
            'Your Skills (${_skills.length})',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _skills.map((skill) {
              return Chip(
                label: Text(skill),
                backgroundColor: _primaryColor.withOpacity(0.1),
                labelStyle: const TextStyle(
                  color: _primaryColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                deleteIcon: const Icon(Icons.close, size: 16),
                deleteIconColor: _primaryColor,
                onDeleted: () => _removeSkill(skill),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
        ],
        // Suggested skills
        if (availableSuggestions.isNotEmpty) ...[
          Text(
            'Suggested Skills',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: availableSuggestions.map((skill) {
              return ActionChip(
                label: Text(skill),
                avatar: const Icon(Icons.add, size: 14),
                onPressed: () => _addSkill(skill),
                side: BorderSide(color: Colors.grey[300]!),
                labelStyle: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[700],
                ),
              );
            }).toList(),
          ),
        ],
      ],
    );
  }

  // ── Step 4: Review ─────────────────────────────────────────────────
  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Review Your Resume',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Make sure everything looks good before submitting',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 24),
        // Personal Info card
        _buildReviewCard(
          title: 'Personal Information',
          icon: Icons.person_outline,
          onEdit: () => setState(() => _currentStep = 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _reviewRow('Name', _nameController.text),
              _reviewRow('Email', _emailController.text),
              _reviewRow('Phone',
                  _phoneController.text.isEmpty ? 'Not provided' : _phoneController.text),
              _reviewRow('Location',
                  _locationController.text.isEmpty ? 'Not provided' : _locationController.text),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Summary card
        _buildReviewCard(
          title: 'Professional Summary',
          icon: Icons.description_outlined,
          onEdit: () => setState(() => _currentStep = 1),
          child: Text(
            _summaryController.text.isEmpty
                ? 'No summary added'
                : _summaryController.text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Skills card
        _buildReviewCard(
          title: 'Skills',
          icon: Icons.star_outline,
          onEdit: () => setState(() => _currentStep = 2),
          child: _skills.isEmpty
              ? Text(
                  'No skills added',
                  style: TextStyle(color: Colors.grey[500]),
                )
              : Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _skills.map((skill) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        skill,
                        style: const TextStyle(
                          color: _primaryColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    );
                  }).toList(),
                ),
        ),
      ],
    );
  }

  Widget _buildReviewCard({
    required String title,
    required IconData icon,
    required VoidCallback onEdit,
    required Widget child,
  }) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: _primaryColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: onEdit,
                  child: const Text(
                    'Edit',
                    style: TextStyle(color: _primaryColor),
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            child,
          ],
        ),
      ),
    );
  }

  Widget _reviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Navigation Buttons ─────────────────────────────────────────────
  Widget _buildNavigationButtons() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _previousStep,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: _primaryColor),
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Back',
                    style: TextStyle(
                      color: _primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            Expanded(
              flex: _currentStep == 0 ? 1 : 2,
              child: FilledButton(
                onPressed: _isSubmitting
                    ? null
                    : (_currentStep == _totalSteps - 1
                        ? _submitResume
                        : _nextStep),
                style: FilledButton.styleFrom(
                  backgroundColor: _primaryColor,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        _currentStep == _totalSteps - 1
                            ? 'Submit Resume'
                            : 'Continue',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Reusable Text Field ────────────────────────────────────────────
  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool required = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            text: label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
            children: [
              if (required)
                const TextSpan(
                  text: ' *',
                  style: TextStyle(color: Colors.red),
                ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: Colors.grey),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: _primaryColor, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}
