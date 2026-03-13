import { COLORS } from "@/assets/constants";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import * as React from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
    const { signIn, errors, fetchStatus } = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [code, setCode] = React.useState("");
    const [showEmailCode, setShowEmailCode] = React.useState(false);

    // Xử lý đăng nhập
    const handleSubmit = async () => {
        const { error } = await signIn.password({
            emailAddress,
            password,
        });

        if (error) {
            console.error(JSON.stringify(error, null, 2));
            return;
        }

        if (signIn.status === "complete") {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }

                    const url = decorateUrl("/");
                    if (url.startsWith("http")) {
                        window.location.href = url;
                    } else {
                        router.push(url as Href);
                    }
                },
            });
        } else if (
            signIn.status === "needs_second_factor" ||
            signIn.status === "needs_client_trust"
        ) {
            // Kiểm tra xem có factor là email_code không
            const emailCodeFactor = signIn.supportedSecondFactors?.find(
                (factor) => factor.strategy === "email_code"
            );

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode();
                setShowEmailCode(true);
            }
        }
    };

    // Xử lý xác thực code
    const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({ code });

        if (signIn.status === "complete") {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }

                    const url = decorateUrl("/");
                    if (url.startsWith("http")) {
                        window.location.href = url;
                    } else {
                        router.push(url as Href);
                    }
                },
            });
        }
    };

    // Nếu đang ở chế độ xác thực 2 yếu tố
    if (showEmailCode) {
        return (
            <SafeAreaView className="flex-1 bg-white" style={{ padding: 28 }}>
                {/* Nút quay lại */}
                <TouchableOpacity
                    onPress={() => setShowEmailCode(false)}
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
                <Pressable
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
                </Pressable>

                {/* Nút gửi lại code */}
                <TouchableOpacity
                    className="mt-4"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                >
                    <Text className="text-primary text-center">Send code again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Form đăng nhập chính
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
                    Welcome Back
                </Text>
                <Text className="text-secondary">Sign in to continue</Text>
            </View>

            {/* Hiển thị lỗi tổng quát nếu có */}
            {errors && Object.keys(errors.fields || {}).length > 0 && (
                <View className="bg-red-100 p-3 rounded-xl mb-4">
                    <Text className="text-red-600 text-center">
                        Please check your information
                    </Text>
                </View>
            )}

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
                {errors?.fields?.identifier && (
                    <Text className="text-red-500 text-sm mt-1">
                        {errors.fields.identifier.message}
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

            {/* Nút đăng nhập */}
            <Pressable
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
                    <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
            </Pressable>

            {/* Footer */}
            <View className="flex-row justify-center">
                <Text className="text-secondary">Do not have an account? </Text>
                <Link href="/sign-up" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">Sign up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}