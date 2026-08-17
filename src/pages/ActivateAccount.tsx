import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import toast from "react-hot-toast";

import { useActivateAccountMutation } from "../services/appApi";

const activateSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ActivatePayload = z.infer<typeof activateSchema>;

const ActivateAccount = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [activateAccountApi] = useActivateAccountMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ActivatePayload>({
        resolver: zodResolver(activateSchema),
        defaultValues: { password: '', confirmPassword: '' }
    });

    const onSubmit = async (data: ActivatePayload) => {
        if (!token) {
            toast.error("Invalid or missing activation token.");
            return;
        }

        try {
            setIsLoading(true);
            await activateAccountApi({ token, password: data.password }).unwrap();
            
            toast.success("Account activated successfully. Please log in.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to activate account");
            console.error("Activation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md p-6">
                    <CardContent className="text-center">
                        <Typography variant="h5" color="error" gutterBottom>
                            Invalid Activation Link
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            The activation link is missing or invalid. Please check your email for the correct link.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate("/login")}>
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md p-6">
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Box sx={{ mb: 4, textAlign: "center" }}>
                            <div className="w-16 h-16 bg-primary rounded-xl mb-4 flex items-center justify-center shadow-sm mx-auto">
                                <span className="text-white font-bold text-2xl">ERP</span>
                            </div>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }} className="text-gray-900" gutterBottom>
                                Activate Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please set a password for your account
                            </Typography>
                        </Box>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="new-password"
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
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
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
                                                aria-label="toggle confirm password visibility"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                            {isLoading ? <CircularProgress size={26} color="inherit" /> : "Activate Account"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ActivateAccount;
