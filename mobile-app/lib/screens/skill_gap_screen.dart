import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SkillGapScreen extends StatefulWidget {
  const SkillGapScreen({super.key});

  @override
  State<SkillGapScreen> createState() => _SkillGapScreenState();
}

class _SkillGapScreenState extends State<SkillGapScreen> {
  bool _isAnalyzing = false;
  bool _hasAnalyzed = false;

  static const Color _primaryGreen = Color(0xFF00C853);

  // Demo current skills with proficiency
  static const List<Map<String, dynamic>> _currentSkills = [
    {'name': 'React', 'proficiency': 0.85, 'category': 'Frontend'},
    {'name': 'Python', 'proficiency': 0.72, 'category': 'Backend'},
    {'name': 'TypeScript', 'proficiency': 0.68, 'category': 'Frontend'},
    {'name': 'Node.js', 'proficiency': 0.60, 'category': 'Backend'},
    {'name': 'SQL', 'proficiency': 0.55, 'category': 'Database'},
    {'name': 'Docker', 'proficiency': 0.45, 'category': 'DevOps'},
  ];

  // Demo recommended skills with priority
  static const List<Map<String, dynamic>> _recommendedSkills = [
    {'name': 'AWS / Cloud Services', 'priority': 'High', 'reason': 'Required for senior full-stack roles'},
    {'name': 'System Design', 'priority': 'High', 'reason': 'Essential for architecture-level positions'},
    {'name': 'GraphQL', 'priority': 'Medium', 'reason': 'Growing demand in modern API development'},
    {'name': 'Kubernetes', 'priority': 'Low', 'reason': 'Nice-to-have for DevOps-oriented roles'},
  ];

  // Demo gap analysis results
  static const Map<String, dynamic> _gapAnalysis = {
    'targetRole': 'Senior Full-Stack Engineer',
    'matchScore': 62,
    'missingSkills': ['AWS / Cloud Services', 'System Design', 'GraphQL'],
    'strengths': ['React', 'Python', 'TypeScript'],
    'recommendation':
        'Focus on cloud services and system design to bridge the gap. Consider AWS certification and distributed systems courses.',
  };

  Map<String, dynamic> _analysisResult = {};

