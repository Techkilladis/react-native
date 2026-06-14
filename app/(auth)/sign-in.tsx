import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/expo';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import * as WebBrowser from 'expo-web-browser';

const SafeAreaView = styled(RNSafeAreaView);

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth strategies
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

  const handleSignIn = async () => {
    if (!signIn) return;
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.password({
        identifier: email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
      } else if (signIn.status === 'complete') {
        const finalizeResult = await signIn.finalize();
        if (finalizeResult.error) {
          setError(finalizeResult.error.message);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError(`Sign-in status incomplete: ${signIn.status}`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError('An error occurred during sign in');
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
      const errorMessage = err.errors?.[0]?.message || err.message || `An error occurred during ${strategy} login`;
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
          <Text className="auth-title mt-4">Welcome back</Text>
          <Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>

          {/* Form Card */}
          <View className="auth-card w-full">
            <View className="auth-form">
              
              {/* General Error */}
              {error && (
                <View className="mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <Text className="auth-error text-center">{error}</Text>
                </View>
              )}

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

              {/* Sign In Button */}
              <Pressable
                className={`auth-button ${loading ? 'auth-button-disabled' : ''}`}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>

              {/* Toggle Route Link */}
              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable>
                    <Text className="auth-link">Create an account</Text>
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

            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}