import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AiInterviewScreen extends StatefulWidget {
  const AiInterviewScreen({super.key});

  @override
  State<AiInterviewScreen> createState() => _AiInterviewScreenState();
}

class _AiInterviewScreenState extends State<AiInterviewScreen> {
  static const Color _primaryColor = Color(0xFF00C853);

  // Interview states
  bool _isSelectingType = true;
  bool _isLoading = false;
  bool _isSubmitting = false;
  String _selectedType = 'behavioral';
  String? _interviewId;

  // Question flow
  int _currentQuestionIndex = 0;
  int _totalQuestions = 5;
  List<Map<String, dynamic>> _questions = [];
  List<Map<String, dynamic>> _answers = [];

  // Results
  bool _showResults = false;
  Map<String, dynamic>? _results;

  final TextEditingController _answerController = TextEditingController();

  // Interview mode: 'chat' or 'video'
  String _interviewMode = 'chat';
  bool _isRecording = false;
  int _recordingSeconds = 0;
  Duration _recordDuration = Duration.zero;

  final List<Map<String, String>> _interviewTypes = [
    {
      'key': 'behavioral',
      'label': 'Behavioral',
      'description': 'Questions about past experiences and how you handle workplace situations',
      'icon': 'psychology',
    },
    {
      'key': 'technical',
      'label': 'Technical',
      'description': 'Coding concepts, system design, and domain-specific knowledge',
      'icon': 'code',
    },
    {
      'key': 'mixed',
      'label': 'Mixed',
      'description': 'A blend of behavioral and technical questions for comprehensive prep',
      'icon': 'shuffle',
    },
    {
      'key': 'video',
      'label': 'Video Interview',
      'description': 'AI-led video interview with face recording and real-time feedback',
      'icon': 'videocam',
    },
  ];

  // 5 built-in demo questions per type
  static const Map<String, List<Map<String, dynamic>>> _demoQuestions = {
    'behavioral': [
      {
        'id': 'b1',
        'question':
            'Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?',
        'category': 'Teamwork',
      },
      {
        'id': 'b2',
        'question':
            'Describe a situation where you had to meet a tight deadline. What steps did you take to ensure timely delivery?',
        'category': 'Time Management',
      },
      {
        'id': 'b3',
        'question':
            'Give an example of when you took initiative to solve a problem that wasn\'t strictly your responsibility.',
        'category': 'Leadership',
      },
      {
        'id': 'b4',
        'question':
            'Tell me about a time when you received critical feedback. How did you respond and what did you learn?',
        'category': 'Growth Mindset',
      },
      {
        'id': 'b5',
        'question':
            'Describe a situation where you had to adapt to a significant change at work. How did you manage the transition?',
        'category': 'Adaptability',
      },
    ],
    'technical': [
      {
        'id': 't1',
        'question':
            'Explain the difference between REST and GraphQL. When would you choose one over the other?',
        'category': 'API Design',
      },
      {
        'id': 't2',
        'question':
            'How would you design a URL shortening service? Walk through the key components and trade-offs.',
        'category': 'System Design',
      },
      {
        'id': 't3',
        'question':
            'What is the difference between SQL and NoSQL databases? Give examples of when to use each.',
        'category': 'Databases',
      },
      {
        'id': 't4',
        'question':
            'Explain the concept of containerization and how Docker differs from traditional virtualization.',
        'category': 'DevOps',
      },
      {
        'id': 't5',
        'question':
            'Describe the CAP theorem and its implications for distributed system design.',
        'category': 'Architecture',
      },
    ],
    'mixed': [
      {
        'id': 'm1',
        'question':
            'Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder.',
        'category': 'Communication',
      },
      {
        'id': 'm2',
        'question':
            'How would you prioritize features when you have conflicting requests from different teams?',
        'category': 'Prioritization',
      },
      {
        'id': 'm3',
        'question':
            'Explain the concept of microservices and discuss when a monolithic architecture might be preferable.',
        'category': 'Architecture',
      },
      {
        'id': 'm4',
        'question':
            'Describe how you would handle a production outage. Walk through your incident response process.',
        'category': 'Crisis Management',
      },
      {
        'id': 'm5',
        'question':
            'Tell me about a project where you had to learn a new technology quickly. How did you get up to speed?',
        'category': 'Learning Agility',
      },
    ],
  };

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _startInterview() async {
    setState(() => _isLoading = true);
    _interviewMode = _selectedType == 'video' ? 'video' : 'chat';

    try {
      final type = _selectedType == 'video' ? 'mixed' : _selectedType;
      final response = await ApiService.startInterview(type: type);
      if (response.containsKey('interviewId') &&
          !response.containsKey('error')) {
        _interviewId = response['interviewId'];
        final questionsList = response['questions'] as List<dynamic>?;
        if (questionsList != null && questionsList.isNotEmpty) {
          setState(() {
            _questions = questionsList.cast<Map<String, dynamic>>();
            _totalQuestions = _questions.length;
            _isSelectingType = false;
            _isLoading = false;
          });
          return;
        }
      }
      // Fallback to demo
      _useDemoQuestions();
    } catch (e) {
      _useDemoQuestions();
    }
  }

