import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress,
    Card,
    CardContent
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email, ArrowBack } from "@mui/icons-material";
import toast from "react-hot-toast";

import { useLoginMutation, useVerifyOtpMutation, useResendOtpMutation } from "../services/appApi";
import { login } from "../store/slices/authSlice";

const OTP_LENGTH = 6;

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginPayload = z.infer<typeof loginSchema>;

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loginApi] = useLoginMutation();
    const [verifyOtpApi] = useVerifyOtpMutation();
    const [resendOtpApi] = useResendOtpMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // OTP state
    const [otpStep, setOtpStep] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [otpLoading, setOtpLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend OTP state
    const [timeLeft, setTimeLeft] = useState(300);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!otpStep || timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [otpStep, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginPayload>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginPayload) => {
        try {
            setIsLoading(true);
            const result = await loginApi(data).unwrap();

            if (result?.otpRequired) {
                setOtpEmail(result.email);
                setOtpStep(true);
                setTimeLeft(300);
                toast.success("OTP sent to your email.");
            } else {
                const { user, token } = result.data || result;
                dispatch(login({ user, token }));
                toast.success(`Successfully logged in as ${user.role}`);
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Login failed");
            console.error("Login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.slice(0, OTP_LENGTH).split("");
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                newOtp[i] = digit;
            });
            setOtp(newOtp);
            const nextEmpty = newOtp.findIndex((v) => !v);
            inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
        }
    };

    const handleOtpSubmit = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== OTP_LENGTH) return;

        try {
            setOtpLoading(true);
            const response = await verifyOtpApi({ email: otpEmail, otp: otpValue }).unwrap();
            const { user, token } = response.data || response;
            dispatch(login({ user, token }));
            toast.success("OTP verified successfully!");
            navigate("/");
        } catch (error: any) {
            toast.error(error?.data?.message || "OTP verification failed");
            console.error("OTP verification failed", error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setOtpStep(false);
        setOtp(Array(OTP_LENGTH).fill(""));
        setOtpEmail("");
    };

    const handleResendOtp = async () => {
        try {
            setResendLoading(true);
            await resendOtpApi({ email: otpEmail }).unwrap();
            setTimeLeft(300);
            toast.success("OTP resent successfully!");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to resend OTP");
            console.error("Failed to resend OTP", error);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-6">
                <CardContent>
                    {otpStep ? (
                        <Box>
                            <Box sx={{ mb: 4, textAlign: "center" }}>
                                <div className="w-16 h-16 bg-primary rounded-xl mb-4 flex items-center justify-center shadow-sm mx-auto">
                                    <span className="text-white font-bold text-2xl">ERP</span>
                                </div>
                                <Typography variant="h5" sx={{ fontWeight: "bold" }} className="text-gray-900" gutterBottom>
                                    Verify OTP
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    We've sent a 6-digit code to
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">
                                    {otpEmail}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1.5,
                                    mb: 4,
                                }}
                                onPaste={handleOtpPaste}
                            >
                                {otp.map((digit, index) => (
                                    <TextField
                                        key={index}
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        slotProps={{
                                            input: {
                                                sx: {
                                                    textAlign: "center",
                                                    fontSize: "1.5rem",
                                                    fontWeight: 700,
                                                    width: 48,
                                                    height: 56,
                                                    p: 0,
                                                },
                                            },
                                            htmlInput: {
                                                maxLength: 1,
                                                style: { textAlign: "center" },
                                                inputMode: "numeric",
                                            },
                                        }}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </Box>

                            <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {timeLeft > 0 ? (
                                        `Resend OTP in ${formatTime(timeLeft)}`
                                    ) : (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={handleResendOtp}
                                            disabled={resendLoading}
                                            sx={{ textTransform: "none", fontWeight: 600, p: 0 }}
                                        >
                                            {resendLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : "Resend OTP"}
                                        </Button>
                                    )}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={otpLoading || otp.join("").length !== OTP_LENGTH}
                                onClick={handleOtpSubmit}
                                sx={{ mt: 1, mb: 2, py: 1.5, fontSize: "1.1rem" }}
                            >
                                {otpLoading ? <CircularProgress size={26} color="inherit" /> : "Verify & Sign In"}
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                startIcon={<ArrowBack />}
                                onClick={handleBackToLogin}
                                sx={{ textTransform: "none" }}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Box sx={{ mb: 4, textAlign: "center" }}>
                                <div className="w-16 h-16 bg-primary rounded-xl mb-4 flex items-center justify-center shadow-sm mx-auto">
                                    <span className="text-white font-bold text-2xl">ERP</span>
                                </div>
                                <Typography variant="h5" sx={{ fontWeight: "bold" }} className="text-gray-900" gutterBottom>
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Please sign in to your account
                                </Typography>
                            </Box>

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                autoComplete="email"
                                autoFocus
                                {...register("email")}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                autoComplete="current-password"
                                {...register("password")}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={isLoading}
                                sx={{ mt: 2, mb: 2, py: 1.5, fontSize: "1.1rem" }}
                            >
                                {isLoading ? <CircularProgress size={26} color="inherit" /> : "Sign In"}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
