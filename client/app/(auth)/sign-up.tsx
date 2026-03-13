import { COLORS } from "@/assets/constants";
import { useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
    const { signUp, errors, fetchStatus } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);

    const handleSubmit = async () => {
        if (!emailAddress || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in email and password'
            });
            return;
        }

        const { error } = await signUp.password({
            emailAddress,
            password,
            firstName,
            lastName,
        });

        if (error) {
            console.error(JSON.stringify(error, null, 2));
            Toast.show({
                type: 'error',
                text1: 'Failed to Sign Up',
                text2: "Something went wrong"
            });
            return;
        }

        if (!error) {
            await signUp.verifications.sendEmailCode();
            setPendingVerification(true);
        }
    };

    const handleVerify = async () => {
        if (!code) {
            Toast.show({
                type: 'error',
                text1: 'Missing Code',
                text2: 'Enter verification code'
            });
            return;
        }

        await signUp.verifications.verifyEmailCode({
            code,
        });

        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }

                    const url = decorateUrl('/');
                    if (url.startsWith('http')) {
                        window.location.href = url;
                    } else {
                        router.replace(url as Href);
                    }
                },
            });

            Toast.show({
                type: 'success',
                text1: 'Welcome!',
                text2: 'Your account has been created'
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: 'Please try again'
            });
        }
    };

    // Form xác thực email
    if (pendingVerification) {
        return (
            <SafeAreaView className="flex-1 bg-white" style={{ padding: 28 }}>
                {/* Nút quay lại */}
                <TouchableOpacity
                    onPress={() => setPendingVerification(false)}
                    className="absolute top-12 left-6 z-10"
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>

                {/* Header */}
                <View className="items-center mb-8 mt-8">
                    <Text className="text-3xl font-bold text-primary mb-2">
                        Verify Email
                    </Text>
                    <Text className="text-secondary text-center">
                        Enter the code sent to {emailAddress}
                    </Text>
                </View>

                {/* Input code */}
                <View className="mb-6">
                    <TextInput
                        className="w-full bg-surface p-4 rounded-xl text-primary text-center text-2xl tracking-widest"
                        placeholder="123456"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                        editable={fetchStatus !== "fetching"}
                    />
                    {errors?.fields?.code && (
                        <Text className="text-red-500 text-sm mt-1 text-center">
                            {errors.fields.code.message}
                        </Text>
                    )}
                </View>

                {/* Nút xác thực */}
                <TouchableOpacity
                    className={`w-full py-4 rounded-full items-center ${fetchStatus === "fetching" || !code ? "bg-gray-300" : "bg-primary"
                        }`}
                    onPress={handleVerify}
                    disabled={fetchStatus === "fetching" || !code}
                >
                    {fetchStatus === "fetching" ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Verify</Text>
                    )}
                </TouchableOpacity>

                {/* Nút gửi lại code */}
                <TouchableOpacity
                    className="mt-4"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                >
                    <Text className="text-primary text-center">Send code again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Form đăng ký chính
    return (
        <SafeAreaView className="flex-1 bg-white" style={{ padding: 28 }}>
            {/* Nút quay lại */}
            <TouchableOpacity
                onPress={() => router.push("/")} className="absolute top-12 left-6 z-10"
            >
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mb-8 mt-8">
                <Text className="text-3xl font-bold text-primary mb-2">
                    Create Account
                </Text>
                <Text className="text-secondary">Sign up to get started</Text>
            </View>

            {/* Hiển thị lỗi tổng quát nếu có */}
            {errors && Object.keys(errors.fields || {}).length > 0 && (
                <View className="bg-red-100 p-3 rounded-xl mb-4">
                    <Text className="text-red-600 text-center">
                        Please check your information
                    </Text>
                </View>
            )}

            {/* First Name */}
            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">First Name</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="John"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={fetchStatus !== "fetching"}
                />
            </View>

            {/* Last Name */}
            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">Last Name</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="Doe"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={fetchStatus !== "fetching"}
                />
            </View>

            {/* Email */}
            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">Email</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="user@example.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    editable={fetchStatus !== "fetching"}
                />
                {errors?.fields?.emailAddress && (
                    <Text className="text-red-500 text-sm mt-1">
                        {errors.fields.emailAddress.message}
                    </Text>
                )}
            </View>

            {/* Password */}
            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Password</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="********"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={fetchStatus !== "fetching"}
                />
                {errors?.fields?.password && (
                    <Text className="text-red-500 text-sm mt-1">
                        {errors.fields.password.message}
                    </Text>
                )}
            </View>

            {/* Nút đăng ký */}
            <TouchableOpacity
                className={`w-full py-4 rounded-full items-center mb-10 ${fetchStatus === "fetching" || !emailAddress || !password
                    ? "bg-gray-300"
                    : "bg-primary"
                    }`}
                onPress={handleSubmit}
                disabled={fetchStatus === "fetching" || !emailAddress || !password}
            >
                {fetchStatus === "fetching" ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white font-bold text-lg">Continue</Text>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center">
                <Text className="text-secondary">Already have an account? </Text>
                <Link href="/sign-in" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
            <View nativeID="clerk-captcha" />

        </SafeAreaView>
    );
}