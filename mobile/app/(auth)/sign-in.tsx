import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { WealthTrekLogo } from '@/components/WealthTrekLogo';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [error, setError] = useState('');
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [code, setCode] = useState('');

  const onOAuthPress = useCallback(async (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_github') => {
    if (!isLoaded) return;
    setOauthLoading(strategy);
    setError('');

    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId) {
        await ssoSetActive!({ session: createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'OAuth sign in failed');
    } finally {
      setOauthLoading('');
    }
  }, [isLoaded, startSSOFlow]);

  const onSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeedsSecondFactor(true);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDark ? '#0f1115' : '#f7f8fa';
  const textColor = isDark ? '#e8eaf0' : '#1a1e24';
  const mutedColor = isDark ? '#8b9099' : '#64748b';
  const cardBg = isDark ? '#1a1e24' : '#ffffff';
  const inputBg = isDark ? '#1e2228' : '#eef0f4';
  const borderColor = isDark ? '#252a32' : '#d8dde5';
  const primaryColor = isDark ? '#6ba3b8' : '#1a6b8a';
  const primaryFg = isDark ? '#0f1115' : '#ffffff';
  const destructiveColor = isDark ? '#ef4444' : '#dc2626';

  if (needsSecondFactor) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: bgColor }}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ marginBottom: 32, alignItems: 'center' }}>
            <WealthTrekLogo size={40} color={primaryColor} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 30, fontWeight: '700', color: textColor, textAlign: 'center' }}>
              Verify Email
            </Text>
            <Text style={{ textAlign: 'center', marginTop: 8, color: mutedColor }}>
              Enter the verification code sent to {email}
            </Text>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, borderColor, borderWidth: 1 }}>
            {error ? (
              <Text style={{ color: destructiveColor, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
            ) : null}

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                  style={{ flex: 1, color: textColor, fontSize: 18, textAlign: 'center', letterSpacing: 4 }}
                  placeholder="000000"
                  placeholderTextColor={mutedColor}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={onVerifySecondFactor}
              disabled={loading || code.length < 6}
              style={{ backgroundColor: primaryColor, paddingVertical: 16, borderRadius: 12, alignItems: 'center', opacity: code.length < 6 ? 0.5 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color={primaryFg} />
              ) : (
                <Text style={{ fontWeight: '600', color: primaryFg, fontSize: 16 }}>
                  Verify & Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: bgColor }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
        <View style={{ marginBottom: 32, alignItems: 'center' }}>
          <WealthTrekLogo size={40} color={primaryColor} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 30, fontWeight: '700', color: textColor, textAlign: 'center' }}>
            Welcome Back
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 8, color: mutedColor }}>
            Sign in to continue tracking your wealth
          </Text>
        </View>

        <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, borderColor, borderWidth: 1 }}>
          {error ? (
            <Text style={{ color: destructiveColor, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={() => onOAuthPress('oauth_google')}
            disabled={!!oauthLoading}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: inputBg, paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
          >
            {oauthLoading === 'oauth_google' ? (
              <ActivityIndicator color={textColor} />
            ) : (
              <Text style={{ fontWeight: '600', color: textColor, fontSize: 15 }}>
                Continue with Google
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onOAuthPress('oauth_apple')}
            disabled={!!oauthLoading}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: inputBg, paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
          >
            {oauthLoading === 'oauth_apple' ? (
              <ActivityIndicator color={textColor} />
            ) : (
              <Text style={{ fontWeight: '600', color: textColor, fontSize: 15 }}>
                Continue with Apple
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
            <Text style={{ marginHorizontal: 12, color: mutedColor, fontSize: 13 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Mail size={20} color={mutedColor} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: textColor }}
                placeholder="Email"
                placeholderTextColor={mutedColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Lock size={20} color={mutedColor} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: textColor }}
                placeholder="Password"
                placeholderTextColor={mutedColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={mutedColor} />
                ) : (
                  <Eye size={20} color={mutedColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={onSignIn}
            disabled={loading}
            style={{ backgroundColor: primaryColor, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
          >
            {loading ? (
              <ActivityIndicator color={primaryFg} />
            ) : (
              <Text style={{ fontWeight: '600', color: primaryFg, fontSize: 16 }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ color: mutedColor }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{ fontWeight: '600', color: primaryColor }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
