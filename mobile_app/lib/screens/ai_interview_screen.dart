import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class AiInterviewScreen extends StatefulWidget {
  const AiInterviewScreen({super.key});

  @override
  State<AiInterviewScreen> createState() => _AiInterviewScreenState();
}

class _AiInterviewScreenState extends State<AiInterviewScreen> {
  String _selectedType = 'behavioral';
  bool _isStarting = false;
  List<Map<String, String>> _questions = [];
  int _currentQuestion = 0;
  final List<String> _answers = [];
  bool _interviewActive = false;
  bool _interviewComplete = false;
  final _answerController = TextEditingController();

  final List<Map<String, dynamic>> _interviewTypes = [
    {'type': 'behavioral', 'label': 'Behavioral', 'icon': Icons.psychology, 'color': const Color(0xFF8B5CF6), 'desc': 'Soft skills & culture fit'},
    {'type': 'technical', 'label': 'Technical', 'icon': Icons.code, 'color': const Color(0xFF3B82F6), 'desc': 'Domain-specific questions'},
    {'type': 'mixed', 'label': 'Mixed', 'icon': Icons.shuffle, 'color': const Color(0xFF6366F1), 'desc': 'Both behavioral & technical'},
  ];

  final List<Map<String, String>> _sampleQuestions = [
    {'behavioral': 'Tell me about a time you led a team through a challenging project. What was the outcome?'},
    {'behavioral': 'Describe a situation where you had to handle a conflict with a coworker. How did you resolve it?'},
    {'behavioral': 'Give an example of when you went above and beyond your job requirements.'},
    {'technical': 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?'},
    {'technical': 'How would you design a scalable system to handle millions of concurrent users?'},
    {'technical': 'Walk me through your approach to debugging a production issue affecting critical functionality.'},
    {'mixed': 'Describe a technical decision you made that had a significant business impact.'},
    {'mixed': 'How do you balance technical debt with delivering new features on a tight deadline?'},
  ];

  void _startInterview() {
    final filtered = _sampleQuestions.where((q) => q.containsKey(_selectedType)).toList();
    if (filtered.isEmpty) {
      // Use all questions for mixed
      _questions = _sampleQuestions.map((q) => Map<String, String>.from(q)).toList();
    } else {
      _questions = filtered;
    }
    _answers.clear();
    _currentQuestion = 0;
    setState(() {
      _interviewActive = true;
      _interviewComplete = false;
    });
  }

  void _submitAnswer() {
    final answer = _answerController.text.trim();
    if (answer.isEmpty) return;
    _answers.add(answer);
    _answerController.clear();

    if (_currentQuestion < _questions.length - 1) {
      setState(() => _currentQuestion++);
    } else {
      setState(() {
        _interviewActive = false;
        _interviewComplete = true;
      });
    }
  }

  void _resetInterview() {
    setState(() {
      _interviewActive = false;
      _interviewComplete = false;
      _currentQuestion = 0;
      _questions.clear();
      _answers.clear();
    });
    _answerController.clear();
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('AI Interview', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _interviewActive
          ? _buildInterviewSession()
          : _interviewComplete
              ? _buildResults()
              : _buildInterviewSetup(),
    );
  }

  Widget _buildInterviewSetup() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.psychology, color: Colors.white, size: 32),
                    SizedBox(width: 12),
                    Text('AI Mock Interview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                SizedBox(height: 12),
                Text(
                  'Practice with AI-powered questions tailored to your target role. Get feedback on your responses and improve your interview skills.',
                  style: TextStyle(fontSize: 13, color: Color(0xFFDDD6FE)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Choose Interview Type', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
          const SizedBox(height: 12),

          ..._interviewTypes.map((item) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () => setState(() => _selectedType = item['type'] as String),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _selectedType == item['type'] ? (item['color'] as Color).withOpacity(0.08) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _selectedType == item['type'] ? (item['color'] as Color) : const Color(0xFFE4E8EC),
                    width: _selectedType == item['type'] ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['label'] as String, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E), fontSize: 14)),
                          Text(item['desc'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                        ],
                      ),
                    ),
                    if (_selectedType == item['type'])
                      Icon(Icons.check_circle, color: item['color'] as Color, size: 24),
                  ],
                ),
              ),
            ),
          )),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _isStarting ? null : _startInterview,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isStarting
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Start Interview', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewSession() {
    return Column(
      children: [
        // Progress bar
        LinearProgressIndicator(
          value: (_currentQuestion + 1) / _questions.length,
          backgroundColor: const Color(0xFFE4E8EC),
          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
        ),
        // Question counter
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Question ${_currentQuestion + 1} of ${_questions.length}', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF8B5CF6).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(_selectedType.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF8B5CF6))),
              ),
            ],
          ),
        ),
        // Question
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                      const Row(
                        children: [
                          Icon(Icons.psychology, color: Color(0xFF8B5CF6), size: 20),
                          SizedBox(width: 8),
                          Text('AI Question', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF8B5CF6), fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _questions[_currentQuestion].values.first,
                        style: const TextStyle(fontSize: 16, color: Color(0xFF05264E), height: 1.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                const Text('Your Answer', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
                const SizedBox(height: 8),
                TextField(
                  controller: _answerController,
                  maxLines: 8,
                  decoration: InputDecoration(
                    hintText: 'Type your answer here...',
                    hintStyle: const TextStyle(color: Color(0xFFC1C9D2)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        // Submit button
        Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _submitAnswer,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                _currentQuestion < _questions.length - 1 ? 'Next Question' : 'Finish Interview',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResults() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Success header
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 48),
                const SizedBox(height: 12),
                const Text('Interview Complete!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 8),
                Text('You answered ${_answers.length} out of ${_questions.length} questions', style: const TextStyle(color: Color(0xFFDDD6FE))),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Score
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE4E8EC))),
            child: Column(
              children: [
                const Text('Overall Score', style: TextStyle(fontSize: 14, color: Color(0xFF66789C))),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('7.5', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFF8B5CF6))),
                    const Text('/10', style: TextStyle(fontSize: 20, color: Color(0xFF66789C))),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Good performance! Practice more to improve.', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Tips
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(12)),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tips to Improve', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF059669))),
                SizedBox(height: 8),
                Text('1. Use the STAR method (Situation, Task, Action, Result)', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
                Text('2. Include specific metrics and outcomes', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
                Text('3. Keep answers concise but detailed (2-3 minutes)', style: TextStyle(fontSize: 13, color: Color(0xFF05264E))),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _resetInterview,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Practice Again', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}
