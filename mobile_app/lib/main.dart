import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ThreeBoxesJobsApp());
}

class ThreeBoxesJobsApp extends StatelessWidget {
  const ThreeBoxesJobsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '3 Boxes Jobs',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: MaterialColor(0xFF014217, {
          50: const Color(0xFFE8F5E9),
          100: const Color(0xFFC8E6C9),
          200: const Color(0xFFA5D6A7),
          300: const Color(0xFF81C784),
          400: const Color(0xFF66BB6A),
          500: const Color(0xFF04A331),
          600: const Color(0xFF066722),
          700: const Color(0xFF014217),
          800: const Color(0xFF013514),
          900: const Color(0xFF012A10),
        }),
        primaryColor: const Color(0xFF014217),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF04A331),
          primary: const Color(0xFF014217),
          secondary: const Color(0xFF04A331),
          tertiary: const Color(0xFFF26405),
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF014217),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          selectedItemColor: Color(0xFF04A331),
          unselectedItemColor: Color(0xFF66789C),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
        ),
      ),
      home: const AppInitializer(),
    );
  }
}

class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  bool _showSplash = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    setState(() {
      _isLoggedIn = token != null && token.isNotEmpty;
    });

    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _showSplash = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return const SplashScreen();
    }
    if (_isLoggedIn) {
      return const MainNavigation();
    }
    return const LoginScreen();
  }
}
