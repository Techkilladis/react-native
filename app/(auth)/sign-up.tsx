import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useSignUp, useOAuth } from '@clerk/expo';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import * as WebBrowser from 'expo-web-browser';

const SafeAreaView = styled(RNSafeAreaView);

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth strategies
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

  const handleSignUp = async () => {
    if (!signUp) return;
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.password({
        emailAddress: email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      const verifyResult = await signUp.verifications.sendEmailCode();
      if (verifyResult.error) {
        setError(verifyResult.error.message);
      } else {
        setVerifying(true);
      }
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (signUp.status === 'complete') {
        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) {
          setError(finalizeResult.error.message);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError(`Verification status incomplete: ${signUp.status}`);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!signUp) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) {
        setError(result.error.message);
      } else {
        setError('Verification code resent successfully!');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: 'google' | 'apple') => {
    setLoading(true);
    setError(null);

    try {
      const flow = strategy === 'google' ? startGoogleFlow : startAppleFlow;
      const { createdSessionId, setActive: setOAuthActive } = await flow();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      const errorMessage = err.errors?.[0]?.message || err.message || `An error occurred during ${strategy} sign up`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView className="auth-scroll" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="auth-content items-center justify-center">
          
          {/* Logo & Brand Block */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>
          </View>

          {/* Heading */}
          <Text className="auth-title mt-4">
            {verifying ? 'Verify account' : 'Create account'}
          </Text>
          <Text className="auth-subtitle">
            {verifying 
              ? 'Enter the code sent to your email to complete registration' 
              : 'Sign up to start managing your subscriptions'}
          </Text>

          {/* Form Card */}
          <View className="auth-card w-full">
            <View className="auth-form">
              
              {/* General Feedback Message / Error */}
              {error && (
                <View className={`mb-2 p-3 border rounded-xl ${error.includes('successfully') ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
                  <Text className={`text-center font-sans-medium text-xs ${error.includes('successfully') ? 'text-success' : 'text-destructive'}`}>{error}</Text>
                </View>
              )}

              {!verifying ? (
                // Sign Up Fields
                <>
                  {/* Email Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input ${error && error.toLowerCase().includes('email') ? 'auth-input-error' : ''}`}
                      value={email}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!loading}
                    />
                  </View>

                  {/* Password Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${error && error.toLowerCase().includes('password') ? 'auth-input-error' : ''}`}
                      value={password}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  {/* Register Button */}
                  <Pressable
                    className={`auth-button ${loading ? 'auth-button-disabled' : ''}`}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Create account</Text>
                    )}
                  </Pressable>

                  {/* Switch to Sign In Link */}
                  <View className="auth-link-row">
                    <Text className="auth-link-copy">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <Pressable>
                        <Text className="auth-link">Sign in</Text>
                      </Pressable>
                    </Link>
                  </View>

                  {/* Divider */}
                  <View className="auth-divider-row">
                    <View className="auth-divider-line" />
                    <Text className="auth-divider-text">or</Text>
                    <View className="auth-divider-line" />
                  </View>

                  {/* OAuth Buttons */}
                  <View className="gap-3">
                    <Pressable
                      className="auth-secondary-button flex-row justify-center items-center gap-2"
                      onPress={() => handleOAuth('google')}
                      disabled={loading}
                    >
                      <Text className="auth-secondary-button-text">Continue with Google</Text>
                    </Pressable>

                    <Pressable
                      className="auth-secondary-button flex-row justify-center items-center gap-2"
                      onPress={() => handleOAuth('apple')}
                      disabled={loading}
                    >
                      <Text className="auth-secondary-button-text">Continue with Apple</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                // Verification Code Fields
                <>
                  {/* Code Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={`auth-input ${error && error.toLowerCase().includes('code') ? 'auth-input-error' : ''}`}
                      value={code}
                      placeholder="Enter verification code"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      onChangeText={setCode}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  {/* Verify Button */}
                  <Pressable
                    className={`auth-button ${loading ? 'auth-button-disabled' : ''}`}
                    onPress={handleVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify account</Text>
                    )}
                  </Pressable>

                  {/* Resend Action */}
                  <Pressable
                    className="auth-secondary-button mt-2"
                    onPress={handleResend}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ea7a53" />
                    ) : (
                      <Text className="auth-secondary-button-text">Resend verification code</Text>
                    )}
                  </Pressable>

                  {/* Go Back / Start Over Link */}
                  <Pressable
                    className="items-center mt-3"
                    onPress={() => {
                      setVerifying(false);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    <Text className="auth-link">Start over</Text>
                  </Pressable>
                </>
              )}

            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}