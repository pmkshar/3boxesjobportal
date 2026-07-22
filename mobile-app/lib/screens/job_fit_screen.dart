import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class JobFitScreen extends StatefulWidget {
  const JobFitScreen({super.key});

  @override
  State<JobFitScreen> createState() => _JobFitScreenState();
}

class _JobFitScreenState extends State<JobFitScreen> with TickerProviderStateMixin {
  String? _selectedJobId;
  bool _isEvaluating = false;
  bool _hasEvaluated = false;
  late AnimationController _scoreController;
  late Animation<double> _scoreAnimation;

  static const Color _primaryGreen = Color(0xFF00C853);

  // Demo jobs for dropdown
  static const List<Map<String, String>> _demoJobs = [
    {'id': '1', 'title': 'Senior React Developer'},
    {'id': '2', 'title': 'Full-Stack Engineer'},
    {'id': '3', 'title': 'Python Backend Developer'},
    {'id': '4', 'title': 'DevOps Engineer'},
    {'id': '5', 'title': 'Frontend Lead'},
  ];

  // Demo evaluation result for "Senior React Developer" at 78%
  static const Map<String, dynamic> _demoEvaluation = {
    'jobTitle': 'Senior React Developer',
    'overallScore': 78,
    'matchingSkills': [
      {'name': 'React', 'proficiency': 95},
      {'name': 'TypeScript', 'proficiency': 88},
      {'name': 'JavaScript', 'proficiency': 92},
      {'name': 'Redux', 'proficiency': 80},
    ],
    'missingSkills': [
      {'name': 'Next.js', 'importance': 'High'},
      {'name': 'Testing (Jest/Cypress)', 'importance': 'Medium'},
    ],
    'extraSkills': [
      {'name': 'Python', 'relevance': 'Low'},
      {'name': 'Docker', 'relevance': 'Medium'},
    ],
    'recommendations': [
      'Build 2-3 Next.js projects to demonstrate SSR/SSG proficiency',
      'Add comprehensive testing examples to your portfolio using Jest and Cypress',
      'Highlight your Redux experience – it maps well to state management patterns',
      'Consider contributing to open-source React libraries to strengthen your profile',
    ],
  };

  Map<String, dynamic> _evaluationResult = {};

  @override
  void initState() {
    super.initState();
    _scoreController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _scoreAnimation = const AlwaysStoppedAnimation(0.0);
  }

  @override
  void dispose() {
    _scoreController.dispose();
    super.dispose();
  }

  Future<void> _evaluateFit() async {
    if (_selectedJobId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a job first'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isEvaluating = true);

    try {
      final result = await ApiService.evaluateJobFit(_selectedJobId!);
      if (result.containsKey('error')) throw Exception('API error');
      _applyResult(result);
    } catch (_) {
      // Use demo data
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        _applyResult(Map<String, dynamic>.from(_demoEvaluation));
      }
    }
  }

  void _applyResult(Map<String, dynamic> result) {
    setState(() {
      _evaluationResult = result;
      _hasEvaluated = true;
      _isEvaluating = false;
    });

    // Animate the score
    _scoreAnimation = Tween<double>(begin: 0, end: (result['overallScore'] as int) / 100.0).animate(
      CurvedAnimation(parent: _scoreController, curve: Curves.easeOutCubic),
    );
    _scoreController.forward(from: 0);
  }

