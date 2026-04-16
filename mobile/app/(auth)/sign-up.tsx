import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { WealthTrekLogo } from '@/components/WealthTrekLogo';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isDark } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const onSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

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

  if (pendingVerification) {
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
              Enter the code sent to {email}
            </Text>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, borderColor, borderWidth: 1 }}>
            {error ? (
              <Text style={{ color: destructiveColor, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
            ) : null}

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                  style={{ flex: 1, color: textColor }}
                  placeholder="Verification Code"
                  placeholderTextColor={mutedColor}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={onVerify}
              disabled={loading}
              style={{ backgroundColor: primaryColor, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color={primaryFg} />
              ) : (
                <Text style={{ fontWeight: '600', color: primaryFg, fontSize: 16 }}>
                  Verify
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
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 32, alignItems: 'center' }}>
          <WealthTrekLogo size={40} color={primaryColor} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 30, fontWeight: '700', color: textColor, textAlign: 'center' }}>
            Create Account
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 8, color: mutedColor }}>
            Start your wealth tracking journey
          </Text>
        </View>

        <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, borderColor, borderWidth: 1 }}>
          {error ? (
            <Text style={{ color: destructiveColor, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 8, backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <TextInput
                style={{ color: textColor }}
                placeholder="First Name"
                placeholderTextColor={mutedColor}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8, backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <TextInput
                style={{ color: textColor }}
                placeholder="Last Name"
                placeholderTextColor={mutedColor}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
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
            onPress={onSignUp}
            disabled={loading}
            style={{ backgroundColor: primaryColor, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
          >
            {loading ? (
              <ActivityIndicator color={primaryFg} />
            ) : (
              <Text style={{ fontWeight: '600', color: primaryFg, fontSize: 16 }}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ color: mutedColor }}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={{ fontWeight: '600', color: primaryColor }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