  Future<void> _analyzeGap() async {
    setState(() => _isAnalyzing = true);
    try {
      final result = await ApiService.analyzeSkillGap();
      if (result.containsKey('error')) throw Exception('API error');
      setState(() {
        _analysisResult = result;
        _hasAnalyzed = true;
        _isAnalyzing = false;
      });
    } catch (_) {
      // Use demo data
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() {
          _analysisResult = Map<String, dynamic>.from(_gapAnalysis);
          _hasAnalyzed = true;
          _isAnalyzing = false;
        });
      }
    }
  }

  Color _priorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _priorityIcon(String priority) {
    switch (priority.toLowerCase()) {
      case 'high':
        return Icons.priority_high;
      case 'medium':
        return Icons.remove_circle_outline;
      case 'low':
        return Icons.low_priority;
      default:
        return Icons.label;
    }
  }

  Color _categoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'frontend':
        return Colors.blue;
      case 'backend':
        return const Color(0xFF00C853);
      case 'database':
        return Colors.orange;
      case 'devops':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Skill Gap Analysis'),
        backgroundColor: _primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isAnalyzing
          ? _buildLoadingState()
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSkillsProfileSection(theme),
                  const SizedBox(height: 24),
                  _buildRecommendedSkillsSection(theme),
                  const SizedBox(height: 24),
                  if (_hasAnalyzed) ...[
                    _buildGapAnalysisCard(theme),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
      bottomNavigationBar: _buildAnalyzeButton(),
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
          Text('Analyzing your skill gaps...',
              style: TextStyle(fontSize: 16, color: Colors.grey[600])),
          const SizedBox(height: 8),
          Text('Comparing against target role requirements',
              style: TextStyle(fontSize: 13, color: Colors.grey[400])),
        ],
      ),
    );
  }

  // ── Skills Profile Section ───────────────────────────────────────
  Widget _buildSkillsProfileSection(ThemeData theme) {
    return Column(
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
            Text('Your Skills Profile',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: _currentSkills.map((skill) {
                final categoryColor = _categoryColor(skill['category'] as String);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              skill['name'] as String,
                              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: categoryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              skill['category'] as String,
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: categoryColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${((skill['proficiency'] as double) * 100).round()}%',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: _primaryGreen,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: skill['proficiency'] as double,
                          minHeight: 8,
                          backgroundColor: const Color(0xFFE8F5E9),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getProgressColor(skill['proficiency'] as double),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Color _getProgressColor(double value) {
    if (value >= 0.75) return _primaryGreen;
    if (value >= 0.5) return Colors.orange;
    return Colors.redAccent;
  }

  // ── Recommended Skills Section ───────────────────────────────────
  Widget _buildRecommendedSkillsSection(ThemeData theme) {
    return Column(
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
            Text('Recommended Skills',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 12),
        ..._recommendedSkills.map((skill) {
          final priority = skill['priority'] as String;
          final pColor = _priorityColor(priority);
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: pColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_priorityIcon(priority), color: pColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          skill['name'] as String,
                          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          skill['reason'] as String,
                          style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: pColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      priority,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: pColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // ── Gap Analysis Card ────────────────────────────────────────────
  Widget _buildGapAnalysisCard(ThemeData theme) {
    final score = _analysisResult['matchScore'] as int? ?? 0;
    final missing = _analysisResult['missingSkills'] as List<dynamic>? ?? [];
    final strengths = _analysisResult['strengths'] as List<dynamic>? ?? [];
    final targetRole = _analysisResult['targetRole'] as String? ?? 'Target Role';
    final recommendation = _analysisResult['recommendation'] as String? ?? '';

    return Column(
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
            Text('Gap Analysis Results',
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          elevation: 3,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Target role header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _primaryGreen.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.work_outline, color: _primaryGreen),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Target Role',
                                style: theme.textTheme.labelSmall?.copyWith(color: Colors.grey[600])),
                            Text(targetRole,
                                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      // Score circle
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _primaryGreen.withOpacity(0.15),
                        ),
                        child: Center(
                          child: Text(
                            '$score%',
                            style: TextStyle(
                              color: _primaryGreen,
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Missing skills
                if (missing.isNotEmpty) ...[
                  _buildAnalysisChipRow(
                    theme,
                    label: 'Missing Skills',
                    icon: Icons.warning_amber_rounded,
                    color: Colors.red,
                    items: missing,
                  ),
                  const SizedBox(height: 12),
                ],
                // Strengths
                if (strengths.isNotEmpty) ...[
                  _buildAnalysisChipRow(
                    theme,
                    label: 'Your Strengths',
                    icon: Icons.check_circle_outline,
                    color: _primaryGreen,
                    items: strengths,
                  ),
                  const SizedBox(height: 12),
                ],
                // Recommendation
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.withOpacity(0.15)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.lightbulb_outline, color: Colors.blue, size: 18),
                          const SizedBox(width: 6),
                          Text('Recommendation',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.w700,
                              )),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(recommendation,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.grey[700],
                            height: 1.5,
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAnalysisChipRow(
    ThemeData theme, {
    required String label,
    required IconData icon,
    required Color color,
    required List<dynamic> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 6),
            Text(label,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w700,
                )),
          ],
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: items.map((item) {
            return Chip(
              label: Text(item.toString()),
              labelStyle: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12),
              backgroundColor: color.withOpacity(0.08),
              side: BorderSide.none,
              padding: const EdgeInsets.symmetric(horizontal: 4),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            );
          }).toList(),
        ),
      ],
    );
  }

  // ── Analyze Button ───────────────────────────────────────────────
  Widget _buildAnalyzeButton() {
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
            onPressed: _isAnalyzing ? null : _analyzeGap,
            icon: Icon(_hasAnalyzed ? Icons.refresh : Icons.analytics_outlined),
            label: Text(_hasAnalyzed ? 'Re-Analyze Gap' : 'Analyze Gap'),
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
