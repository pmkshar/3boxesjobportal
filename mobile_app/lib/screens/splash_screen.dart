import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF059669),
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 3 Boxes Logo
                CustomPaint(
                  size: const Size(120, 84),
                  painter: ThreeBoxesLogoPainter(),
                ),
                const SizedBox(height: 24),
                const Text(
                  '3 Boxes Jobs',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'AI-Powered Career Platform',
                  style: TextStyle(
                    color: Color(0xFFA3B8D0),
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 48),
                const SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ThreeBoxesLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 60;
    final paint = Paint()..style = PaintingStyle.fill;

    // Box 1 - Left (elevated)
    final box1Top = Paint()..color = const Color(0xFF4ADE80);
    final box1Side = Paint()..color = const Color(0xFF16A34A);

    // Front face
    final path1Front = Path()
      ..moveTo(2 * scale, 11 * scale)
      ..lineTo(14 * scale, 8 * scale)
      ..lineTo(14 * scale, 25 * scale)
      ..lineTo(2 * scale, 28 * scale)
      ..close();
    canvas.drawPath(path1Front, box1Top);

    // Right face
    final path1Side = Path()
      ..moveTo(14 * scale, 8 * scale)
      ..lineTo(20 * scale, 5 * scale)
      ..lineTo(20 * scale, 22 * scale)
      ..lineTo(14 * scale, 25 * scale)
      ..close();
    canvas.drawPath(path1Side, box1Side);

    // Top face
    final path1Top = Path()
      ..moveTo(2 * scale, 11 * scale)
      ..lineTo(8 * scale, 8 * scale)
      ..lineTo(20 * scale, 5 * scale)
      ..lineTo(14 * scale, 8 * scale)
      ..close();
    canvas.drawPath(path1Top, box1Top..color = const Color(0xFF4ADE80).withOpacity(0.9));

    // Box 2 - Middle (most elevated)
    final box2Top = Paint()..color = const Color(0xFF34D399);
    final box2Side = Paint()..color = const Color(0xFF059669);

    final path2Front = Path()
      ..moveTo(10 * scale, 7 * scale)
      ..lineTo(22 * scale, 4 * scale)
      ..lineTo(22 * scale, 21 * scale)
      ..lineTo(10 * scale, 24 * scale)
      ..close();
    canvas.drawPath(path2Front, box2Top);

    final path2Side = Path()
      ..moveTo(22 * scale, 4 * scale)
      ..lineTo(28 * scale, 1 * scale)
      ..lineTo(28 * scale, 18 * scale)
      ..lineTo(22 * scale, 21 * scale)
      ..close();
    canvas.drawPath(path2Side, box2Side);

    final path2Top = Path()
      ..moveTo(10 * scale, 7 * scale)
      ..lineTo(16 * scale, 4 * scale)
      ..lineTo(28 * scale, 1 * scale)
      ..lineTo(22 * scale, 4 * scale)
      ..close();
    canvas.drawPath(path2Top, box2Top..color = const Color(0xFF34D399).withOpacity(0.9));

    // Box 3 - Right
    final box3Top = Paint()..color = const Color(0xFF86EFAC);
    final box3Side = Paint()..color = const Color(0xFF16A34A);

    final path3Front = Path()
      ..moveTo(18 * scale, 13 * scale)
      ..lineTo(30 * scale, 10 * scale)
      ..lineTo(30 * scale, 27 * scale)
      ..lineTo(18 * scale, 30 * scale)
      ..close();
    canvas.drawPath(path3Front, box3Top);

    final path3Side = Path()
      ..moveTo(30 * scale, 10 * scale)
      ..lineTo(36 * scale, 7 * scale)
      ..lineTo(36 * scale, 24 * scale)
      ..lineTo(30 * scale, 27 * scale)
      ..close();
    canvas.drawPath(path3Side, box3Side);

    final path3Top = Path()
      ..moveTo(18 * scale, 13 * scale)
      ..lineTo(24 * scale, 10 * scale)
      ..lineTo(36 * scale, 7 * scale)
      ..lineTo(30 * scale, 10 * scale)
      ..close();
    canvas.drawPath(path3Top, box3Top..color = const Color(0xFF86EFAC).withOpacity(0.9));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
