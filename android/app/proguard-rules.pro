# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Keep line numbers for readable crash reports in Play Console
# (the mapping file is bundled into the AAB automatically).
-keepattributes SourceFile,LineNumberTable

# @capacitor/background-runner: the native JS engine (libandroid_js_engine.so)
# looks up these classes and methods by name via JNI and ships no keep rules.
-keep class io.ionic.android_js_engine.** { *; }
-keep class io.ionic.backgroundrunner.** { *; }

# Capacitor reads @CapacitorPlugin/@Permission/@NativePlugin via reflection. Nothing in the app instantiates these
# annotation types, so R8 full mode assumes their values are always null and strips PluginHandle.pluginAnnotation,
# which crashes every permission check (e.g. BackgroundRunner.checkPermissions after login).
-keep @interface com.getcapacitor.annotation.** { *; }
-keep @interface com.getcapacitor.NativePlugin { *; }
-keep @interface com.getcapacitor.PluginMethod { *; }
