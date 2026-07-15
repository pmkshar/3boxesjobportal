import 'dart:math';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  static const Color _primaryColor = Color(0xFF00C853);

  bool _isLoading = true;

  // Demo analytics data
  final Map<String, dynamic> _analytics = {
    'totalApplications': 47,
    'interviews': 12,
    'offers': 5,
    'successRate': 10.6, // percentage
    'weeklyActivity': [3, 5, 2, 7, 4, 6, 1],
    'weekDays': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    'topSkills': [
      {'name': 'Flutter', 'level': 0.92},
      {'name': 'React', 'level': 0.85},
      {'name': 'Python', 'level': 0.78},
      {'name': 'Node.js', 'level': 0.71},
      {'name': 'SQL', 'level': 0.65},
    ],
  };

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() => _isLoading = true);

    try {
      final response = await ApiService.getAnalytics();
      if (response is Map<String, dynamic> && response.containsKey('totalApplications')) {
        setState(() {
          _analytics.addAll(response);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const Spacer(),
            Text(
              value,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalApps = _analytics['totalApplications'] as int;
    final interviews = _analytics['interviews'] as int;
    final offers = _analytics['offers'] as int;
    final successRate = _analytics['successRate'] as double;
    final weeklyActivity = _analytics['weeklyActivity'] as List<dynamic>;
    final weekDays = _analytics['weekDays'] as List<dynamic>;
    final topSkills = _analytics['topSkills'] as List<dynamic>;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Analytics',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAnalytics,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _primaryColor))
          : RefreshIndicator(
              color: _primaryColor,
              onRefresh: _loadAnalytics,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Key metrics grid (2x2)
                    const Text(
                      'Key Metrics',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.1,
                      children: [
                        _buildMetricCard(
                          title: 'Total Applications',
                          value: totalApps.toString(),
                          icon: Icons.send,
                          iconColor: const Color(0xFF2196F3),
                        ),
                        _buildMetricCard(
                          title: 'Interviews',
                          value: interviews.toString(),
                          icon: Icons.people,
                          iconColor: const Color(0xFFFF9800),
                        ),
                        _buildMetricCard(
                          title: 'Offers',
                          value: offers.toString(),
                          icon: Icons.workspace_premium,
                          iconColor: _primaryColor,
                        ),
                        _buildMetricCard(
                          title: 'Success Rate',
                          value: '${successRate.toStringAsFixed(1)}%',
                          icon: Icons.trending_up,
                          iconColor: const Color(0xFF9C27B0),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Success rate ring chart
                    const Text(
                      'Application Success Rate',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Center(
                          child: SizedBox(
                            width: 180,
                            height: 180,
                            child: CustomPaint(
                              painter: _SuccessRingPainter(
                                successRate: successRate / 100,
                                primaryColor: _primaryColor,
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${successRate.toStringAsFixed(1)}%',
                                      style: const TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1A1A2E),
                                      ),
                                    ),
                                    const Text(
                                      'Success Rate',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Weekly activity bar chart
                    const Text(
                      'Weekly Activity',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: SizedBox(
                          height: 200,
                          child: CustomPaint(
                            painter: _WeeklyBarPainter(
                              values: weeklyActivity.cast<double>(),
                              labels: weekDays.cast<String>(),
                              primaryColor: _primaryColor,
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Top skills section
                    const Text(
                      'Top Skills',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: topSkills.map<Widget>((skill) {
                            final name = skill['name'] as String;
                            final level = skill['level'] as double;
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      Text(
                                        '${(level * 100).toInt()}%',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.grey[600],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: LinearProgressIndicator(
                                      value: level,
                                      minHeight: 8,
                                      backgroundColor: Colors.grey[200],
                                      valueColor:
                                          const AlwaysStoppedAnimation<Color>(
                                              _primaryColor),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }
}

/// Custom painter for the success rate ring chart
class _SuccessRingPainter extends CustomPainter {
  final double successRate;
  final Color primaryColor;

  _SuccessRingPainter({
    required this.successRate,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 16;
    const strokeWidth = 18.0;

    // Background ring
    final bgPaint = Paint()
      ..color = Colors.grey[200]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Success arc
    final successPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    const startAngle = -pi / 2;
    final sweepAngle = 2 * pi * successRate;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      successPaint,
    );

    // Remaining arc (subtle different shade)
    final remainPaint = Paint()
      ..color = Colors.red.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    if (successRate < 1.0) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle + sweepAngle,
        2 * pi * (1 - successRate),
        false,
        remainPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _SuccessRingPainter oldDelegate) {
    return oldDelegate.successRate != successRate;
  }
}

/// Custom painter for the weekly activity bar chart
class _WeeklyBarPainter extends CustomPainter {
  final List<double> values;
  final List<String> labels;
  final Color primaryColor;

  _WeeklyBarPainter({
    required this.values,
    required this.labels,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;

    final maxValue = values.reduce(max);
    final barCount = values.length;
    final chartLeft = 36.0;
    final chartRight = size.width - 8;
    final chartTop = 8.0;
    final chartBottom = size.height - 28.0;
    final chartWidth = chartRight - chartLeft;
    final chartHeight = chartBottom - chartTop;

    // Draw horizontal grid lines
    final gridPaint = Paint()
      ..color = Colors.grey[200]!
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = chartTop + (chartHeight * i / 4);
      canvas.drawLine(
        Offset(chartLeft, y),
        Offset(chartRight, y),
        gridPaint,
      );

      // Y-axis labels
      final value = (maxValue * (4 - i) / 4).toInt();
      final textSpan = TextSpan(
        text: value.toString(),
        style: TextStyle(color: Colors.grey[500], fontSize: 10),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(chartLeft - textPainter.width - 6, y - textPainter.height / 2),
      );
    }

    // Draw bars
    final barSpacing = chartWidth / barCount;
    final barWidth = barSpacing * 0.5;

    for (int i = 0; i < barCount; i++) {
      final barHeight =
          maxValue > 0 ? (values[i] / maxValue) * chartHeight : 0.0;
      final x = chartLeft + barSpacing * i + (barSpacing - barWidth) / 2;
      final y = chartBottom - barHeight;

      // Bar with rounded top
      final barPaint = Paint()
        ..color = primaryColor
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = barWidth;

      if (barHeight > 0) {
        canvas.drawLine(
          Offset(x + barWidth / 2, chartBottom),
          Offset(x + barWidth / 2, y),
          barPaint,
        );
      }

      // X-axis labels (day names)
      final labelSpan = TextSpan(
        text: labels[i],
        style: TextStyle(color: Colors.grey[600], fontSize: 11),
      );
      final labelPainter = TextPainter(
        text: labelSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      labelPainter.paint(
        canvas,
        Offset(
          x + barWidth / 2 - labelPainter.width / 2,
          chartBottom + 8,
        ),
      );

      // Value on top of bar
      if (barHeight > 0) {
        final valueSpan = TextSpan(
          text: values[i].toInt().toString(),
          style: TextStyle(
            color: primaryColor,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        );
        final valuePainter = TextPainter(
          text: valueSpan,
          textDirection: TextDirection.ltr,
        )..layout();
        valuePainter.paint(
          canvas,
          Offset(
            x + barWidth / 2 - valuePainter.width / 2,
            y - valuePainter.height - 4,
          ),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _WeeklyBarPainter oldDelegate) {
    return oldDelegate.values != values;
  }
}
