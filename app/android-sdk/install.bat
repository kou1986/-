@echo off
set ANDROID_HOME=Z:\android-sdk
set SDK_ROOT=Z:\android-sdk
echo Y | Z:\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat --sdk_root=Z:\android-sdk platforms;android-34 build-tools;34.0.0 platform-tools