  Color _scoreColor(int score) {
    if (score >= 80) return _primaryGreen;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  String _scoreLabel(int score) {
    if (score >= 85) return 'Excellent Fit';
    if (score >= 70) return 'Good Fit';
    if (score >= 50) return 'Fair Fit';
    return 'Poor Fit';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Job Fit Evaluation'),
        backgroundColor: _primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isEvaluating
          ? _buildLoadingState()
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildJobSelector(theme),
                  const SizedBox(height: 24),
                  if (_hasEvaluated) ...[
                    _buildScoreSection(theme),
                    const SizedBox(height: 24),
                    _buildSkillBreakdown(theme),
                    const SizedBox(height: 24),
                    _buildRecommendations(theme),
                  ] else ...[
                    _buildPlaceholder(theme),
                  ],
                ],
              ),
            ),
      bottomNavigationBar: _buildEvaluateButton(),
    );
  }

  // ── Loading State ────────────────────────────────────────────────
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: _primaryGreen, strokeWidth: 3),
          const SizedBox(height: 20),
          Text('Evaluating job fit...',
              style: TextStyle(fontSize: 16, color: Colors.grey[600])),
          const SizedBox(height: 8),
          Text('Analyzing your skills against job requirements',
              style: TextStyle(fontSize: 13, color: Colors.grey[400])),
        ],
      ),
    );
  }

  // ── Job Selector ─────────────────────────────────────────────────
  Widget _buildJobSelector(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 22,
                  decoration: BoxDecoration(
                    color: _primaryGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                Text('Select a Job',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedJobId,
              decoration: InputDecoration(
                hintText: 'Choose a job position',
                hintStyle: TextStyle(color: Colors.grey[400]),
                prefixIcon: const Icon(Icons.work_outline, color: _primaryGreen),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: _primaryGreen, width: 1.5),
                ),
                filled: true,
                fillColor: const Color(0xFFF5F7FA),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              items: _demoJobs.map((job) {
                return DropdownMenuItem(
                  value: job['id'],
                  child: Text(job['title']!),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedJobId = value;
                  _hasEvaluated = false;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  // ── Placeholder ──────────────────────────────────────────────────
  Widget _buildPlaceholder(ThemeData theme) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            Icon(Icons.assessment_outlined, size: 72, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Select a job and evaluate',
                style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey)),
            const SizedBox(height: 8),
            Text('See how well your skills match the job requirements',
                style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  // ── Animated Score Circle ────────────────────────────────────────
  Widget _buildScoreSection(ThemeData theme) {
    final score = _evaluationResult['overallScore'] as int? ?? 0;
    final color = _scoreColor(score);
    final jobTitle = _evaluationResult['jobTitle'] as String? ?? 'Job';

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(jobTitle, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(
              _scoreLabel(score),
              style: theme.textTheme.bodySmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            // Animated score circle
            SizedBox(
              width: 180,
              height: 180,
              child: AnimatedBuilder(
                animation: _scoreController,
                builder: (context, child) {
                  final animatedScore = (_scoreAnimation.value * 100).round();
                  return CustomPaint(
                    painter: _ScoreCirclePainter(
                      progress: _scoreAnimation.value,
                      color: color,
                      backgroundColor: const Color(0xFFE8F5E9),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '$animatedScore%',
                            style: TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.w800,
                              color: color,
                            ),
                          ),
                          Text(
                            'Compatibility',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[500],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            // Summary row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSummaryChip(
                  Icons.check_circle,
                  '${((_evaluationResult['matchingSkills'] as List?) ?? []).length}',
                  'Matching',
                  _primaryGreen,
                ),
                _buildSummaryChip(
                  Icons.cancel_outlined,
                  '${((_evaluationResult['missingSkills'] as List?) ?? []).length}',
                  'Missing',
                  Colors.red,
                ),
                _buildSummaryChip(
                  Icons.add_circle_outline,
                  '${((_evaluationResult['extraSkills'] as List?) ?? []).length}',
                  'Extra',
                  Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryChip(IconData icon, String count, String label, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(count, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: color)),
        Text(label, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
      ],
    );
  }

  // ── Skill Breakdown ──────────────────────────────────────────────
  Widget _buildSkillBreakdown(ThemeData theme) {
    final matching = (_evaluationResult['matchingSkills'] as List<dynamic>?) ?? [];
    final missing = (_evaluationResult['missingSkills'] as List<dynamic>?) ?? [];
    final extra = (_evaluationResult['extraSkills'] as List<dynamic>?) ?? [];

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 22,
                  decoration: BoxDecoration(
                    color: _primaryGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                Text('Skill Breakdown',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 16),
            // Matching skills
            if (matching.isNotEmpty) ...[
              _buildSkillCategoryHeader(Icons.check_circle, 'Matching Skills', _primaryGreen),
              const SizedBox(height: 8),
              ...matching.map((s) => _buildSkillBar(
                    theme,
                    name: (s as Map)['name'] as String,
                    value: ((s)['proficiency'] as int) / 100.0,
                    color: _primaryGreen,
                  )),
              const SizedBox(height: 16),
            ],
            // Missing skills
            if (missing.isNotEmpty) ...[
              _buildSkillCategoryHeader(Icons.cancel_outlined, 'Missing Skills', Colors.red),
              const SizedBox(height: 8),
              ...missing.map((s) => _buildMissingSkillChip(theme, s as Map)),
              const SizedBox(height: 16),
            ],
            // Extra skills
            if (extra.isNotEmpty) ...[
              _buildSkillCategoryHeader(Icons.add_circle_outline, 'Extra Skills', Colors.blue),
              const SizedBox(height: 8),
              ...extra.map((s) => _buildExtraSkillChip(theme, s as Map)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSkillCategoryHeader(IconData icon, String label, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: color)),
      ],
    );
  }

  Widget _buildSkillBar(ThemeData theme, {required String name, required double value, required Color color}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(name, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500))),
              Text('${(value * 100).round()}%',
                  style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w700, color: color)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: value,
              minHeight: 8,
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissingSkillChip(ThemeData theme, Map skill) {
    final importance = skill['importance'] as String? ?? 'Medium';
    final color = importance == 'High' ? Colors.red : Colors.orange;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: color.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(skill['name'] as String,
                        style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(importance,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: color,
                          fontWeight: FontWeight.w700,
                        )),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExtraSkillChip(ThemeData theme, Map skill) {
    final relevance = skill['relevance'] as String? ?? 'Low';
    final color = relevance == 'High' ? Colors.blue : Colors.grey;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: color.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(skill['name'] as String,
                        style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(relevance,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: color,
                          fontWeight: FontWeight.w700,
                        )),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Recommendations ──────────────────────────────────────────────
  Widget _buildRecommendations(ThemeData theme) {
    final recs = (_evaluationResult['recommendations'] as List<dynamic>?) ?? [];

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 22,
                  decoration: BoxDecoration(
                    color: _primaryGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                Text('Recommendations',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            ...recs.asMap().entries.map((entry) {
              final index = entry.key;
              final text = entry.value.toString();
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: _primaryGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: _primaryGreen,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(text,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              height: 1.5,
                              color: Colors.grey[700],
                            )),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  // ── Evaluate Button ──────────────────────────────────────────────
  Widget _buildEvaluateButton() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: _isEvaluating ? null : _evaluateFit,
            icon: Icon(_hasEvaluated ? Icons.refresh : Icons.analytics_outlined),
            label: Text(_hasEvaluated ? 'Re-Evaluate Fit' : 'Evaluate Fit'),
            style: ElevatedButton.styleFrom(
              backgroundColor: _primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Custom Painter for Score Circle ────────────────────────────────
class _ScoreCirclePainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color backgroundColor;

  _ScoreCirclePainter({
    required this.progress,
    required this.color,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 16) / 2;
    const strokeWidth = 12.0;

    // Background circle
    final bgPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    if (progress > 0) {
      final progressPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      const startAngle = -math.pi / 2;
      final sweepAngle = 2 * math.pi * progress;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ScoreCirclePainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.color != color;
  }
}
