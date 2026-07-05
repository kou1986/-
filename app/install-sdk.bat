@echo off
set ANDROID_HOME=M:\cursor projekt\app\android-sdk
set SDK_ROOT=M:\cursor projekt\app\android-sdk
echo Y | M:\cursor projekt\app\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat --sdk_root=M:\cursor projekt\app\android-sdk platforms;android-34 build-tools;34.0.0 platform-tools