  void _useDemoQuestions() {
    final type = _selectedType == 'video' ? 'mixed' : _selectedType;
    setState(() {
      _questions = List.from(_demoQuestions[type] ?? _demoQuestions['behavioral']!);
      _totalQuestions = _questions.length;
      _interviewId = null; // offline mode
      _isSelectingType = false;
      _isLoading = false;
    });
  }

  Future<void> _submitAnswer() async {
    if (_answerController.text.trim().isEmpty) return;

    final answerText = _answerController.text.trim();
    setState(() => _isSubmitting = true);

    _answers.add({
      'questionId': _questions[_currentQuestionIndex]['id'],
      'question': _questions[_currentQuestionIndex]['question'],
      'category': _questions[_currentQuestionIndex]['category'],
      'answer': answerText,
    });

    try {
      if (_interviewId != null) {
        final response = await ApiService.submitInterviewAnswer(
          _interviewId!,
          answerText,
        );
        if (response.containsKey('nextQuestion') &&
            response['nextQuestion'] != null) {
          setState(() {
            _currentQuestionIndex++;
            _questions.add(response['nextQuestion'] as Map<String, dynamic>);
            _totalQuestions = _questions.length;
            _answerController.clear();
            _isSubmitting = false;
          });
          return;
        } else if (response.containsKey('results') ||
            response.containsKey('completed')) {
          _finishInterview(response);
          return;
        }
      }
      // Move to next question or finish
      _currentQuestionIndex++;
      _answerController.clear();

      if (_currentQuestionIndex >= _totalQuestions) {
        _generateResults();
      } else {
        setState(() => _isSubmitting = false);
      }
    } catch (e) {
      _currentQuestionIndex++;
      _answerController.clear();

      if (_currentQuestionIndex >= _totalQuestions) {
        _generateResults();
      } else {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _finishInterview(Map<String, dynamic> response) {
    setState(() {
      _results = response['results'] is Map<String, dynamic>
          ? response['results'] as Map<String, dynamic>
          : null;
      _showResults = true;
      _isSubmitting = false;
    });
  }

  void _generateResults() {
    // Generate demo results
    final categoryScores = <String, List<int>>{};
    for (final answer in _answers) {
      final cat = answer['category'] as String? ?? 'General';
      categoryScores.putIfAbsent(cat, () => []);
      // Simulate a score for demo
      final score = 60 + (answer['answer'] as String).length % 35;
      categoryScores[cat]!.add(score);
    }

    final categoryAverages = <String, double>{};
    int totalScore = 0;
    for (final entry in categoryScores.entries) {
      final avg = entry.value.reduce((a, b) => a + b) / entry.value.length;
      categoryAverages[entry.key] = avg;
      totalScore += avg.toInt();
    }
    final overallScore =
        categoryAverages.isEmpty ? 0 : totalScore ~/ categoryAverages.length;

    setState(() {
      _results = {
        'overallScore': overallScore,
        'categories': categoryAverages,
        'tips': _getTips(overallScore),
      };
      _showResults = true;
      _isSubmitting = false;
    });
  }

  List<String> _getTips(int score) {
    if (score >= 85) {
      return [
        'Excellent performance! Your answers were thorough and well-structured.',
        'Consider adding more specific metrics and outcomes to strengthen your responses.',
        'Practice maintaining this level of detail across all question types.',
      ];
    } else if (score >= 70) {
      return [
        'Good overall performance with room for improvement.',
        'Try using the STAR method (Situation, Task, Action, Result) for behavioral questions.',
        'Add more specific examples and quantifiable outcomes to your answers.',
        'Work on being more concise while still providing enough detail.',
      ];
    } else {
      return [
        'Focus on structuring your answers with clear beginning, middle, and end.',
        'Use the STAR method for behavioral questions.',
        'Provide specific examples rather than generic statements.',
        'Include measurable outcomes and impact in your responses.',
        'Practice speaking about your experiences in a concise, compelling way.',
      ];
    }
  }

  void _resetInterview() {
    setState(() {
      _isSelectingType = true;
      _isLoading = false;
      _isSubmitting = false;
      _interviewId = null;
      _currentQuestionIndex = 0;
      _totalQuestions = 5;
      _questions = [];
      _answers = [];
      _showResults = false;
      _results = null;
      _answerController.clear();
    });
  }

  // Toggle recording for video interview
  void _toggleRecording() {
    setState(() {
      _isRecording = !_isRecording;
      if (_isRecording) {
        _recordingSeconds = 0;
      } else {
        _recordingSeconds = 0;
      }
    });
  }

  IconData _getTypeIcon(String key) {
    switch (key) {
      case 'behavioral':
        return Icons.psychology;
      case 'technical':
        return Icons.code;
      case 'mixed':
        return Icons.shuffle;
      case 'video':
        return Icons.videocam;
      default:
        return Icons.quiz;
    }
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
            'AI Interview',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          actions: [
            if (!_isSelectingType)
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: _resetInterview,
              ),
          ],
        ),
        body: _isLoading
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: _primaryColor),
                    SizedBox(height: 16),
                    Text('Preparing your interview...'),
                  ],
                ),
              )
            : _showResults
                ? _buildResultsScreen()
                : _isSelectingType
                    ? _buildTypeSelector()
                    : _buildQuestionFlow(),
      ),
    );
  }

  // ── Type Selector ──────────────────────────────────────────────────
  Widget _buildTypeSelector() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Choose Interview Type',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Select the type of interview you want to practice',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
          const SizedBox(height: 24),
          ..._interviewTypes.map((type) {
            final isSelected = _selectedType == type['key'];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                elevation: isSelected ? 3 : 1,
                child: InkWell(
                  onTap: () =>
                      setState(() => _selectedType = type['key']!),
                  borderRadius: BorderRadius.circular(14),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? _primaryColor : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? _primaryColor.withOpacity(0.1)
                                : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            _getTypeIcon(type['key']!),
                            color: isSelected ? _primaryColor : Colors.grey,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                type['label']!,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? _primaryColor
                                      : Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                type['description']!,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isSelected)
                          const Icon(Icons.check_circle,
                              color: _primaryColor, size: 24),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: _startInterview,
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Start Interview',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Question Flow ──────────────────────────────────────────────────
  Widget _buildQuestionFlow() {
    if (_interviewMode == 'video') {
      return _buildVideoInterviewFlow();
    }
    return _buildChatInterviewFlow();
  }

  // ── Video Interview Flow ────────────────────────────────────────────
  Widget _buildVideoInterviewFlow() {
    final question = _questions[_currentQuestionIndex];
    final progress = (_currentQuestionIndex + 1) / _totalQuestions;

    return Column(
      children: [
        // Progress bar
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.grey[200],
          valueColor: const AlwaysStoppedAnimation<Color>(_primaryColor),
          minHeight: 4,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentQuestionIndex + 1} of $_totalQuestions',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[600]),
              ),
              if (question['category'] != null)
                Chip(
                  label: Text(question['category'], style: const TextStyle(fontSize: 11)),
                  backgroundColor: _primaryColor.withOpacity(0.1),
                  labelStyle: const TextStyle(color: _primaryColor),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
        ),
        // Video preview area (simulated camera feed)
        Expanded(
          flex: 3,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Stack(
              children: [
                // Camera preview placeholder
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _isRecording ? Icons.videocam : Icons.videocam_off,
                        color: _isRecording ? _primaryColor : Colors.white54,
                        size: 48,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _isRecording ? 'Recording...' : 'Camera Preview',
                        style: TextStyle(
                          color: _isRecording ? _primaryColor : Colors.white54,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (_isRecording) ...[
                        const SizedBox(height: 4),
                        Text(
                          '00:${_recordingSeconds.toString().padLeft(2, '0')}',
                          style: const TextStyle(color: Colors.red, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ],
                  ),
                ),
                // Recording indicator
                if (_isRecording)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 6),
                          const Text('REC', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                // AI Interviewer badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _primaryColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.smart_toy, color: Colors.white, size: 14),
                        SizedBox(width: 4),
                        Text('AI Interviewer', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Question display
        Padding(
          padding: const EdgeInsets.all(20),
          child: Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.record_voice_over, color: _primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text('AI asks:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey[600])),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    question['question'] ?? '',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, height: 1.4),
                  ),
                ],
              ),
            ),
          ),
        ),
        // Controls
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Record button
              GestureDetector(
                onTap: _toggleRecording,
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _isRecording ? Colors.red : _primaryColor,
                    boxShadow: [
                      BoxShadow(
                        color: (_isRecording ? Colors.red : _primaryColor).withOpacity(0.4),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Icon(
                    _isRecording ? Icons.stop : Icons.fiber_manual_record,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
              // Submit answer (text fallback)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: FilledButton(
                    onPressed: _isSubmitting ? null : _submitVideoAnswer,
                    style: FilledButton.styleFrom(
                      backgroundColor: _primaryColor,
                      disabledBackgroundColor: Colors.grey[300],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(
                            _currentQuestionIndex < _totalQuestions - 1 ? 'Next Question' : 'Finish Interview',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
        // Optional text answer
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
          child: TextField(
            controller: _answerController,
            maxLines: 2,
            decoration: InputDecoration(
              hintText: 'Optional: Type key points you covered in your video answer...',
              filled: true,
              fillColor: Colors.grey[50],
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey[300]!)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey[300]!)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _primaryColor, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            style: const TextStyle(fontSize: 13),
          ),
        ),
      ],
    );
  }

  Future<void> _submitVideoAnswer() async {
    final answerText = _answerController.text.trim().isNotEmpty
        ? _answerController.text.trim()
        : 'Video response recorded (${_isRecording ? "ongoing" : "completed"})';

    setState(() => _isSubmitting = true);
    _isRecording = false;

    _answers.add({
      'questionId': _questions[_currentQuestionIndex]['id'],
      'question': _questions[_currentQuestionIndex]['question'],
      'category': _questions[_currentQuestionIndex]['category'],
      'answer': answerText,
      'mode': 'video',
    });

    _currentQuestionIndex++;
    _answerController.clear();

    if (_currentQuestionIndex >= _totalQuestions) {
      _generateResults();
    } else {
      setState(() => _isSubmitting = false);
    }
  }

  // ── Chat Interview Flow ─────────────────────────────────────────────
  Widget _buildChatInterviewFlow() {
    final question = _questions[_currentQuestionIndex];
    final progress =
        (_currentQuestionIndex + 1) / _totalQuestions;

    return Column(
      children: [
        // Progress bar
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.grey[200],
          valueColor: const AlwaysStoppedAnimation<Color>(_primaryColor),
          minHeight: 4,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentQuestionIndex + 1} of $_totalQuestions',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[600],
                ),
              ),
              if (question['category'] != null)
                Chip(
                  label: Text(
                    question['category'],
                    style: const TextStyle(fontSize: 11),
                  ),
                  backgroundColor: _primaryColor.withOpacity(0.1),
                  labelStyle: const TextStyle(color: _primaryColor),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
        ),
        // Question card
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: _primaryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.quiz,
                                  color: _primaryColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Interview Question',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          question['question'] ?? '',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w500,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                // Answer field
                const Text(
                  'Your Answer',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _answerController,
                  maxLines: 8,
                  decoration: InputDecoration(
                    hintText: 'Type your answer here... Use the STAR method for behavioral questions.',
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
                      borderSide:
                          const BorderSide(color: _primaryColor, width: 2),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Submit button
        Padding(
          padding: const EdgeInsets.all(20),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed:
                  _isSubmitting ? null : _submitAnswer,
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                disabledBackgroundColor: Colors.grey[300],
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
                      _currentQuestionIndex < _totalQuestions - 1
                          ? 'Submit & Next'
                          : 'Finish Interview',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────
  Widget _buildResultsScreen() {
    final overallScore = (_results?['overallScore'] as int?) ?? 0;
    final categories =
        (_results?['categories'] as Map<String, dynamic>?) ?? {};
    final tips = (_results?['tips'] as List<dynamic>?)?.cast<String>() ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 10),
          // Overall score circle
          Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  _primaryColor.withOpacity(0.1),
                  _primaryColor.withOpacity(0.3),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Center(
              child: Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '$overallScore',
                        style: const TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: _primaryColor,
                        ),
                      ),
                      const Text(
                        'out of 100',
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
          const SizedBox(height: 8),
          Text(
            overallScore >= 85
                ? 'Excellent!'
                : overallScore >= 70
                    ? 'Good Job!'
                    : 'Keep Practicing!',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          // Category scores
          if (categories.isNotEmpty) ...[
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Category Scores',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 12),
            ...categories.entries.map((entry) {
              final score = entry.value.toDouble();
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          entry.key,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '${score.toInt()}%',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: score >= 80
                                ? _primaryColor
                                : score >= 60
                                    ? Colors.orange
                                    : Colors.red,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: score / 100,
                        backgroundColor: Colors.grey[200],
                        valueColor: AlwaysStoppedAnimation<Color>(
                          score >= 80
                              ? _primaryColor
                              : score >= 60
                                  ? Colors.orange
                                  : Colors.red,
                        ),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
          const SizedBox(height: 16),
          // Improvement tips
          if (tips.isNotEmpty) ...[
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Improvement Tips',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 12),
            ...tips.asMap().entries.map((entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      margin: const EdgeInsets.only(right: 12, top: 1),
                      decoration: BoxDecoration(
                        color: _primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${entry.key + 1}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _primaryColor,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        entry.value,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
          const SizedBox(height: 24),
          // Retry button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: _resetInterview,
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Try Another Interview',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
